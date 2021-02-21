import type Knex from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";

import type {
  PluginDbMigration,
  DbMigrationHelper,
  ServerPlugin,
  ServerPluginExport,
  PluginKnex,
} from "@allthethings/types";
import { resolvePlugin } from "@allthethings/utils";

import type { DbMigration } from "./db/migration";
import { DbMigrationSource } from "./db/migration";

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

class WrappedKnex implements PluginKnex {
  public constructor(private readonly knex: Knex, private readonly dbSchema: string) {
  }

  public get schema(): Knex.SchemaBuilder {
    return this.knex.schema.withSchema(this.dbSchema);
  }
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
    return this.migration.up(new WrappedKnex(knex, this.schema));
  }

  public async down(knex: Knex): Promise<void> {
    if (this.migration.down) {
      await this.migration.down(new WrappedKnex(knex, this.schema));
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
        getMigrationSource(plugin.id, plugin.getDbMigrations(migrationHelper)),
      );
    }
  }

  public async rollbackDbMigrations(knex: Knex, all: boolean = false): Promise<void> {
    for (let plugin of this.plugins) {
      if (!plugin.getDbMigrations) {
        continue;
      }

      await knex.migrate.rollback(
        getMigrationSource(plugin.id, plugin.getDbMigrations(migrationHelper)),
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
