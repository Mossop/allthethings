import type { Database, Migration } from "../../../db";
import { sql } from "../../../db";

export class Migration0009ReducedQueries implements Migration {
  public name = "0009-ReducedQueries";

  public async up(db: Database): Promise<void> {
    await db.update(
      `ALTER TABLE "core"."ServiceDetail" ADD COLUMN "fields" jsonb`,
    );

    await db.update(
      `
        ALTER TABLE "bugzilla"."Bug"
          ADD COLUMN IF NOT EXISTS "done" TIMESTAMP WITH TIME ZONE,
          DROP COLUMN IF EXISTS "summary",
          DROP COLUMN IF EXISTS "status",
          DROP COLUMN IF EXISTS "resolution"
      `,
    );

    await db.update(
      `
        ALTER TABLE "github"."IssueLike"
          ADD COLUMN IF NOT EXISTS "accountId" text,
          ADD CONSTRAINT "GhIssueLike_FK_account" FOREIGN KEY ("accountId") REFERENCES "github"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `,
    );

    let repos = await db.query(
      `SELECT "id", "accountId" FROM "github"."Repository"`,
    );

    for (let { id, accountId } of repos) {
      await db.update(sql`
        UPDATE "github"."IssueLike" SET "accountId" = ${accountId} WHERE "repositoryId" = ${id}
      `);
    }

    await db.update(`DROP TABLE IF EXISTS "github"."IssueLikeLabel"`);
    await db.update(`DROP TABLE IF EXISTS "github"."Label"`);

    await db.update(
      `
        ALTER TABLE "github"."IssueLike"
          ALTER COLUMN "accountId" SET NOT NULL,
          DROP COLUMN IF EXISTS "repositoryId"
      `,
    );

    await db.update(`DROP TABLE IF EXISTS "github"."Repository"`);

    await db.update(
      `
        ALTER TABLE "github"."IssueLike"
          DROP COLUMN IF EXISTS "type",
          DROP COLUMN IF EXISTS "number",
          DROP COLUMN IF EXISTS "title",
          DROP COLUMN IF EXISTS "url",
          DROP COLUMN IF EXISTS "state"
      `,
    );

    await db.update(
      `
        ALTER TABLE "google"."Thread"
          DROP COLUMN IF EXISTS "subject",
          DROP COLUMN IF EXISTS "unread",
          DROP COLUMN IF EXISTS "starred",
          ADD COLUMN IF NOT EXISTS "done" TIMESTAMP WITH TIME ZONE
      `,
    );

    await db.update(
      `
        ALTER TABLE "google"."File"
          DROP COLUMN IF EXISTS "name",
          DROP COLUMN IF EXISTS "description",
          DROP COLUMN IF EXISTS "mimeType",
          DROP COLUMN IF EXISTS "url"
      `,
    );

    await db.update(`DROP TABLE IF EXISTS "google"."ThreadLabel"`);

    await db.update(
      `
        ALTER TABLE "jira"."Issue"
          DROP COLUMN IF EXISTS "icon",
          DROP COLUMN IF EXISTS "type",
          DROP COLUMN IF EXISTS "summary",
          DROP COLUMN IF EXISTS "status"
      `,
    );

    await db.update(
      `
        ALTER TABLE "phabricator"."Revision"
          DROP COLUMN IF EXISTS "title",
          DROP COLUMN IF EXISTS "uri",
          DROP COLUMN IF EXISTS "status",
          ADD COLUMN IF NOT EXISTS "done" TIMESTAMP WITH TIME ZONE
      `,
    );
  }
}
