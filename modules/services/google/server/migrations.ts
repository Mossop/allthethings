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

        table.text("avatar").nullable();

        table.text("accessToken").notNullable();
        table.text("refreshToken").notNullable();
        table.integer("expiry").notNullable();

        table.text("email").notNullable();

        table.unique(["userId", "email"]);
      },
    );

    await knex.schema.createTable(
      "File",
      (table: Knex.CreateTableBuilder): void => {
        helper.itemRef(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("fileId").notNullable();

        table.text("name").notNullable();

        table.text("description").nullable();

        table.text("mimeType").notNullable();

        table.text("url").nullable();

        table.unique(["ownerId", "fileId"]);
      },
    );

    await knex.schema.createTable(
      "Label",
      (table: Knex.CreateTableBuilder): void => {
        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("id").notNullable();

        table.text("name").notNullable();

        table.unique(["ownerId", "id"]);
      },
    );

    await knex.schema.createTable(
      "Thread",
      (table: Knex.CreateTableBuilder): void => {
        helper.itemRef(table, "id").notNullable().unique().primary();

        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("threadId").notNullable();

        table.text("subject").notNullable();

        table.boolean("unread").notNullable();

        table.boolean("starred").notNullable();

        table.unique(["ownerId", "threadId"]);
      },
    );

    await knex.schema.createTable(
      "ThreadLabel",
      (table: Knex.CreateTableBuilder): void => {
        helper
          .idColumn(table, "ownerId")
          .notNullable()
          .references("id")
          .inTable(helper.tableName("Account"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.text("threadId").notNullable();

        table.text("labelId").notNullable();

        table.unique(["ownerId", "threadId"]);
        table
          .foreign(["ownerId", "threadId"])
          .references(["ownerId", "threadId"])
          .inTable(helper.tableName("Thread"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        table.unique(["ownerId", "labelId"]);
        table
          .foreign(["ownerId", "labelId"])
          .references(["ownerId", "id"])
          .inTable(helper.tableName("Label"))
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
      },
    );

    await knex.schema.createTable(
      "MailSearch",
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
    await knex.schema.dropTableIfExists("MailSearch");
    await knex.schema.dropTableIfExists("ThreadLabel");
    await knex.schema.dropTableIfExists("Thread");
    await knex.schema.dropTableIfExists("File");
    await knex.schema.dropTableIfExists("Label");
    await knex.schema.dropTableIfExists("Account");
  }
}

class OptionalRefresh implements ServiceDbMigration {
  public readonly name = "optional-refresh";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(
      "Account",
      (table: Knex.CreateTableBuilder): void => {
        table.text("refreshToken").nullable().alter();
      },
    );
  }
}

class OwnerIdMigration implements ServiceDbMigration {
  public readonly name = "ownerId";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(
      "File",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "Label",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "Thread",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "ThreadLabel",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );

    await knex.schema.alterTable(
      "MailSearch",
      (table: Knex.CreateTableBuilder): void => {
        table.renameColumn("ownerId", "accountId");
      },
    );
  }
}

class ThreadLabelUnique implements ServiceDbMigration {
  public readonly name = "threadLabelUnique";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(
      "ThreadLabel",
      (table: Knex.CreateTableBuilder): void => {
        table.unique(["threadId", "labelId"]);
      },
    );
  }
}

export default function BuildMigrations(): ServiceDbMigration[] {
  return [
    new BaseMigration(),
    new OptionalRefresh(),
    new OwnerIdMigration(),
    new ThreadLabelUnique(),
  ];
}