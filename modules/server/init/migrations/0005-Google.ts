import type { Database, Migration } from "#db";

export class Migration0005Google implements Migration {
  public name = "0005-Google";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "google"`);

    await db.update(`
      CREATE TABLE "google"."Account" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "email" text NOT NULL,
        "avatar" text,
        "accessToken" text NOT NULL,
        "refreshToken" text,
        "expiry" integer,

        CONSTRAINT "GlAccount_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GlAccount_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlAccount_UNQ_email" ON "google"."Account" ("userId", "email")
    `);

    await db.update(`
      CREATE TABLE "google"."File" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "fileId" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "mimeType" text NOT NULL,
        "url" text,

        CONSTRAINT "GlFile_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GlFile_FK_account" FOREIGN KEY ("accountId") REFERENCES "google"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GlFile_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlFile_UNQ_file" ON "google"."File" ("accountId", "fileId")
    `);

    await db.update(`
      CREATE TABLE "google"."Label" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "name" text NOT NULL,

        CONSTRAINT "GlLabel_FK_account" FOREIGN KEY ("accountId") REFERENCES "google"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlLabel_UNQ_id" ON "google"."Label" ("accountId", "id")
    `);

    await db.update(`
      CREATE TABLE "google"."Thread" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "threadId" text NOT NULL,
        "subject" text NOT NULL,
        "unread" boolean NOT NULL,
        "starred" boolean NOT NULL,

        CONSTRAINT "GlThread_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GlThread_FK_account" FOREIGN KEY ("accountId") REFERENCES "google"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GlThread_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlThread_UNQ_thread" ON "google"."Thread" ("accountId", "threadId")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlThread_UNQ_account" ON "google"."Thread" ("accountId", "id")
    `);

    await db.update(`
      CREATE TABLE "google"."ThreadLabel" (
        "accountId" text NOT NULL,
        "threadId" text NOT NULL,
        "labelId" text NOT NULL,

        CONSTRAINT "GlThreadLabel_FK_thread" FOREIGN KEY ("accountId","threadId") REFERENCES "google"."Thread"("accountId","id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GlThreadLabel_FK_label" FOREIGN KEY ("accountId","labelId") REFERENCES "google"."Label"("accountId","id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GlThreadLabel_UNQ" ON "google"."ThreadLabel" ("threadId", "labelId")
    `);

    await db.update(`
      CREATE TABLE "google"."MailSearch" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "name" text NOT NULL,
        "query" text NOT NULL,
        "dueOffset" text,

        CONSTRAINT "GlMailSearch_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GlMailSearch_FK_account" FOREIGN KEY ("accountId") REFERENCES "google"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GlMailSearch_FK_list" FOREIGN KEY ("id") REFERENCES "core"."ServiceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "google" CASCADE`);
  }
}
