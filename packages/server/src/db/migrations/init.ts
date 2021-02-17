import type { default as Knex } from "knex";

function id(table: Knex.CreateTableBuilder): void {
  table.text("id")
    .notNullable()
    .unique()
    .primary();
}

function itemId(table: Knex.CreateTableBuilder): void {
  table.text("id")
    .notNullable()
    .unique()
    .primary()
    .references("Item.id")
    .onDelete("CASCADE")
    .onUpdate("CASCADE");
}

export async function up(knex: Knex): Promise<void> {
  await down(knex);

  await knex.schema.createTable("User", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("email")
      .notNullable()
      .unique();
    table.text("password")
      .notNullable();
  });

  await knex.schema.createTable("Context", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("userId")
      .notNullable()
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

    table.text("contextId")
      .notNullable()
      .references("Context.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("parentId")
      .nullable();
    table.text("name")
      .notNullable();

    table.unique(["contextId", "id"]);

    table.foreign(["contextId", "parentId"])
      .references(["contextId", "id"])
      .inTable("Project")
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

    table.text("ownerId")
      .notNullable()
      .references("Project.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("index")
      .notNullable();
    table.text("name")
      .notNullable();
  });

  await knex.raw(`
    ALTER TABLE ?? ADD UNIQUE (??, ??) DEFERRABLE INITIALLY IMMEDIATE`, [
    "Section",
    "ownerId",
    "index",
  ]);

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
    table.unique(["ownerId", "stub"]);
  });

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (
      (:index: < 0)
      OR
      (:name: <> '' AND :owner: <> :id: AND :index: >= 0)
    )`, {
    table: "Section",
    id: "id",
    owner: "ownerId",
    name: "name",
    index: "index",
  });

  await knex.schema.createTable("Item", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("ownerId")
      .notNullable()
      .references("Section.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.integer("index")
      .notNullable();
    table.text("summary")
      .notNullable();
    table.text("type")
      .notNullable();
    table.timestamp("created", { useTz: true })
      .notNullable()
      .defaultTo("now");
    table.boolean("archived")
      .notNullable()
      .defaultTo(false);
  });

  await knex.raw(`
    ALTER TABLE ?? ADD UNIQUE (??, ??) DEFERRABLE INITIALLY IMMEDIATE`, [
    "Item",
    "ownerId",
    "index",
  ]);

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (:index: >= 0)`, {
    table: "Item",
    index: "index",
  });

  await knex.schema.createTable("TaskItem", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("link")
      .nullable();
    table.timestamp("due", { useTz: true })
      .nullable();
    table.timestamp("done", { useTz: true })
      .nullable();
  });

  await knex.schema.createTable("LinkItem", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("link")
      .notNullable();
    table.text("icon")
      .nullable();
  });

  await knex.schema.createTable("NoteItem", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("note")
      .notNullable();
  });

  await knex.schema.createTable("FileItem", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("filename")
      .notNullable();
    table.text("path")
      .notNullable();
    table.text("mimetype")
      .notNullable();
    table.integer("size")
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("SectionItem");
  await knex.schema.dropTableIfExists("FileItem");
  await knex.schema.dropTableIfExists("NoteItem");
  await knex.schema.dropTableIfExists("LinkItem");
  await knex.schema.dropTableIfExists("TaskItem");
  await knex.schema.dropTableIfExists("Item");
  await knex.schema.dropTableIfExists("Section");
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("Context");
  await knex.schema.dropTableIfExists("User");
}
