import type { Knex } from "knex";

import type { PluginDbMigration, DbMigrationHelper, PluginKnex } from "#server-utils";

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

      table.text("token")
        .notNullable();

      table.text("user")
        .notNullable();

      table.text("avatar")
        .notNullable();
    });

    await knex.schema.createTable("IssueLike", (table: Knex.CreateTableBuilder): void => {
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

      table.text("type")
        .notNullable();

      table.text("nodeId")
        .notNullable();

      table.integer("number")
        .notNullable();

      table.text("title")
        .notNullable();

      table.text("url")
        .nullable();

      table.text("repositoryOwner")
        .notNullable();

      table.text("repositoryName")
        .nullable();

      table.unique(["ownerId", "nodeId"]);
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
