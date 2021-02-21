import type { DbMigrationHelper } from "@allthethings/types";
import type { default as Knex, Migration, MigrationSource } from "knex";

abstract class DbMigration implements Migration {
  public readonly abstract name: string;

  public constructor(protected readonly helper: DbMigrationHelper) {
  }

  public abstract up(knex: Knex): Promise<void>;
  public abstract down(knex: Knex): Promise<void>;
}

class BaseMigration extends DbMigration {
  public readonly name = "base";

  public async up(knex: Knex): Promise<void> {
    await knex.schema.createTable("BugzillaAccount", (table: Knex.CreateTableBuilder): void => {
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

  public async down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("BugzillaAccount");
  }
}

export default class DbMigrationSource implements MigrationSource<DbMigration> {
  private _migrations: DbMigration[] | undefined;
  public constructor(private readonly helper: DbMigrationHelper) {
  }

  private get migrations(): DbMigration[] {
    if (!this._migrations) {
      this._migrations = [
        new BaseMigration(this.helper),
      ];
    }

    return this._migrations;
  }

  public async getMigrations(): Promise<DbMigration[]> {
    return this.migrations;
  }

  public getMigrationName(migration: DbMigration): string {
    return migration.name;
  }

  public getMigration(migration: DbMigration): Migration {
    return migration;
  }
}
