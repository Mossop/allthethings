import type { Knex } from "knex";
import { customAlphabet } from "nanoid/async";

export interface DbMigration extends Knex.Migration {
  readonly name: string;
}

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const id = customAlphabet(ALPHABET, 28);

export async function max<Record, C extends keyof Record>(
  query: Knex.QueryBuilder,
  col: C,
): Promise<Record[C] | null> {
  let result: { max: Record[C] | null } | undefined = await query
    .max(col)
    .first();
  return result ? result.max : null;
}

export async function min<Record, C extends keyof Record>(
  query: Knex.QueryBuilder,
  col: C,
): Promise<Record[C] | null> {
  let result: { min: Record[C] | null } | undefined = await query
    .min(col)
    .first();
  return result ? result.min : null;
}

export async function count(query: Knex.QueryBuilder): Promise<number | null> {
  let result: { count: BigInt | null } | undefined = await query
    .count("*")
    .first();
  return result ? Number(result.count) : null;
}

export type Bindings = string[] | Record<string, string>;
function* bindings(bindings: Bindings): Iterable<[string, string]> {
  if (Array.isArray(bindings)) {
    for (let binding of bindings) {
      yield [binding, binding];
    }
  } else {
    yield* Object.entries(bindings);
  }
}

export async function updateFromTable<T = unknown>(
  knex: Knex,
  targetTable: string,
  sourceTable: Knex.QueryBuilder,
  columnBindings: Bindings,
  matchBindings: string[] | Record<string, string> = ["id"],
): Promise<T[]> {
  let setList: string[] = [];
  let setBindings: string[] = [];

  for (let [col, source] of bindings(columnBindings)) {
    setList.push("?? = ??");
    setBindings.push(col, `s.${source}`);
  }

  let whereList: string[] = [];
  let whereBindings: string[] = [];

  for (let [col, source] of bindings(matchBindings)) {
    whereList.push("?? = ??");
    whereBindings.push(`t.${col}`, `s.${source}`);
  }

  // @ts-ignore
  return knex.raw(
    `UPDATE ?? AS ?? SET ${setList.join(", ")} FROM ? WHERE ${whereList.join(
      ", ",
    )} RETURNING *`,
    [targetTable, "t", ...setBindings, sourceTable.as("s"), ...whereBindings],
  );
}

export async function insertFromTable<T = unknown>(
  knex: Knex,
  targetTable: string,
  sourceTable: Knex.QueryBuilder,
  columns: string[],
): Promise<T[]> {
  let columnList: string[] = new Array(columns.length);
  columnList.fill("??", 0, columns.length);

  // @ts-ignore
  return knex.raw(`INSERT INTO ?? (${columnList.join(", ")}) ? RETURNING *`, [
    targetTable,
    ...columns,
    sourceTable,
  ]);
}

export class DbMigrationSource implements Knex.MigrationSource<DbMigration> {
  public constructor(private readonly migrations: DbMigration[]) {}

  public async getMigrations(): Promise<DbMigration[]> {
    return this.migrations;
  }

  public getMigrationName(migration: DbMigration): string {
    return migration.name;
  }

  public getMigration(migration: DbMigration): Knex.Migration {
    return migration;
  }
}
