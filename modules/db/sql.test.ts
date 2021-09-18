import { sql } from "./sql";

test("basic query", async (): Promise<void> => {
  let query = sql`SELECT "foo" from "bar" where "baz" = ${1}`;
  expect(query.parameters).toEqual([1]);
  expect(query.query).toBe(`SELECT "foo" from "bar" where "baz" = $1`);

  query = sql`SELECT ${sql.ref("foo")} from ${sql.ref("bar")} where ${sql.ref(
    "baz",
  )} = ${1}`;
  expect(query.parameters).toEqual([1]);
  expect(query.query).toBe(`SELECT "foo" from "bar" where "baz" = $1`);

  let subQuery = sql`SELECT "id" FROM "foo" WHERE "baz" = ${25}`;
  query = sql`SELECT ${sql.ref(
    "sub.*",
  )}, ${5} from (${subQuery}) AS "sub" WHERE "id" = ${67}`;
  expect(query.parameters).toEqual([5, 25, 67]);
  expect(query.query).toBe(
    `SELECT "sub".*, $1 from (SELECT "id" FROM "foo" WHERE "baz" = $2) AS "sub" WHERE "id" = $3`,
  );

  query = sql`SELECT * FROM "foo" WHERE "id" IN (${sql.join(
    [12, 42, 31],
    ",",
  )})`;
  expect(query.parameters).toEqual([12, 42, 31]);
  expect(query.query).toBe(`SELECT * FROM "foo" WHERE "id" IN ($1,$2,$3)`);
});
