import type { PluginDbMigration, DbMigrationHelper, PluginKnex } from "@allthethings/types";
import type Knex from "knex";

abstract class Migration implements PluginDbMigration {
  public readonly abstract name: string;

  public constructor(protected readonly helper: DbMigrationHelper) {
  }

  public abstract up(knex: PluginKnex): Promise<void>;
  public abstract down(knex: PluginKnex): Promise<void>;
}

class BaseMigration extends Migration {
  public readonly name = "base";

  public async up(knex: PluginKnex): Promise<void> {
    await knex.schema.createTable("Account", (table: Knex.CreateTableBuilder): void => {
      this.helper.idColumn(table, "id")
        .notNullable()
        .unique()
        .primary();

      this.helper.userRef(table, "user")
        .notNullable();
      table.text("username")
        .notNullable();
      table.text("password")
        .nullable();
    });
  }

  public async down(knex: PluginKnex): Promise<void> {
    await knex.schema.dropTableIfExists("Account");
  }
}

export default function BuildMigrations(helper: DbMigrationHelper): Migration[] {
  return [
    new BaseMigration(helper),
  ];
}
