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

      helper.userRef(table, "user")
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

    await knex.schema.createTable("Bug", (table: Knex.CreateTableBuilder): void => {
      helper.itemRef(table, "itemId")
        .notNullable()
        .unique()
        .primary();

      helper.idColumn(table, "accountId")
        .notNullable()
        .references("id")
        .inTable(helper.tableName("Account"));
      table.integer("bugId")
        .notNullable();

      table.text("summary")
        .notNullable();

      table.unique(["accountId", "bugId"]);
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Bug");
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
