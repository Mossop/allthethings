import path from "path";

import type { Knex } from "knex";

import type { DbMigration } from "#server/utils";

class ModuleMigration implements DbMigration {
  protected module: unknown | undefined;
  public readonly name: string;

  public constructor(protected readonly spec: string, name?: string) {
    this.name = name ?? path.basename(spec);
  }

  protected async loadModule(): Promise<Knex.Migration> {
    if (!this.module) {
      this.module = await import(this.spec);
    }

    return this.module as Knex.Migration;
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

export const databaseMigrations = [
  new ModuleMigration("./init", "Init"),
  new ModuleMigration("./noDefaultContext", "No Default Context"),
  new ModuleMigration("./services", "Plugin -> Service"),
];
