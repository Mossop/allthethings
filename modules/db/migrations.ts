import type { Database } from "./client";
import type { Sql } from "./sql";
import { sql } from "./sql";

export interface MigrationConfig {
  readonly schema?: string;
  readonly table?: string;
  readonly migrations: readonly Migration[];
}

export interface Migration {
  readonly name: string;

  readonly up: (database: Database) => Promise<void>;
  readonly down?: (database: Database) => Promise<void>;
}

async function applyMigration(
  db: Database,
  tableRef: Sql,
  migration: Migration,
): Promise<void> {
  await migration.up(db);
  await db.update(
    sql`INSERT INTO ${tableRef} ("name", "timestamp") VALUES (${migration.name}, DEFAULT)`,
  );
}

async function rollbackMigration(
  db: Database,
  tableRef: Sql,
  migration: Migration,
): Promise<void> {
  if (migration.down) {
    await migration.down(db);
  }
  await db.update(
    sql`DELETE FROM ${tableRef} WHERE "name" = ${migration.name}`,
  );
}

export async function migrate(
  db: Database,
  { schema = "public", table = "migrations", migrations }: MigrationConfig,
): Promise<void> {
  await db.inTransaction(async (db: Database) => {
    let count = await db.value<number>(
      sql`
        SELECT COUNT(*)::integer
        FROM "information_schema"."tables"
        WHERE "table_schema" = ${schema} AND "table_name" = ${table}
      `,
    );

    let tableRef = sql.ref(`${schema}.${table}`);

    let applied: string[];
    if (count == 0) {
      if (migrations.length == 0) {
        return;
      }

      await db.update(sql`
        CREATE TABLE ${tableRef} (
          "name" text NOT NULL PRIMARY KEY,
          "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
      `);

      applied = [];
    } else {
      applied = await db.pluck(
        sql`SELECT "name" FROM ${tableRef} ORDER BY "timestamp" ASC`,
      );
    }

    if (applied.length > migrations.length) {
      throw new Error(
        "Database has more migrations applied than were in the configuration.",
      );
    }

    for (let i = 0; i < migrations.length; i++) {
      if (i < applied.length) {
        let { name } = migrations[i];
        if (applied[i] != name) {
          throw new Error(
            `Database has migration "${applied[i]}" applied when "${name}" was expected.`,
          );
        }
        continue;
      }

      await applyMigration(db, tableRef, migrations[i]);
    }
  });
}

export async function rollback(
  db: Database,
  { schema = "public", table = "migrations", migrations }: MigrationConfig,
): Promise<void> {
  await db.inTransaction(async (db: Database) => {
    let count = await db.value<number>(
      sql`
        SELECT COUNT(*)::integer
        FROM "information_schema"."tables"
        WHERE "table_schema" = ${schema} AND "table_name" = ${table}
      `,
    );

    if (count == 0) {
      return;
    }

    let tableRef = sql.ref(`${schema}.${table}`);

    let applied = await db.pluck<string>(
      sql`SELECT "name" FROM ${tableRef} ORDER BY "timestamp" ASC`,
    );

    if (applied.length > migrations.length) {
      throw new Error(
        "Database has more migrations applied than were in the configuration.",
      );
    }

    migrations = migrations.slice(0, applied.length);
    for (let i = migrations.length - 1; i >= 0; i--) {
      let { name } = migrations[i];
      if (applied[i] != name) {
        throw new Error(
          `Database has migration "${applied[i]}" applied when "${name}" was expected.`,
        );
      }

      await rollbackMigration(db, tableRef, migrations[i]);
    }

    await db.update(sql`DROP TABLE ${tableRef}`);
  });
}
