import type { Knex } from "knex";

export function id(table: Knex.CreateTableBuilder): void {
  table.text("id")
    .notNullable()
    .unique()
    .primary();
}

export function itemId(table: Knex.CreateTableBuilder): void {
  table.text("id")
    .notNullable()
    .unique()
    .primary()
    .references("Item.id")
    .onDelete("CASCADE")
    .onUpdate("CASCADE");
}
