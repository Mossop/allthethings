import type { Sql } from "./sql";
import { isSql, sql } from "./sql";

class WhereClause<T> {
  private dummy: T | undefined = undefined;

  public constructor(
    protected readonly builder: (column: string, inverted: boolean) => Sql,
  ) {}

  public toSql(column: string, inverted: boolean = false): Sql {
    return this.builder(column, inverted);
  }
}

export const IsNull = (): WhereClause<any> =>
  new WhereClause((column: string, inverted: boolean): Sql => {
    return sql`${sql.ref(column)} ${
      inverted ? sql.raw("IS NOT") : sql.raw("IS")
    } NULL`;
  });

function comparison(
  op: string,
  invertedOp: string,
): <T>(value: T) => WhereClause<T> {
  return <T>(value: T): WhereClause<T> =>
    new WhereClause<T>((column: string, inverted: boolean): Sql => {
      return sql`${sql.ref(column)} ${
        inverted ? sql.raw(invertedOp) : sql.raw(op)
      } ${value}`;
    });
}

export const Equals = comparison("=", "<>");
export const MoreThan = comparison(">", "<=");
export const MoreThanOrEqual = comparison(">=", "<");
export const LessThan = comparison("<", ">=");
export const LessThanOrEqual = comparison("<=", ">");

export const In = <T>(values: T[] | Sql): WhereClause<T> =>
  new WhereClause<T>((column: string, inverted: boolean): Sql => {
    let inClause = Array.isArray(values)
      ? sql`(${sql.join(values, ",")})`
      : sql`(${values})`;

    return sql`${sql.ref(column)} ${
      inverted ? sql.raw("NOT IN") : sql.raw("IN")
    } ${inClause}`;
  });

export const Not = <T>(value: T | WhereClause<T>): WhereClause<T> =>
  new WhereClause<T>((column: string, inverted: boolean): Sql => {
    return clause(value).toSql(column, !inverted);
  });

function clause<T>(value: T | WhereClause<T>): WhereClause<T> {
  if (value instanceof WhereClause) {
    return value;
  }

  return Equals(value);
}

export function insert(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
): Sql {
  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  if (rows.length == 0) {
    throw new Error("No rows to insert");
  }

  let columns = Object.keys(rows[0]);
  if (columns.length == 0) {
    throw new Error("No columns to insert");
  }

  let columnRefs = columns.map((column: string): Sql => sql.ref(column));
  let values = rows.map((row: Record<string, unknown>): Sql => {
    let columnValues: unknown[] = [];
    for (let column of columns) {
      columnValues.push(row[column]);
    }

    return sql`(${sql.join(columnValues, ",")})`;
  });

  return sql`INSERT INTO ${sql.ref(table)} (${sql.join(
    columnRefs,
    ",",
  )}) VALUES ${sql.join(values, ",")}`;
}

export function upsert(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  keys: string[],
): Sql {
  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  if (rows.length == 0) {
    throw new Error("No rows to insert");
  }

  let indexColumns = keys.map((key: string) => sql.ref(key));
  let updateColumns = Object.keys(rows[0])
    .filter((column: string) => !keys.includes(column))
    .map(
      (column: string) =>
        sql`${sql.ref(column)} = ${sql.ref("excluded", column)}`,
    );

  return sql`${insert(table, rows)} ON CONFLICT (${sql.join(
    indexColumns,
    ", ",
  )}) DO UPDATE SET ${sql.join(updateColumns, ", ")}`;
}

export type WhereConditions<T> = Partial<{
  [K in keyof T]: T[K] | WhereClause<T[K]>;
}>;

export type Updates<T> = Partial<{
  [K in keyof T]: T[K] | Sql;
}>;

export function update<T>(
  table: string,
  values: Updates<T>,
  conditions?: WhereConditions<T>,
): Sql {
  let columns = Object.entries(values).map(
    ([key, val]: [string, unknown]): Sql => sql`${sql.ref(key)} = ${val}`,
  );

  let update = sql`UPDATE ${sql.ref(table)} SET ${sql.join(columns, ", ")}`;

  if (conditions) {
    return sql`${update} WHERE ${where(conditions)}`;
  } else {
    return update;
  }
}

export function where<T>(conditions: WhereConditions<T>): Sql {
  let clauses: Sql[] = [];
  for (let [column, value] of Object.entries(conditions)) {
    clauses.push(clause(value).toSql(column, false));
  }

  if (clauses.length == 0) {
    throw new Error("No clauses included.");
  } else if (clauses.length > 1) {
    return sql`(${sql.join(clauses, " AND ")})`;
  } else {
    return clauses[0];
  }
}

export function all<T>(conditions: (Sql | WhereConditions<T>)[]): Sql {
  let clauses = conditions.map((condition: Sql | WhereConditions<T>): Sql => {
    if (isSql(condition)) {
      return condition;
    }
    return where(condition);
  });

  if (clauses.length == 0) {
    throw new Error("No clauses included.");
  } else if (clauses.length > 1) {
    return sql`(${sql.join(clauses, " AND ")})`;
  } else {
    return clauses[0];
  }
}

export function any<T>(conditions: (Sql | WhereConditions<T>)[]): Sql {
  let clauses = conditions.map((condition: Sql | WhereConditions<T>): Sql => {
    if (isSql(condition)) {
      return condition;
    }
    return where(condition);
  });

  if (clauses.length == 0) {
    throw new Error("No clauses included.");
  } else if (clauses.length > 1) {
    return sql`(${sql.join(clauses, " OR ")})`;
  } else {
    return clauses[0];
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function values(name: string, values: object[]): Sql {
  if (!values.length) {
    throw new Error("Empty values are not supported.");
  }

  let keys = Object.keys(values[0]);

  let columns = keys.map((key: string): Sql => sql.ref(key));
  // eslint-disable-next-line @typescript-eslint/ban-types
  let rows = values.map((value: object): Sql => {
    let fields = keys.map((key: string): unknown => value[key] ?? null);

    return sql`(${sql.join(fields, ", ")})`;
  });

  return sql`
    (VALUES ${sql.join(rows, ", ")})
    AS
    ${sql.ref(name)} (${sql.join(columns, ", ")})
  `;
}
