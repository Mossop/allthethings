import { DateTime } from "luxon";
import { types } from "pg";

export { connect, Database, Connection } from "./client";
export type { DatabaseConfig, Query, QueryInstance } from "./client";
export type { Migration, MigrationConfig } from "./migrations";
export { migrate, rollback } from "./migrations";
export { Sql, sql } from "./sql";
export * from "./operations";

function parseDate(val: string): DateTime {
  return DateTime.fromSQL(val).toUTC();
}

types.setTypeParser(types.builtins.INT8, BigInt);
types.setTypeParser(types.builtins.TIMESTAMP, parseDate);
types.setTypeParser(types.builtins.TIMESTAMPTZ, parseDate);
