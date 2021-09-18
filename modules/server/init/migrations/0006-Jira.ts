import type { Database, Migration } from "#db";

export class Migration0006Jira implements Migration {
  public name = "0006-Jira";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "jira"`);

    await db.update(`
      CREATE TABLE "jira"."Account" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "email" text NOT NULL,
        "url" text NOT NULL,
        "apiToken" text NOT NULL,
        "serverName" text NOT NULL,
        "userName" text NOT NULL,

        CONSTRAINT "JrAccount_PK" PRIMARY KEY ("id"),
        CONSTRAINT "JrAccount_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "jira"."Search" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "name" text NOT NULL,
        "query" text NOT NULL,
        "dueOffset" text,

        CONSTRAINT "JrSearch_PK" PRIMARY KEY ("id"),
        CONSTRAINT "JrSearch_FK_account" FOREIGN KEY ("accountId") REFERENCES "jira"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "JrSearch_FK_list" FOREIGN KEY ("id") REFERENCES "core"."ServiceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "jira"."Issue" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "issueKey" text NOT NULL,
        "summary" text NOT NULL,
        "status" text NOT NULL,
        "type" text NOT NULL,
        "icon" text,

        CONSTRAINT "JrIssue_PK" PRIMARY KEY ("id"),
        CONSTRAINT "JrIssue_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "JrIssue_FK_account" FOREIGN KEY ("accountId") REFERENCES "jira"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "JrIssue_UNQ_issue" ON "jira"."Issue" ("accountId", "issueKey")
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "jira" CASCADE`);
  }
}
