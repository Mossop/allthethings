import type { Database, Migration } from "../../../db";

export class Migration0004Github implements Migration {
  public name = "0004-Github";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "github"`);

    await db.update(`
      CREATE TABLE "github"."Account" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "token" text NOT NULL,
        "user" text NOT NULL,
        "avatar" text NOT NULL,

        CONSTRAINT "GhAccount_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GhAccount_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "github"."Repository" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "nodeId" text NOT NULL,
        "owner" text NOT NULL,
        "name" text NOT NULL,
        "url" text,

        CONSTRAINT "GhRepository_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GhRepository_FK_account" FOREIGN KEY ("accountId") REFERENCES "github"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhRepository_UNQ_node" ON "github"."Repository" ("accountId", "nodeId")
    `);

    await db.update(`
      CREATE TABLE "github"."Label" (
        "id" text NOT NULL,
        "repositoryId" text NOT NULL,
        "nodeId" text NOT NULL,
        "name" text NOT NULL,
        "color" text NOT NULL,
        "url" text,

        CONSTRAINT "GhBug_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GhBug_FK_repository" FOREIGN KEY ("repositoryId") REFERENCES "github"."Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhLabel_UNQ_repository" ON "github"."Label" ("id", "repositoryId")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhLabel_UNQ_node" ON "github"."Label" ("repositoryId", "nodeId")
    `);

    await db.update(`
      CREATE TABLE "github"."IssueLike" (
        "id" text NOT NULL,
        "repositoryId" text NOT NULL,
        "type" text NOT NULL,
        "nodeId" text NOT NULL,
        "number" integer NOT NULL,
        "title" text NOT NULL,
        "url" text,
        "state" text,

        CONSTRAINT "GhIssueLike_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GhIssueLike_FK_repository" FOREIGN KEY ("repositoryId") REFERENCES "github"."Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GhIssueLike_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhIssueLike_UNQ_repository" ON "github"."IssueLike" ("id", "repositoryId")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhIssueLike_UNQ_node" ON "github"."IssueLike" ("repositoryId", "nodeId")
    `);

    await db.update(`
      CREATE TABLE "github"."IssueLikeLabel" (
        "repositoryId" text NOT NULL,
        "issueLike" text NOT NULL,
        "label" text NOT NULL,

        CONSTRAINT "GhIssueLikeLabel_FK_issueLike" FOREIGN KEY ("repositoryId","issueLike") REFERENCES "github"."IssueLike"("repositoryId","id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GhIssueLikeLabel_FK_label" FOREIGN KEY ("repositoryId","label") REFERENCES "github"."Label"("repositoryId","id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "GhIssueLikeLabel_UNQ_label" ON "github"."IssueLikeLabel" ("issueLike", "label")
    `);

    await db.update(`
      CREATE TABLE "github"."Search" (
        "id" text NOT NULL,
        "accountId" text NOT NULL,
        "name" text NOT NULL,
        "query" text NOT NULL,
        "dueOffset" text,

        CONSTRAINT "GhSearch_PK" PRIMARY KEY ("id"),
        CONSTRAINT "GhSearch_FK_acount" FOREIGN KEY ("accountId") REFERENCES "github"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GhSearch_FK_list" FOREIGN KEY ("id") REFERENCES "core"."ServiceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "github" CASCADE`);
  }
}
