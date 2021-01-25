import type { default as Knex } from "knex";

function id(table: Knex.CreateTableBuilder): void {
  table.text("id").notNullable().unique().primary();
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("Project");
  await knex.schema.dropTableIfExists("NamedContext");
  await knex.schema.dropTableIfExists("User");

  await knex.schema.createTable("User", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("email").notNullable();
    table.text("password").notNullable();
  });

  await knex.schema.createTable("NamedContext", (table: Knex.CreateTableBuilder): void => {
    id(table);

    table.text("stub").notNullable();
    table.text("name").notNullable();

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

    table.text("user").notNullable();
    table.foreign("user", "foreign_User")
      .references("User.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("parent").nullable();
    table.foreign("parent", "foreign_Project")
      .references("Project.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("namedContext").nullable();
    table.foreign("namedContext", "foreign_NamedContext")
      .references("NamedContext.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}
