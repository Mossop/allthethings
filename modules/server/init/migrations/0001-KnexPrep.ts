import { Database, Migration, sql } from "#db";

export class Migration0001KnexPrep implements Migration {
  public name = "0001-Knex-Prep";

  public async up(db: Database): Promise<void> {
    let count = await db.value<number>(sql`
      SELECT COUNT(*)::integer
      FROM "information_schema"."tables"
      WHERE "table_schema"=${"public"} AND "table_name"=${"Item"}
    `);

    if (!count) {
      return;
    }

    await db.update(`ALTER SCHEMA "bugzilla" RENAME TO "old_bugzilla"`);
    await db.update(`ALTER SCHEMA "github" RENAME TO "old_github"`);
    await db.update(`ALTER SCHEMA "google" RENAME TO "old_google"`);
    await db.update(`ALTER SCHEMA "jira" RENAME TO "old_jira"`);
    await db.update(`ALTER SCHEMA "phabricator" RENAME TO "old_phabricator"`);
  }
}
