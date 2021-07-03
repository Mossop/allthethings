import type { Knex } from "knex";

export type Bindings = string[] | Record<string, string>;
function *bindings(bindings: Bindings): Iterable<[string, string]> {
  if (Array.isArray(bindings)) {
    for (let binding of bindings) {
      yield [binding, binding];
    }
  } else {
    yield* Object.entries(bindings);
  }
}

export async function updateFromTable(
  knex: Knex,
  targetTable: string,
  sourceTable: Knex.QueryBuilder,
  columnBindings: Bindings,
  matchBindings: string[] | Record<string, string> = ["id"],
): Promise<void> {
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
    whereBindings.push(col, `s.${source}`);
  }

  await knex.raw(`UPDATE ?? AS ?? SET ${setList.join(", ")} FROM ? WHERE ${whereList.join(", ")}`, [
    targetTable,
    "t",
    ...setBindings,
    sourceTable.as("s"),
    ...whereBindings,
  ]);
}

export async function insertFromTable(
  knex: Knex,
  targetTable: string,
  sourceTable: Knex.QueryBuilder,
  columns: string[],
): Promise<void> {
  let columnList: string[] = new Array(columns.length);
  columnList.fill("??", 0, columns.length);

  await knex.raw(`INSERT INTO ?? (${columnList.join(", ")}) ?`, [
    targetTable,
    ...columns,
    sourceTable,
  ]);
}
