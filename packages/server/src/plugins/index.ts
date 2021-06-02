import { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { Knex } from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";
import type { DateTime } from "luxon";

import type { ServerConfig } from "../config";
import type { Item } from "../db";
import { PluginDetail } from "../db";
import type { DatabaseConnection } from "../db/connection";
import { id } from "../db/connection";
import type { AppDataSources } from "../db/datasources";
import { ItemType } from "../db/types";
import type { ResolverContext } from "../schema/context";
import type { WebServer } from "../webserver";
import type { WebServerContext } from "../webserver/context";
import type { PluginKnex, TableRef } from "./db";
import { wrapKnex, getMigrationSource } from "./db";
import PluginInstance from "./instance";
import type {
  AuthedPluginContext,
  BasePluginItem,
  CreateBasePluginItem,
  PluginContext,
  PluginItemFields,
  PluginList,
  PluginTaskInfo,
  Resolver,
  TypeResolver,
} from "./types";

export function buildAuthedPluginContext(
  plugin: PluginInstance,
  dataSources: AppDataSources,
  userId: string,
): AuthedPluginContext {
  let pluginContext = buildPluginContext(plugin, dataSources);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.create(pluginContext, {
    userId: {
      get(): string {
        return userId;
      },
    },
  });
}

export function buildPluginContext(
  plugin: PluginInstance,
  dataSources: AppDataSources,
): PluginContext {
  let db = dataSources.users.connection;

  return {
    get baseUrl(): URL {
      let { protocol, hostname, port } = plugin.serverConfig;

      return new URL(`${protocol}://${hostname}:${port}/`);
    },

    get pluginUrl(): URL {
      let { protocol, hostname, port } = plugin.serverConfig;

      return new URL(`${protocol}://${hostname}:${port}/plugin/${plugin.schema}/`);
    },

    settingsPageUrl(page: string): URL {
      let url = new URL(`settings/${page}`, this.baseUrl);
      url.searchParams.set("plugin", plugin.id);
      return url;
    },

    get knex(): PluginKnex {
      return wrapKnex(db.knex, plugin.schema);
    },

    get userTableRef(): TableRef {
      return db.knex.ref("User").withSchema("public");
    },

    id(): Promise<string> {
      return id();
    },

    tableRef(name: string): TableRef {
      return db.knex.ref(name).withSchema(plugin.schema);
    },

    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
    table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]> {
      return this.knex.table(this.tableRef(name));
    },

    async createItem(
      userId: string,
      { due, done, controller, ...item }: CreateBasePluginItem,
    ): Promise<BasePluginItem> {
      let user = await dataSources.users.getImpl(userId);
      if (!user) {
        throw new Error("Unknown user.");
      }

      let inbox = await user.inbox();

      let itemImpl = await dataSources.items.create(inbox, {
        ...item,
        type: ItemType.Plugin,
      });

      if (done !== undefined && controller == TaskController.Plugin) {
        await dataSources.taskInfo.create(itemImpl, {
          due: due ?? null,
          done,
          controller,
        });
      } else if (controller == TaskController.Manual) {
        await dataSources.taskInfo.create(itemImpl, {
          due: due ?? null,
          done: null,
          controller,
        });
      }

      await dataSources.pluginDetail.create(itemImpl, {
        pluginId: plugin.id,
        hasTaskState: done !== undefined,
        taskDone: done ?? null,
      });

      return itemImpl.forPlugin();
    },

    async getItem(id: string): Promise<BasePluginItem | null> {
      let item = await dataSources.items.getImpl(id);
      return item?.forPlugin() ?? null;
    },

    async setItemTaskDone(id: string, done: DateTime | null): Promise<void> {
      let item = await dataSources.items.getImpl(id);
      if (!item) {
        throw new Error("Unknown item.");
      }

      let detail = await item.detail();
      if (!(detail instanceof PluginDetail)) {
        throw new Error("Unknown item.");
      }

      if (!await detail.hasTaskState()) {
        return;
      }

      await dataSources.pluginDetail.updateOne(id, {
        taskDone: done,
      });

      let existing = await item.taskInfo();
      if (!existing || await existing.controller() != TaskController.Plugin) {
        return;
      }

      return dataSources.taskInfo.setItemTaskInfo(item, {
        done,
        controller: TaskController.Plugin,
      });
    },

    async addList(list: PluginList): Promise<string> {
      return dataSources.pluginList.addList(plugin.id, list);
    },

    async updateList(id: string, list: Partial<PluginList>): Promise<void> {
      return dataSources.pluginList.updateList(plugin.id, id, list);
    },

    async deleteList(id: string): Promise<void> {
      return dataSources.pluginList.deleteList(plugin.id, id);
    },
  };
}

function wrapResolverContext(
  plugin: PluginInstance,
  context: ResolverContext,
): AuthedPluginContext {
  if (!context.userId) {
    throw new Error("Not logged in.");
  }

  return buildAuthedPluginContext(plugin, context.dataSources, context.userId);
}

function wrapResolver(
  plugin: PluginInstance,
  resolver: Resolver<AuthedPluginContext>,
): Resolver<ResolverContext> {
  let wrapped: Resolver<ResolverContext> = {};

  for (let [type, typeResolver] of Object.entries(resolver)) {
    let wrappedTypeResolver: TypeResolver<ResolverContext> = {};
    wrapped[type] = wrappedTypeResolver;

    for (let [fn, resolverFn] of Object.entries(typeResolver)) {
      wrappedTypeResolver[fn] = (
        parent: unknown,
        args: unknown,
        context: ResolverContext,
      ): unknown => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return resolverFn.call(typeResolver, parent, args, wrapResolverContext(plugin, context));
      };
    }
  }

  return wrapped;
}

class PluginManager {
  private readonly plugins: Set<PluginInstance> = new Set();

  private withAll<T>(caller: (plugin: PluginInstance) => Promise<T>): Promise<T[]> {
    return Promise.all(Array.from(this.plugins, caller));
  }

  private async filteredAll<T, D extends T>(
    caller: (plugin: PluginInstance) => Promise<T>,
    filter: (val: T) => val is D,
  ): Promise<D[]> {
    let results = await this.withAll(caller);
    return results.filter(filter);
  }

  public getPlugin(id: string): PluginInstance {
    for (let plugin of this.plugins) {
      if (plugin.id == id) {
        return plugin;
      }
    }

    throw new Error(`Item from unknown plugin ${id}`);
  }

  public async editItem(
    dataSources: AppDataSources,
    item: Item,
    newItem: Omit<BasePluginItem, "id" | "taskInfo">,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.editItem(
      buildPluginContext(plugin, dataSources),
      await item.forPlugin(),
      newItem,
    );
  }

  public async editTaskInfo(
    dataSources: AppDataSources,
    item: Item,
    taskInfo: PluginTaskInfo | null,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.editTaskInfo(
      buildPluginContext(plugin, dataSources),
      await item.forPlugin(),
      taskInfo,
    );
  }

  public async deleteItem(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.deleteItem(
      buildPluginContext(plugin, dataSources),
      await item.forPlugin(),
    );
  }

  public async getItemFields(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<PluginItemFields> {
    let plugin = this.getPlugin(pluginId);
    return plugin.getItemFields(buildPluginContext(plugin, dataSources), await item.forPlugin());
  }

  public async getClientScripts(ctx: Koa.Context): Promise<string[]> {
    let scripts = await this.withAll(
      async (plugin: PluginInstance): Promise<string[]> => {
        let scripts = await plugin.getClientScripts(ctx);
        return scripts.map((script: string): string => {
          if (script.startsWith("/") && !script.startsWith("//")) {
            return `/plugin/${plugin.schema}${script}`;
          }

          return script;
        });
      },
    );

    let first = scripts.shift() ?? [];
    return first.concat(...scripts);
  }

  public async applyDbMigrations(knex: Knex): Promise<void> {
    await this.withAll(async (plugin: PluginInstance): Promise<void> => {
      let migrations = await plugin.getDbMigrations();
      if (!migrations.length) {
        return;
      }

      await knex.migrate.latest(
        getMigrationSource(plugin.schema, migrations),
      );
    });
  }

  public async rollbackDbMigrations(knex: Knex, all: boolean = false): Promise<void> {
    await this.withAll(async (plugin: PluginInstance): Promise<void> => {
      let migrations = await plugin.getDbMigrations();
      if (!migrations.length) {
        return;
      }

      await knex.migrate.rollback(
        getMigrationSource(plugin.schema, migrations),
        all,
      );
    });
  }

  public async getSchemas(): Promise<string[]> {
    let isString = (val: string | null): val is string => !!val;
    return this.filteredAll(
      (plugin: PluginInstance): Promise<string | null> => plugin.getSchema(),
      isString,
    );
  }

  public async getResolvers(): Promise<Resolver<ResolverContext>[]> {
    let isResolver = (val: Resolver<ResolverContext> | null): val is Resolver<ResolverContext> => {
      return !!val;
    };

    return this.filteredAll(
      async (plugin: PluginInstance): Promise<Resolver<ResolverContext> | null> => {
        let resolver = await plugin.getResolvers();
        if (resolver) {
          return wrapResolver(plugin, resolver);
        }
        return null;
      },
      isResolver,
    );
  }

  public async registerServerMiddleware(app: WebServer): Promise<void> {
    await this.withAll(async (plugin: PluginInstance): Promise<void> => {
      let middleWare = (
        ctx: Koa.ParameterizedContext<Koa.DefaultState, WebServerContext>,
        next: Koa.Next,
      ): Promise<unknown> => {
        return plugin.webMiddleware(ctx, next);
      };

      app.use(koaMount("/plugin/" + plugin.schema, middleWare));
    });
  }

  public async createItemFromURL(
    context: ResolverContext,
    url: URL,
    isTask: boolean,
  ): Promise<Item | null> {
    for (let plugin of this.plugins) {
      let result = await plugin.createItemFromURL(
        wrapResolverContext(plugin, context),
        url,
        isTask,
      );
      if (result) {
        let item = await context.dataSources.items.getImpl(result);
        if (item) {
          return item;
        }
      }
    }

    return null;
  }

  private async loadPlugin(
    db: DatabaseConnection,
    spec: string,
    serverConfig: ServerConfig,
  ): Promise<void> {
    let instance = new PluginInstance(spec, db, serverConfig);
    try {
      await instance.init();
      this.plugins.add(instance);
    } catch (e) {
      console.error(`Failed to initialize plugin ${spec}`, e);
    }
  }

  public async loadPlugins(
    db: DatabaseConnection,
    serverConfig: ServerConfig,
  ): Promise<void> {
    let startupPromises: Promise<void>[] = [];

    for (let spec of Object.keys(serverConfig.plugins)) {
      startupPromises.push(this.loadPlugin(db, spec, serverConfig));
    }

    await Promise.all(startupPromises);
  }

  public async startPlugins(): Promise<void> {
    await Promise.all(
      Array.from(this.plugins, (plugin: PluginInstance): Promise<void> => plugin.startup()),
    );
  }
}

export default new PluginManager();
