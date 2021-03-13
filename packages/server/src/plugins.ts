import { resolvePlugin } from "@allthethings/utils";
import type { Knex } from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";

import { id } from "./db/connection";
import type { DbMigration } from "./db/migration";
import { DbMigrationSource } from "./db/migration";
import type { ResolverContext } from "./schema/context";
import type {
  PluginDbMigration,
  DbMigrationHelper,
  ServerPlugin,
  ServerPluginExport,
  PluginKnex,
  PluginItemFields,
  Resolver,
  GraphQLContext,
  TypeResolver,
  TableRef,
} from "./types";

async function loadPlugin<C>(spec: string, config: C): Promise<ServerPlugin> {
  let { default: module } = await import(spec) as { default: ServerPluginExport };
  return resolvePlugin(module, config);
}

const migrationHelper: DbMigrationHelper = {
  idColumn: (table: Knex.CreateTableBuilder): Knex.ColumnBuilder => {
    return table.text("id");
  },

  userRef: (
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder => {
    return table.text(column)
      .references("id")
      .inTable("public.User")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  },

  itemRef: (
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder => {
    return table.text(column)
      .references("id")
      .inTable("public.Item")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  },
};

function wrapKnex(knex: Knex, dbSchema: string): PluginKnex {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.create(knex, {
    schema: {
      enumerable: true,
      configurable: false,
      get(): Knex.SchemaBuilder {
        return knex.schema.withSchema(dbSchema);
      },
    },

    transaction: {
      enumerable: false,
      configurable: false,
      get(): never {
        throw new Error("Plugins cannot access the transaction.");
      },
    },
  });
}

function wrapContext(plugin: ServerPlugin, context: ResolverContext): GraphQLContext {
  return {
    userId: context.userId,

    get knex(): PluginKnex {
      return wrapKnex(context.db.knex, plugin.id);
    },

    get userTableRef(): TableRef {
      return context.db.knex.ref("User").withSchema("public");
    },

    id(): Promise<string> {
      return id();
    },

    tableRef(name: string): TableRef {
      return context.db.knex.ref(name).withSchema(plugin.id);
    },

    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
    table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]> {
      return this.knex.table(this.tableRef(name));
    },
  };
}

function wrapResolver(
  plugin: ServerPlugin,
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
        return resolverFn.call(typeResolver, parent, args, wrapContext(plugin, context));
      };
    }
  }

  return wrapped;
}

class PluginMigration implements DbMigration {
  public constructor(
    private readonly schema: string,
    private readonly migration: PluginDbMigration,
  ) {
  }

  public get name(): string {
    return this.migration.name;
  }

  public up(knex: Knex): Promise<void> {
    return this.migration.up(wrapKnex(knex, this.schema), migrationHelper);
  }

  public async down(knex: Knex): Promise<void> {
    if (this.migration.down) {
      await this.migration.down(wrapKnex(knex, this.schema), migrationHelper);
    }
  }
}

class SchemaMigration implements DbMigration {
  public readonly name = "Schema";

  public constructor(private readonly schema: string) {
  }

  public async up(knex: Knex): Promise<void> {
    await knex.raw("CREATE SCHEMA ??", [this.schema]);
  }

  public async down(knex: Knex): Promise<void> {
    await knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", [this.schema]);
  }
}

function getMigrationSource(schema: string, migrations: PluginDbMigration[]): Knex.MigratorConfig {
  return {
    tableName: `${schema}_migrations`,
    migrationSource: new DbMigrationSource([
      new SchemaMigration(schema),
      ...migrations.map(
        (migration: PluginDbMigration): DbMigration => new PluginMigration(schema, migration),
      ),
    ]),
  };
}

class PluginManager {
  private readonly plugins: Set<ServerPlugin> = new Set();

  public async getItemFields(id: string, pluginId: string): Promise<PluginItemFields> {
    for (let plugin of this.plugins) {
      if (plugin.id == pluginId) {
        return plugin.getItemFields(id);
      }
    }

    throw new Error(`Item from unknown plugin ${pluginId}`);
  }

  public getClientScripts(ctx: Koa.Context): string[] {
    let scripts: string[][] = [];

    for (let plugin of this.plugins) {
      if (plugin.getClientScripts) {
        scripts.push(plugin.getClientScripts(ctx));
      }
    }

    let first = scripts.shift() ?? [];
    return first.concat(...scripts);
  }

  public async applyDbMigrations(knex: Knex): Promise<void> {
    for (let plugin of this.plugins) {
      if (!plugin.getDbMigrations) {
        continue;
      }

      await knex.migrate.latest(
        getMigrationSource(plugin.id, plugin.getDbMigrations()),
      );
    }
  }

  public async rollbackDbMigrations(knex: Knex, all: boolean = false): Promise<void> {
    for (let plugin of this.plugins) {
      if (!plugin.getDbMigrations) {
        continue;
      }

      await knex.migrate.rollback(
        getMigrationSource(plugin.id, plugin.getDbMigrations()),
        all,
      );
    }
  }

  public getSchemas(): Promise<string[]> {
    let promises: Promise<string>[] = [];

    for (let plugin of this.plugins) {
      if (plugin.getSchema) {
        promises.push(plugin.getSchema());
      }
    }

    return Promise.all(promises);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getResolvers(): Resolver<ResolverContext>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvers: Resolver<ResolverContext>[] = [];

    for (let plugin of this.plugins) {
      if (plugin.getResolvers) {
        resolvers.push(wrapResolver(plugin, plugin.getResolvers()));
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return resolvers;
  }

  public registerServerMiddleware(app: Koa): void {
    for (let plugin of this.plugins) {
      if (plugin.serverMiddleware) {
        app.use(koaMount("/" + plugin.id, plugin.serverMiddleware));
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async loadPlugins(pluginConfig: Record<string, any>): Promise<void> {
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(pluginConfig).map(async ([spec, config]: [string, any]): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let module = await loadPlugin<any>(spec, config);
        this.plugins.add(module);
      }),
    );
  }
}

export default new PluginManager();
