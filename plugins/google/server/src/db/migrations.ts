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

      table.text("avatar")
        .nullable();

      table.text("accessToken")
        .notNullable();
      table.text("refreshToken")
        .notNullable();
      table.integer("expiry")
        .notNullable();

      table.text("email")
        .notNullable();

      table.unique(["user", "email"]);
    });

    await knex.schema.createTable("File", (table: Knex.CreateTableBuilder): void => {
      helper.itemRef(table, "itemId")
        .notNullable()
        .unique()
        .primary();

      helper.idColumn(table, "accountId")
        .notNullable()
        .references("id")
        .inTable(helper.tableName("Account"))
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.text("fileId")
        .notNullable();

      table.text("name")
        .notNullable();

      table.text("description")
        .nullable();

      table.text("mimeType")
        .notNullable();

      table.text("url")
        .nullable();

      table.unique(["accountId", "fileId"]);
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("File");
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(): PluginDbMigration[] {
  return [
    new BaseMigration(),
  ];
}
