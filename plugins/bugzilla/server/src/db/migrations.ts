import type { PluginDbMigration, DbMigrationHelper, PluginKnex } from "@allthethings/server";
import type Knex from "knex";

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
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
