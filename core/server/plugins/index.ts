import { URL } from "url";

import type { Knex } from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";
import { DateTime } from "luxon";

import BugzillaPluginExport from "#plugins/bugzilla/server";
import GooglePluginExport from "#plugins/google/server";
import JiraPluginExport from "#plugins/jira/server";
import PhabricatorPluginExport from "#plugins/phabricator/server";
import { TaskController } from "#schema";
import type {
  PluginKnex,
  TableRef,
  AuthedPluginContext,
  CreatePluginItemParams,
  PluginContext,
  PluginList,
  Problem,
  Resolver,
  TypeResolver,
  ServerPluginExport,
} from "#server-utils";
import { isCallable } from "#utils";

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
import { wrapKnex, getMigrationSource } from "./db";
import PluginInstance from "./instance";

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
    get rootUrl(): URL {
      return plugin.serverConfig.rootUrl;
    },

    get pluginUrl(): URL {
      return new URL(`plugin/${plugin.schema}/`, this.rootUrl);
    },

    settingsPageUrl(page: string): URL {
      let url = new URL(`settings/${page}`, this.rootUrl);
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
      return db.knex.ref(name).withSchema(plugin.schema).as(name);
    },

    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
    table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]> {
      return this.knex.table(this.tableRef(name));
    },

    async createItem(
      userId: string,
      { due, done, controller, ...item }: CreatePluginItemParams,
    ): Promise<string> {
      let user = await dataSources.users.getImpl(userId);
      if (!user) {
        throw new Error("Unknown user.");
      }

      if (done === true) {
        done = DateTime.now();
      } else if (done === false) {
        done = null;
      }

      let itemImpl = await dataSources.items.create(user, null, {
        ...item,
        type: ItemType.Plugin,
      });

      await dataSources.pluginDetail.create(itemImpl, {
        pluginId: plugin.id,
        hasTaskState: done !== undefined,
        taskDone: done ?? null,
        taskDue: due ?? null,
      });

      if (done !== undefined && controller == TaskController.Plugin) {
        await dataSources.taskInfo.create(itemImpl, {
          due: due ?? null,
          manualDue: null,
          done,
          controller,
        });
      } else if (controller) {
        await dataSources.taskInfo.create(itemImpl, {
          due: null,
          manualDue: null,
          done: null,
          controller,
        });
      }

      return itemImpl.id();
    },

    async setItemTaskDone(
      id: string,
      done: DateTime | boolean | null,
      due: DateTime | undefined | null,
    ): Promise<void> {
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

      let currentDone = await detail.taskDone();
      if (done === true) {
        done = currentDone ?? DateTime.now();
      } else if (done === false) {
        done = null;
      }

      if (due === undefined) {
        due = await detail.taskDue();
      }

      await dataSources.pluginDetail.updateOne(id, {
        taskDone: done,
        taskDue: due,
      });

      let existing = await item.taskInfo();
      if (!existing || await existing.controller() != TaskController.Plugin) {
        return;
      }

      await dataSources.taskInfo.updateOne(id, {
        done,
        due: await existing.manualDue() ?? due,
        controller: TaskController.Plugin,
      });
    },

    async setItemSummary(id: string, summary: string): Promise<void> {
      await dataSources.items.updateOne(id, {
        summary,
      });
    },

    async disconnectItem(
      id: string,
      url: string | null = null,
      icon: string | null = null,
    ): Promise<void> {
      let item = await dataSources.items.getImpl(id);
      if (!item) {
        throw new Error("Unknown item.");
      }

      await dataSources.pluginDetail.delete(item.id());
      if (url) {
        await dataSources.items.updateOne(item.id(), {
          type: ItemType.Link,
        });
        item.refresh();

        await dataSources.linkDetail.create(item, {
          url,
          icon,
        });
      } else {
        await dataSources.items.updateOne(item.id(), {
          type: null,
        });
      }

      let taskInfo = await item.taskInfo();
      if (!taskInfo) {
        return;
      }

      if (await taskInfo.controller() != TaskController.Manual) {
        await dataSources.taskInfo.updateOne(id, {
          due: await taskInfo.manualDue(),
          controller: TaskController.Manual,
        });
      }
    },

    async deleteItem(id: string): Promise<void> {
      let item = await dataSources.items.getImpl(id);
      if (!item) {
        throw new Error("Unknown item.");
      }

      await item.delete();
    },

    async addList(list: PluginList): Promise<string> {
      return dataSources.pluginList.addList(plugin.id, list);
    },

    async updateList(id: string, list: Partial<PluginList>): Promise<void> {
      return dataSources.pluginList.updateList(plugin.id, id, list);
    },

    async deleteList(id: string): Promise<void> {
      await dataSources.pluginList.deleteList(plugin.id, id);
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

  private async withAll<T>(caller: (plugin: PluginInstance) => Promise<T>): Promise<T[]> {
    let results: T[] = [];
    for (let plugin of this.plugins) {
      results.push(await caller(plugin));
    }

    return results;
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

  public async deleteItem(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.deleteItem(buildPluginContext(plugin, dataSources), item.id());
  }

  public async getItemFields(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<unknown> {
    let plugin = this.getPlugin(pluginId);
    let pluginItem = await plugin.getPluginItem(buildPluginContext(plugin, dataSources), item.id());
    if (isCallable(pluginItem.fields)) {
      return pluginItem.fields();
    }
    return pluginItem.fields;
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
      if (all) {
        return knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", [plugin.schema]);
      }

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
    serverConfig: ServerConfig,
    pluginExport: ServerPluginExport,
  ): Promise<void> {
    let instance = new PluginInstance(db, serverConfig, pluginExport);
    try {
      await instance.init();
      this.plugins.add(instance);
    } catch (e) {
      console.error("Failed to initialize plugin", e);
    }
  }

  public async loadPlugins(
    db: DatabaseConnection,
    serverConfig: ServerConfig,
  ): Promise<void> {
    let startupPromises: Promise<void>[] = [];
    startupPromises.push(this.loadPlugin(db, serverConfig, BugzillaPluginExport));
    startupPromises.push(this.loadPlugin(db, serverConfig, GooglePluginExport));
    startupPromises.push(this.loadPlugin(db, serverConfig, JiraPluginExport));
    startupPromises.push(this.loadPlugin(db, serverConfig, PhabricatorPluginExport));

    await Promise.all(startupPromises);
  }

  public async startPlugins(): Promise<void> {
    await Promise.all(
      Array.from(this.plugins, (plugin: PluginInstance): Promise<void> => plugin.startup()),
    );
  }

  public async listProblems(
    dataSources: AppDataSources,
    userId: string | null,
  ): Promise<Problem[]> {
    let problems: Problem[] = [];
    for (let plugin of this.plugins) {
      let pluginProblems = await plugin.listProblems(
        buildPluginContext(plugin, dataSources),
        userId,
      );

      for (let problem of pluginProblems) {
        problems.push(problem);
      }
    }

    return problems;
  }
}

export default new PluginManager();
