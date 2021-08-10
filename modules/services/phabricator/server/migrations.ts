import type { Knex } from "knex";

import type { DbMigrationHelper, ServiceDbMigration } from "#server/utils";

class BaseMigration implements ServiceDbMigration {
  public readonly name = "base";

  public async up(knex: Knex, helper: DbMigrationHelper): Promise<void> {
    await knex.schema.createTable(
      "Account",
      (table: Knex.CreateTableBuilder): void => {
        helper.idColumn(table, "id").notNullable().unique().primary();

        helper.userRef(table, "userId").notNullable();

        table.text("phid").notNullable();

        table.text("email").notNullable();

        table.text("url").notNullable();

        table.text("apiKey").notNullable();

        table.text("icon").nullable();

        table.text("userIcon").notNullable();

        table.unique(["url", "phid"]);
      },
    );

    await knex.schema.createTable(
      "Query",
      (table: Knex.CreateTableBuilder): void => {
        helper.listRef(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("queryId").notNullable();

        table.unique(["ownerId", "queryId"]);
      },
    );

    await knex.schema.createTable(
      "Revision",
      (table: Knex.CreateTableBuilder): void => {
        helper.itemRef(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.integer("revisionId").notNullable();

        table.text("title").notNullable();

        table.text("uri").notNullable();

        table.text("status").notNullable();
      },
    );
  }

  public async down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("Revision");
    await knex.schema.dropTableIfExists("Query");
    await knex.schema.dropTableIfExists("Account");
  }
}

class OwnerIdMigration implements ServiceDbMigration {
  public readonly name = "ownerId";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(
      "Query",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "Revision",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );
  }
}

export default function BuildMigrations(): ServiceDbMigration[] {
  return [new BaseMigration(), new OwnerIdMigration()];
}
