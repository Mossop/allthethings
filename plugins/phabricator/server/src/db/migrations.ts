import type { PluginDbMigration, DbMigrationHelper, PluginKnex } from "@allthethings/server";
import type { Knex } from "knex";

class BaseMigration implements PluginDbMigration {
  public readonly name = "base";

  public async up(knex: PluginKnex, helper: DbMigrationHelper): Promise<void> {
    await knex.schema.createTable("Account", (table: Knex.CreateTableBuilder): void => {
      helper.idColumn(table, "id")
        .notNullable()
        .unique()
        .primary();

      helper.userRef(table, "userId")
        .notNullable();

      table.text("email")
        .notNullable();

      table.text("url")
        .notNullable();

      table.text("apiKey")
        .notNullable();

      table.text("icon")
        .notNullable();
    });

    await knex.schema.createTable("Query", (table: Knex.CreateTableBuilder): void => {
      helper.listRef(table, "id")
        .notNullable()
        .unique()
        .primary();

      helper.idColumn(table, "ownerId")
        .notNullable();

      table.text("queryId")
        .notNullable();

      table.unique(["ownerId", "query"]);
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Query");
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
