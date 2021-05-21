import type { Knex } from "knex";

import type { DbMigration } from "../db/migration";
import { DbMigrationSource } from "../db/migration";

export type PluginKnex = Omit<Knex, "transaction">;

type CreateColumn = (table: Knex.CreateTableBuilder, column: string) => Knex.ColumnBuilder;

export type TableRef = Pick<Knex.Ref<string, {[K in string]: string}>, "as"> & Knex.Raw<string>;

export interface DbMigrationHelper {
  readonly idColumn: CreateColumn;
  readonly userRef: CreateColumn;
  readonly itemRef: CreateColumn;
  readonly listRef: CreateColumn;
  readonly tableName: (name: string) => string;
}

export interface PluginDbMigration {
  readonly name: string;

  readonly up: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
  readonly down?: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
}

class MigrationHelper implements DbMigrationHelper {
  public constructor(private readonly schema: string) {
  }

  public idColumn(table: Knex.CreateTableBuilder, column: string): Knex.ColumnBuilder {
    return table.text(column);
  }

  public userRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table.text(column)
      .references("id")
      .inTable("public.User")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public itemRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table.text(column)
      .references("id")
      .inTable("public.Item")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public listRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table.text(column)
      .references("id")
      .inTable("public.PluginList")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public tableName(name: string): string {
    return `${this.schema}.${name}`;
  }
}

export function wrapKnex(knex: Knex, dbSchema: string): PluginKnex {
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
    return this.migration.up(wrapKnex(knex, this.schema), new MigrationHelper(this.schema));
  }

  public async down(knex: Knex): Promise<void> {
    if (this.migration.down) {
      await this.migration.down(wrapKnex(knex, this.schema), new MigrationHelper(this.schema));
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

export function getMigrationSource(
  schema: string,
  migrations: PluginDbMigration[],
): Knex.MigratorConfig {
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
