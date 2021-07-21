import type { Knex } from "knex";
import { knex } from "knex";
import { DateTime } from "luxon";
import { types } from "pg";

import { DbMigrationSource } from "#server/utils";

import type { DatabaseConfig } from "./config";
import { databaseMigrations } from "./migrations";
import { ServiceManager } from "./services";

export function parseDate(val: string): DateTime {
  return DateTime.fromSQL(val).toUTC();
}

types.setTypeParser(types.builtins.INT8, BigInt);
types.setTypeParser(types.builtins.TIMESTAMPTZ, parseDate);

export function connect(config: DatabaseConfig): Knex {
  let auth = `${config.username}:${config.password}`;
  let host = `${config.host}:${config.port}`;

  let knexConfig: Knex.Config = {
    client: "pg",
    asyncStackTraces: true,
    connection: `postgres://${auth}@${host}/${config.database}`,
  };

  return knex(knexConfig);
}

export async function migrate(knex: Knex): Promise<void> {
  await knex.raw("CREATE SCHEMA IF NOT EXISTS ??", ["public"]);

  let migrateConfig = {
    tableName: "allthethings_migrations",
    migrationSource: new DbMigrationSource(databaseMigrations),
  };

  await knex.migrate.latest(migrateConfig);
}

export async function rollback(knex: Knex): Promise<void> {
  await ServiceManager.rollbackDatabase(knex);
  await knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", ["public"]);
}
