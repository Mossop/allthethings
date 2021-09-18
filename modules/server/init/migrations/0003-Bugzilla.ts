import type { Database, Migration } from "#db";

export class Migration0003Bugzilla implements Migration {
  public name = "0003-Bugzilla";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "bugzilla"`);

    await db.update(`
      CREATE TABLE "bugzilla"."Account" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "name" text NOT NULL,
        "url" text NOT NULL,
        "username" text,
        "password" text,
        "icon" text,

        CONSTRAINT "BzAccount_PK" PRIMARY KEY ("id"),
        CONSTRAINT "BzAccount_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "bugzilla"."Search" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "query" text NOT NULL,
        "dueOffset" text,

        CONSTRAINT "BzSearch_PK" PRIMARY KEY ("id"),
        CONSTRAINT "BzSearch_FK_account" FOREIGN KEY ("accountId") REFERENCES "bugzilla"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BzSearch_FK_list" FOREIGN KEY ("id") REFERENCES "core"."ServiceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "bugzilla"."Bug" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "bugId" integer NOT NULL,
        "summary" text NOT NULL,
        "status" text NOT NULL,
        "resolution" text,

        CONSTRAINT "BzBug_PK" PRIMARY KEY ("id"),
        CONSTRAINT "BzBug_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BzBug_FK_account" FOREIGN KEY ("accountId") REFERENCES "bugzilla"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "BzBug_UNQ_bug" ON "bugzilla"."Bug" ("accountId", "bugId")
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "bugzilla" CASCADE`);
  }
}
