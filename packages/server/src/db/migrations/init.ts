import type { default as Knex } from "knex";

function id(table: Knex.CreateTableBuilder): void {
  table.text("id").notNullable().unique().primary();
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("Section");
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("Context");
  await knex.schema.dropTableIfExists("User");

  await knex.schema.createTable("User", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("email").notNullable().unique();
    table.text("password").notNullable();
  });

  await knex.schema.createTable("Context", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("userId").notNullable()
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("name").notNullable();
  });

  await knex.raw(`
    ALTER TABLE ??
      ADD COLUMN ?? text GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower(??), '[^a-z0-9]+', '-', 'g'))
      ) STORED
  `, [
    "Context",
    "stub",
    "name",
  ]);

  await knex.schema.alterTable("Context", (table: Knex.CreateTableBuilder): void => {
    table.unique(["userId", "stub"]);
  });

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (
      (:owner: = :id: AND :name: = '')
      OR
      (:owner: <> :id: AND :name: <> '')
    )`, {
    table: "Context",
    id: "id",
    owner: "userId",
    name: "name",
  });

  await knex.schema.createTable("Project", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("contextId").notNullable()
      .references("Context.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("parentId").nullable();
    table.text("name").notNullable();

    table.unique(["contextId", "id"]);

    table.foreign(["contextId", "parentId"])
      .references(["contextId", "id"]).inTable("Project")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE ??
      ADD COLUMN ?? text GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower(??), '[^a-z0-9]+', '-', 'g'))
      ) STORED
  `, [
    "Project",
    "stub",
    "name",
  ]);

  await knex.schema.alterTable("Project", (table: Knex.CreateTableBuilder): void => {
    table.unique(["parentId", "stub"]);
  });

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (
      (:name: = '' AND :owner: = :id: AND :parent: IS NULL)
      OR
      (:name: <> '' AND :owner: <> :id: AND :parent: IS NOT NULL)
    )`, {
    table: "Project",
    id: "id",
    owner: "contextId",
    name: "name",
    parent: "parentId",
  });

  await knex.schema.createTable("Section", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("projectId").notNullable()
      .references("Project.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("index").notNullable();
    table.text("name").notNullable();

    table.unique(["projectId", "index"]);
  });

  await knex.raw(`
    ALTER TABLE ??
      ADD COLUMN ?? text GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower(??), '[^a-z0-9]+', '-', 'g'))
      ) STORED
  `, [
    "Section",
    "stub",
    "name",
  ]);

  await knex.schema.alterTable("Section", (table: Knex.CreateTableBuilder): void => {
    table.unique(["projectId", "stub"]);
  });

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (
      (:name: = '' AND :parent: = :id: AND :index: = -1)
      OR
      (:name: <> '' AND :parent: <> :id: AND :index: > -1)
    )`, {
    table: "Section",
    id: "id",
    parent: "projectId",
    name: "name",
    index: "index",
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("Section");
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("Context");
  await knex.schema.dropTableIfExists("User");
}
