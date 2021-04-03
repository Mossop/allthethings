import type { URL } from "url";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import type { Knex } from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";

import type { DatabaseConnection } from "../db/connection";
import { id } from "../db/connection";
import type { AppDataSources } from "../db/datasources";
import type { ResolverContext } from "../schema/context";
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

export interface PluginContext {
  readonly knex: PluginKnex;
  readonly userTableRef: TableRef;
  id(): Promise<string>;
  tableRef(name: string): TableRef;
  // eslint-disable-next-line @typescript-eslint/ban-types
  table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]>;
}

export interface GraphQLContext extends PluginContext {
  readonly userId: string | null;
}

export interface User {
  id: string;
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
  readonly getItemFields: (id: string) => Awaitable<PluginItemFields>;
  readonly handleURL?: (context: GraphQLContext, url: URL) => Awaitable<string | null>;
}

export interface PluginServer {
  withContext: <T>(task: (context: PluginContext) => Promise<T>) => Promise<T>;
}

export type ServerPluginExport = MaybeCallable<
  Awaitable<ServerPlugin>,
  [server: PluginServer, config: any]
>;

export function buildContext(
  plugin: PluginInstance,
  db: DatabaseConnection,
  _dataSources: AppDataSources,
): PluginContext {
  return {
    get knex(): PluginKnex {
      return wrapKnex(db.knex, plugin.id);
    },

    get userTableRef(): TableRef {
      return db.knex.ref("User").withSchema("public");
    },

    id(): Promise<string> {
      return id();
    },

    tableRef(name: string): TableRef {
      return db.knex.ref(name).withSchema(plugin.id);
    },

    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
    table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]> {
      return this.knex.table(this.tableRef(name));
    },
  };
}

function wrapResolverContext(plugin: PluginInstance, context: ResolverContext): GraphQLContext {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.create(buildContext(plugin, context.db, context.dataSources), {
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

  public async getItemFields(id: string, pluginId: string): Promise<PluginItemFields> {
    for (let plugin of this.plugins) {
      if (plugin.id == pluginId) {
        return plugin.getItemFields(id);
      }
    }

    throw new Error(`Item from unknown plugin ${pluginId}`);
  }

  public async getClientScripts(ctx: Koa.Context): Promise<string[]> {
    let scripts = await this.withAll(
      (plugin: PluginInstance): Promise<string[]> => plugin.getClientScripts(ctx),
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
        getMigrationSource(plugin.id, migrations),
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
        getMigrationSource(plugin.id, migrations),
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
        app.use(koaMount("/" + plugin.id, middleware));
      }
    });
  }

  public async handleURL(context: ResolverContext, url: URL): Promise<string | null> {
    for (let plugin of this.plugins) {
      let result = await plugin.handleURL(wrapResolverContext(plugin, context), url);
      if (result) {
        return result;
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
