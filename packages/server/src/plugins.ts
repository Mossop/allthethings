import type Knex from "knex";
import type Koa from "koa";
import koaMount from "koa-mount";

import type { DbMigrationHelper, ServerPlugin, ServerPluginExport } from "@allthethings/types";
import { resolvePlugin } from "@allthethings/utils";

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
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  },
};

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

      let migrateConfig = {
        tableName: `${plugin.id}_migrations`,
        migrationSource: plugin.getDbMigrations(migrationHelper),
      };

      await knex.migrate.latest(migrateConfig);
    }
  }

  public async rollbackDbMigrations(knex: Knex, all: boolean = false): Promise<void> {
    for (let plugin of this.plugins) {
      if (!plugin.getDbMigrations) {
        continue;
      }

      let migrateConfig = {
        tableName: `${plugin.id}_migrations`,
        migrationSource: plugin.getDbMigrations(migrationHelper),
      };

      await knex.migrate.rollback(migrateConfig, all);
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
