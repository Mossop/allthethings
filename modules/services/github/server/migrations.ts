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

        table.text("token").notNullable();

        table.text("user").notNullable();

        table.text("avatar").notNullable();
      },
    );

    await knex.schema.createTable(
      "Repository",
      (table: Knex.CreateTableBuilder): void => {
        helper.idColumn(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("nodeId").notNullable();

        table.text("owner").notNullable();

        table.text("name").notNullable();

        table.text("url").nullable();

        table.unique(["ownerId", "nodeId"]);
      },
    );

    await knex.schema.createTable(
      "Label",
      (table: Knex.CreateTableBuilder): void => {
        helper.idColumn(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Repository"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("nodeId").notNullable();

        table.text("name").notNullable();

        table.text("color").notNullable();

        table.text("url").nullable();

        table.unique(["ownerId", "nodeId"]);
      },
    );

    await knex.schema.createTable(
      "IssueLike",
      (table: Knex.CreateTableBuilder): void => {
        helper.itemRef(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Repository"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("type").notNullable();

        table.text("nodeId").notNullable();

        table.integer("number").notNullable();

        table.text("title").notNullable();

        table.text("url").nullable();

        table.text("state").nullable();

        table.unique(["ownerId", "nodeId"]);
      },
    );

    await knex.schema.createTable(
      "IssueLikeLabels",
      (table: Knex.CreateTableBuilder): void => {
        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Repository"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        helper
          .idColumn(table, "issueLike")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("IssueLike"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        helper
          .idColumn(table, "label")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Label"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.unique(["issueLike", "label"]);
      },
    );

    await knex.schema.createTable(
      "Search",
      (table: Knex.CreateTableBuilder): void => {
        helper.idColumn(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("name").notNullable();

        table.text("query").notNullable();
      },
    );
  }

  public async down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("Search");
    await knex.schema.dropTableIfExists("IssueLikeLabels");
    await knex.schema.dropTableIfExists("IssueLike");
    await knex.schema.dropTableIfExists("Label");
    await knex.schema.dropTableIfExists("Repository");
    await knex.schema.dropTableIfExists("Account");
  }
}

class OwnerIdMigration implements ServiceDbMigration {
  public readonly name = "ownerId";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(
      "Repository",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "Label",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "repositoryId");
      },
    );

    await knex.schema.alterTable(
      "IssueLike",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "repositoryId");
      },
    );

    await knex.schema.alterTable(
      "IssueLikeLabels",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "repositoryId");
      },
    );

    await knex.schema.alterTable(
      "Search",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );
  }
}

export default function BuildMigrations(): ServiceDbMigration[] {
  return [new BaseMigration(), new OwnerIdMigration()];
}
