import type { Knex } from "knex";

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
      .nullable();
    table.timestamp("created", { useTz: true })
      .notNullable()
      .defaultTo("now");
    table.timestamp("archived", { useTz: true })
      .nullable();
    table.timestamp("snoozed", { useTz: true })
      .nullable();
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

  await knex.schema.createTable("TaskInfo", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.timestamp("due", { useTz: true })
      .nullable();
    table.timestamp("manualDue", { useTz: true })
      .nullable();
    table.timestamp("done", { useTz: true })
      .nullable();
    table.text("controller")
      .notNullable();
  });

  await knex.schema.createTable("LinkDetail", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("url")
      .notNullable();
    table.text("icon")
      .nullable();
  });

  await knex.schema.createTable("NoteDetail", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("note")
      .notNullable();
  });

  await knex.schema.createTable("FileDetail", (table: Knex.CreateTableBuilder): void => {
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

  await knex.schema.createTable("PluginDetail", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("pluginId")
      .notNullable();
    table.boolean("hasTaskState")
      .notNullable();
    table.timestamp("taskDone", { useTz: true })
      .nullable();
    table.timestamp("taskDue", { useTz: true })
      .nullable();

    table.unique(["id", "pluginId"]);
  });

  await knex.schema.createTable("PluginList", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("pluginId")
      .notNullable();
    table.text("name")
      .notNullable();
    table.text("url")
      .nullable();

    table.unique(["id", "pluginId"]);
  });

  await knex.schema.createTable("PluginListItems", (table: Knex.CreateTableBuilder): void => {
    table.text("pluginId")
      .notNullable();
    table.text("itemId")
      .notNullable();
    table.text("listId")
      .notNullable();
    table.boolean("present")
      .notNullable();
    table.timestamp("due", { useTz: true })
      .nullable();

    table.foreign(["pluginId", "itemId"])
      .references(["pluginId", "id"])
      .inTable("PluginDetail")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.foreign(["pluginId", "listId"])
      .references(["pluginId", "id"])
      .inTable("PluginList")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("PluginListItems");
  await knex.schema.dropTableIfExists("PluginList");
  await knex.schema.dropTableIfExists("PluginDetail");
  await knex.schema.dropTableIfExists("FileDetail");
  await knex.schema.dropTableIfExists("NoteDetail");
  await knex.schema.dropTableIfExists("LinkDetail");
  await knex.schema.dropTableIfExists("TaskInfo");
  await knex.schema.dropTableIfExists("Item");
  await knex.schema.dropTableIfExists("Section");
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("Context");
  await knex.schema.dropTableIfExists("User");
}
