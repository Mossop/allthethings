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

      table.text("phid")
        .notNullable();

      table.text("email")
        .notNullable();

      table.text("url")
        .notNullable();

      table.text("apiKey")
        .notNullable();

      table.text("icon")
        .notNullable();

      table.unique(["url", "phid"]);
    });

    await knex.schema.createTable("Query", (table: Knex.CreateTableBuilder): void => {
      helper.listRef(table, "id")
        .notNullable()
        .unique()
        .primary();

      helper.idColumn(table, "ownerId")
        .notNullable()
        .references("id")
        .inTable(helper.tableName("Account"))
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.text("queryId")
        .notNullable();

      table.unique(["ownerId", "queryId"]);
    });

    await knex.schema.createTable("Revision", (table: Knex.CreateTableBuilder): void => {
      helper.itemRef(table, "id")
        .notNullable()
        .unique()
        .primary();

      helper.idColumn(table, "ownerId")
        .notNullable()
        .references("id")
        .inTable(helper.tableName("Account"))
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.integer("revisionId")
        .notNullable();

      table.text("title")
        .notNullable();

      table.text("uri")
        .notNullable();

      table.text("status")
        .notNullable();
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Revision");
    await knex.schema.dropTableIfExists("Query");
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
