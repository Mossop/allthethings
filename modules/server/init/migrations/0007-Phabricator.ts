import type { Database, Migration } from "#db";

export class Migration0007Phabricator implements Migration {
  public name = "0007-Phabricator";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "phabricator"`);

    await db.update(`
      CREATE TABLE "phabricator"."Account" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "email" text NOT NULL,
        "phid" text NOT NULL,
        "url" text NOT NULL,
        "apiKey" text NOT NULL,
        "icon" text,
        "userIcon" text NOT NULL,

        CONSTRAINT "PhAccount_PK" PRIMARY KEY ("id"),
        CONSTRAINT "PhAccount_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "PhAccount_UNQ_phid" ON "phabricator"."Account" ("url", "phid")
    `);

    await db.update(`
      CREATE TABLE "phabricator"."Query" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "queryId" text NOT NULL,

        CONSTRAINT "PhSearch_PK" PRIMARY KEY ("id"),
        CONSTRAINT "PhSearch_FK_account" FOREIGN KEY ("accountId") REFERENCES "phabricator"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PhSearch_FK_list" FOREIGN KEY ("id") REFERENCES "core"."ServiceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "PhQuery_UNQ_query" ON "phabricator"."Query" ("accountId", "queryId")
    `);

    await db.update(`
      CREATE TABLE "phabricator"."Revision" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "revisionId" integer NOT NULL,
        "title" text NOT NULL,
        "uri" text NOT NULL,
        "status" text NOT NULL,

        CONSTRAINT "PhRevision_PK" PRIMARY KEY ("id"),
        CONSTRAINT "PhRevision_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PhRevision_FK_account" FOREIGN KEY ("accountId") REFERENCES "phabricator"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "PhRevision_UNQ_revision" ON "phabricator"."Revision" ("accountId", "revisionId")
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "phabricator" CASCADE`);
  }
}
