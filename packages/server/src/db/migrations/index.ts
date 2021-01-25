import path from "path";

import type { default as Knex, Migration, MigrationSource } from "knex";

interface DbMigration extends Migration {
  readonly name: string;
}

class ModuleMigration implements DbMigration {
  protected module: unknown | undefined;
  public readonly name: string;

  public constructor(protected readonly spec: string, name?: string) {
    this.name = name ?? path.basename(spec);
  }

  protected async loadModule(): Promise<Migration> {
    if (!this.module) {
      this.module = await import(this.spec);
    }

    return this.module as Migration;
  }

  public async up(knex: Knex): Promise<void> {
    let { up } = await this.loadModule();
    await up(knex);
  }

  public async down(knex: Knex): Promise<void> {
    let { down } = await this.loadModule();
    if (down) {
      await down(knex);
    }
  }
}

export default class DbMigrationSource implements MigrationSource<DbMigration> {
  private _migrations: DbMigration[] | undefined;

  private get migrations(): DbMigration[] {
    if (!this._migrations) {
      this._migrations = [
        new ModuleMigration("./init", "Init"),
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
