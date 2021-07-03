import type { Knex } from "knex";

import { id } from "../connection";
import { insertFromTable, updateFromTable } from "../utils";
import { itemId } from "./shared";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE :table: DROP CONSTRAINT :name:`, {
    table: "Context",
    name: "Context_check",
  });

  await knex.raw(`
      ALTER TABLE :table: DROP CONSTRAINT :name:`, {
    table: "Project",
    name: "Project_check",
  });

  let defaultContexts: string[] = await knex.from("Context").where("name", "").pluck("id");
  for (let contextId of defaultContexts) {
    let newId = await id();

    await knex("Context").where("id", contextId).update({
      id: newId,
      name: "Tasks",
    });

    await knex("Project").where("id", contextId).update({
      id: newId,
    });

    await knex("Section").where("id", contextId).update({
      id: newId,
    });
  }

  await knex.raw(`
      ALTER TABLE :table: ADD CHECK (
        :name: <> ''
      )`, {
    table: "Context",
    name: "name",
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

  await knex.schema.alterTable("Project", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .nullable();
  });

  await knex.schema.alterTable("Section", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .nullable();
  });

  await knex.schema.alterTable("Item", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .nullable()
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await updateFromTable(
    knex,
    "Project",
    knex.from("Context").select(["id", "userId"]),
    ["userId"],
    { contextId: "id" },
  );

  await updateFromTable(
    knex,
    "Section",
    knex.from("Project").select(["id", "userId"]),
    ["userId"],
    { ownerId: "id" },
  );

  await updateFromTable(
    knex,
    "Item",
    knex.from("Section").select(["id", "userId"]),
    ["userId"],
    { ownerId: "id" },
  );

  await knex.schema.alterTable("Context", (table: Knex.CreateTableBuilder): void => {
    table.unique(["id", "userId"]);
  });

  await knex.schema.alterTable("Project", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .notNullable()
      .alter();

    table.foreign(["contextId", "userId"])
      .references(["id", "userId"])
      .inTable("Context")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.unique(["id", "userId"]);
  });

  await knex.schema.alterTable("Section", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .notNullable()
      .alter();

    table.foreign(["ownerId", "userId"])
      .references(["id", "userId"])
      .inTable("Project")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.unique(["id", "userId"]);
  });

  await knex.schema.alterTable("Item", (table: Knex.CreateTableBuilder): void => {
    table.text("userId")
      .notNullable()
      .alter();

    table.unique(["id", "userId"]);
  });

  await knex.schema.createTable("SectionItems", (table: Knex.CreateTableBuilder): void => {
    itemId(table);

    table.text("userId")
      .notNullable();

    table.text("ownerId")
      .notNullable();

    table.integer("index")
      .notNullable();

    table.foreign(["ownerId", "userId"])
      .references(["id", "userId"])
      .inTable("Section")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.foreign(["id", "userId"])
      .references(["id", "userId"])
      .inTable("Item")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE ?? ADD UNIQUE (??, ??) DEFERRABLE INITIALLY IMMEDIATE`, [
    "SectionItems",
    "ownerId",
    "index",
  ]);

  await knex.raw(`
    ALTER TABLE :table: ADD CHECK (:index: >= 0)`, {
    table: "SectionItems",
    index: "index",
  });

  await insertFromTable(
    knex,
    "SectionItems",
    knex.from("Item").select(["id", "userId", "ownerId", "index"]),
    ["id", "userId", "ownerId", "index"],
  );

  await knex.schema.alterTable("Item", (table: Knex.CreateTableBuilder): void => {
    table.dropColumns("ownerId", "index");
  });

  await knex("Section").where("index", -2).delete();
}

export async function down(): Promise<void> {
  return;
}
