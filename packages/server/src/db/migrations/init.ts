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

    table.text("email").notNullable();
    table.text("password").notNullable();
  });

  await knex.schema.createTable("Context", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("stub").notNullable();
    table.text("name").notNullable();

    table.unique(["id", "user"]);
    table.unique(["user", "stub"]);

    table.text("user").notNullable();
    table.foreign("user", "foreign_User")
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Project", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("stub").notNullable();
    table.text("name").notNullable();

    table.unique(["id", "user", "context"]);
    table.unique(["user", "context", "stub"]);

    table.text("user").notNullable();
    table.foreign("user", "foreign_User")
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("context").nullable();
    table.foreign(["user", "context"], "foreign_Context")
      .references(["user", "id"]).inTable("Context")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("parent").nullable();
    table.foreign(["user", "context", "parent"], "foreign_Project")
      .references(["user", "context", "id"]).inTable("Project")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Section", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("name").notNullable();

    table.text("user").notNullable();
    table.foreign("user", "foreign_User")
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("context").nullable();
    table.foreign(["user", "context"], "foreign_Context")
      .references(["user", "id"]).inTable("Context")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("project").nullable();
    table.foreign(["user", "context", "project"], "foreign_Project")
      .references(["user", "context", "id"]).inTable("Project")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("Section");
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("Context");
  await knex.schema.dropTableIfExists("NamedContext");
  await knex.schema.dropTableIfExists("User");
}
