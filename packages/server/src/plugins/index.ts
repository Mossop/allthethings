import type { URL } from "url";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import type { Knex } from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";
import type { DateTime } from "luxon";

import type { Item } from "../db";
import type { DatabaseConnection } from "../db/connection";
import { id } from "../db/connection";
import type { AppDataSources } from "../db/datasources";
import { ItemType } from "../db/types";
import type { ResolverContext } from "../schema/context";
import type { TaskManager } from "../utils/tasks";
import type { PluginDbMigration, PluginKnex, TableRef } from "./db";
import { wrapKnex, getMigrationSource } from "./db";
import PluginInstance from "./instance";

export type ResolverFn<TContext = any, TResult = any, TParent = any, TArgs = any> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
) => Promise<TResult> | TResult;
export type TypeResolver<TContext> = Record<string, ResolverFn<TContext>>;
export type Resolver<TContext> = Record<string, TypeResolver<TContext>>;

export interface BasePluginItem {
  id: string;
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  taskInfo: PluginTaskInfo | null;
}

export type CreateBasePluginItem = Omit<BasePluginItem, "id">;

export interface PluginTaskInfo {
  due: DateTime | null;
  done: DateTime | null;
}

export interface PluginContext {
  readonly knex: PluginKnex;
  readonly userTableRef: TableRef;
  id(): Promise<string>;
  tableRef(name: string): TableRef;
  // eslint-disable-next-line @typescript-eslint/ban-types
  table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]>;
  createItem(user: string, props: CreateBasePluginItem): Promise<BasePluginItem>;
  getItem(id: string): Promise<BasePluginItem | null>;
  setItemTaskInfo(id: string, taskInfo: PluginTaskInfo | null): Promise<void>
}

export interface GraphQLContext extends PluginContext {
  readonly userId: string | null;
}

export interface User {
  id: () => string;
}

export interface PluginItemFields {
}

export type PluginField<R, A extends unknown[] = []> = MaybeCallable<Awaitable<R>, A>;

export interface ServerPlugin {
  readonly startup?: PluginField<void>;
  readonly schema?: PluginField<string>;
  readonly resolvers?: PluginField<Resolver<GraphQLContext>>;
  readonly middleware?: PluginField<Koa.Middleware>;
  readonly clientScripts?: PluginField<string[], [ctx: Koa.Context]>;
  readonly dbMigrations?: PluginField<PluginDbMigration[]>;
  readonly getItemFields: PluginField<
    PluginItemFields,
    [context: PluginContext, item: BasePluginItem]
  >;
  readonly deleteItem?: PluginField<void, [context: PluginContext, item: BasePluginItem]>;
  readonly createItemFromURL?: PluginField<
    string | null,
    [context: GraphQLContext, url: URL, isTask: boolean]
  >;
  readonly editItem?: PluginField<
    void,
    [context: PluginContext, item: BasePluginItem, newItem: Omit<BasePluginItem, "id" | "taskInfo">]
  >;
  readonly editTaskInfo?: PluginField<
    void,
    [context: PluginContext, item: BasePluginItem, taskInfo: PluginTaskInfo | null]
  >;
}

export interface PluginServer {
  withContext: <T>(task: (context: PluginContext) => Promise<T>) => Promise<T>;
  taskManager: TaskManager;
}

export type ServerPluginExport = MaybeCallable<
  Awaitable<ServerPlugin>,
  [server: PluginServer, config: any]
>;

export function buildContext(
  plugin: PluginInstance,
  dataSources: AppDataSources,
): PluginContext {
  let db = dataSources.users.connection;

  return {
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

    async createItem(userId: string, item: CreateBasePluginItem): Promise<BasePluginItem> {
      let user = await dataSources.users.getImpl(userId);
      if (!user) {
        throw new Error("Unknown user.");
      }

      let {
        taskInfo,
        ...itemInfo
      } = item;

      let inbox = await user.inbox();

      let itemImpl = await dataSources.items.create(inbox, {
        ...itemInfo,
        type: ItemType.Plugin,
      });

      if (taskInfo) {
        await dataSources.taskInfo.create(itemImpl, {
          ...taskInfo,
        });
      }

      await dataSources.pluginDetail.create(itemImpl, {
        pluginId: plugin.id,
      });

      return itemImpl.forPlugin();
    },

    async getItem(id: string): Promise<BasePluginItem | null> {
      let item = await dataSources.items.getImpl(id);
      return item?.forPlugin() ?? null;
    },

    async setItemTaskInfo(id: string, taskInfo: PluginTaskInfo | null): Promise<void> {
      let item = await dataSources.items.getImpl(id);
      if (!item) {
        throw new Error("Unknown item.");
      }

      return dataSources.taskInfo.setItemTaskInfo(item, taskInfo);
    },
  };
}

function wrapResolverContext(plugin: PluginInstance, context: ResolverContext): GraphQLContext {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.create(buildContext(plugin, context.dataSources), {
    userId: {
      value: context.userId,
      writable: false,
    },
  });
}

function wrapResolver(
  plugin: PluginInstance,
  resolver: Resolver<GraphQLContext>,
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
    return plugin.editItem(buildContext(plugin, dataSources), await item.forPlugin(), newItem);
  }

  public async editTaskInfo(
    dataSources: AppDataSources,
    item: Item,
    taskInfo: PluginTaskInfo | null,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.editTaskInfo(buildContext(plugin, dataSources), await item.forPlugin(), taskInfo);
  }

  public async deleteItem(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<void> {
    let plugin = this.getPlugin(pluginId);
    return plugin.deleteItem(buildContext(plugin, dataSources), await item.forPlugin());
  }

  public async getItemFields(
    dataSources: AppDataSources,
    item: Item,
    pluginId: string,
  ): Promise<PluginItemFields> {
    let plugin = this.getPlugin(pluginId);
    return plugin.getItemFields(buildContext(plugin, dataSources), await item.forPlugin());
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

  public async registerServerMiddleware(app: Koa): Promise<void> {
    await this.withAll(async (plugin: PluginInstance): Promise<void> => {
      let middleware = await plugin.getServerMiddleware();
      if (middleware) {
        app.use(koaMount("/plugin/" + plugin.schema, middleware));
      }
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

  public async loadPlugins(
    db: DatabaseConnection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pluginConfig: Record<string, any>,
  ): Promise<void> {
    let startupPromises: Promise<void>[] = [];

    for (let [spec, config] of Object.entries(pluginConfig)) {
      let instance = new PluginInstance(spec, db, config);
      this.plugins.add(instance);
      startupPromises.push(instance.init());
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
