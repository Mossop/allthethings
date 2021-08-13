import type { Knex } from "knex";
import { DateTime } from "luxon";

import { TaskController } from "#schema";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(
    "ServiceListItems",
    (table: Knex.CreateTableBuilder): void => {
      table.timestamp("done", { useTz: true }).nullable();
    },
  );

  let now = DateTime.now();

  await knex("ServiceListItems")
    .whereNull("present")
    .update({ present: now, done: now });

  await knex.schema.alterTable(
    "ServiceListItems",
    (table: Knex.CreateTableBuilder): void => {
      table.timestamp("present", { useTz: true }).notNullable().alter();

      table.unique(["listId", "itemId"]);
    },
  );

  await knex.schema.alterTable(
    "TaskInfo",
    (table: Knex.CreateTableBuilder): void => {
      table.timestamp("manualDone", { useTz: true }).nullable();
    },
  );

  await knex("TaskInfo")
    .where("controller", TaskController.Manual)
    .update("manualDone", knex.ref("done"));
}

export async function down(): Promise<void> {
  return;
}
