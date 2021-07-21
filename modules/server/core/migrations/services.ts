import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable("PluginDetail", "ServiceDetail");
  await knex.schema.renameTable("PluginList", "ServiceList");
  await knex.schema.renameTable("PluginListItems", "ServiceListItems");

  await knex.schema.alterTable("ServiceDetail", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("pluginId", "serviceId");
  });

  await knex.schema.alterTable("ServiceList", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("pluginId", "serviceId");
  });

  await knex.schema.alterTable("ServiceListItems", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("pluginId", "serviceId");
  });

  await knex.table("Item")
    .where("type", "plugin")
    .update({
      type: "service",
    });

  await knex.table("TaskInfo")
    .where("controller", "plugin")
    .update({
      controller: "service",
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable("ServiceDetail", "PluginDetail");
  await knex.schema.renameTable("ServiceList", "PluginList");
  await knex.schema.renameTable("ServiceListItems", "PluginListItems");

  await knex.schema.alterTable("PluginDetail", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("serviceId", "pluginId");
  });

  await knex.schema.alterTable("PluginList", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("serviceId", "pluginId");
  });

  await knex.schema.alterTable("PluginListItems", (table: Knex.CreateTableBuilder): void => {
    table.renameColumn("serviceId", "pluginId");
  });

  await knex.table("Item").where("type", "plugin").update({
    type: "service",
  });

  await knex.table("TaskInfo").where("controller", "plugin").update({
    controller: "service",
  });
}
