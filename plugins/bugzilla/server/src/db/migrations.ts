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

      table.text("name")
        .notNullable();

      table.text("url")
        .notNullable();

      table.text("username")
        .nullable();

      table.text("icon")
        .nullable();

      table.text("password")
        .nullable();
    });

    await knex.schema.createTable("Search", (table: Knex.CreateTableBuilder): void => {
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

      table.text("name")
        .notNullable();

      table.text("type")
        .notNullable();

      table.text("query")
        .notNullable();
    });

    await knex.schema.createTable("Bug", (table: Knex.CreateTableBuilder): void => {
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

      table.integer("bugId")
        .notNullable();

      table.text("summary")
        .notNullable();

      table.text("status")
        .notNullable();

      table.text("resolution")
        .nullable();

      table.unique(["ownerId", "bugId"]);
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Search");
    await knex.schema.dropTableIfExists("Bug");
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
