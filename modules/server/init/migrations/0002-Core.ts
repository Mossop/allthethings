import { sql } from "../../../db";
import type { Database, Migration } from "../../../db";

export class Migration0002Core implements Migration {
  public name = "0002-Core";

  public async up(db: Database): Promise<void> {
    await db.update(`CREATE SCHEMA IF NOT EXISTS "core"`);

    await db.update(sql`
      CREATE TABLE "core"."User" (
        "id" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "isAdmin" boolean NOT NULL DEFAULT false,

        CONSTRAINT "User_PK" PRIMARY KEY ("id")
      )
    `);

    await db.update(`
      CREATE TABLE "core"."Context" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "name" text NOT NULL,

        CONSTRAINT "Context_PK" PRIMARY KEY ("id"),
        CONSTRAINT "Context_CHK_name" CHECK ("name" <> ''),
        CONSTRAINT "Context_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      ALTER TABLE "core"."Context"
      ADD COLUMN "stub" text NOT NULL GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'))
      ) STORED
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Context_UNQ_stub" ON "core"."Context" ("userId", "stub")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Context_UNQ_user" ON "core"."Context" ("id", "userId")
    `);

    await db.update(`
      CREATE TABLE "core"."Project" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "contextId" text NOT NULL,
        "parentId" text,
        "name" text NOT NULL,

        CONSTRAINT "Project_PK" PRIMARY KEY ("id"),
        CONSTRAINT "Project_CHK_name" CHECK (
          (
            ("name" = '')
            AND ("contextId" = "id")
            AND ("parentId" IS NULL)
          )
          OR (
            ("name" <> '')
            AND ("contextId" <> "id")
            AND ("parentId" IS NOT NULL)
          )
        ),
        CONSTRAINT "Project_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Project_FK_context" FOREIGN KEY ("contextId", "userId") REFERENCES "core"."Context"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      ALTER TABLE "core"."Project"
      ADD COLUMN "stub" text NOT NULL GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'))
      ) STORED
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Project_UNQ_stub" ON "core"."Project" ("parentId", "contextId", "stub")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Project_UNQ_context" ON "core"."Project" ("id", "contextId")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Projct_UNQ_user" ON "core"."Project" ("id", "userId")
    `);
    await db.update(`
      ALTER TABLE "core"."Project"
      ADD CONSTRAINT "Project_FK_project" FOREIGN KEY ("parentId", "contextId") REFERENCES "core"."Project"("id", "contextId") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await db.update(`
      CREATE TABLE "core"."Section" (
        "id" text NOT NULL,
        "userId" text NOT NULL,
        "projectId" text NOT NULL,
        "name" text NOT NULL,
        "index" integer NOT NULL,

        CONSTRAINT "Section_PK" PRIMARY KEY ("id"),
        CONSTRAINT "Section_CHK_name" CHECK (
            ("index" < 0)
            OR (
                ("name" <> '')
                AND ("projectId" <> "id")
                AND ("index" >= 0)
            )
        ),
        CONSTRAINT "Section_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Section_FK_project" FOREIGN KEY ("projectId", "userId") REFERENCES "core"."Project"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      ALTER TABLE "core"."Section"
      ADD COLUMN "stub" text NOT NULL GENERATED ALWAYS AS (
        trim('-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'))
      ) STORED
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Section_UNQ_index" ON "core"."Section" ("projectId", "userId", "index")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Section_UNQ_stub" ON "core"."Section" ("projectId", "userId", "stub")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Section_UNQ_user" ON "core"."Section" ("id", "userId")
    `);

    await db.update(`
      CREATE TABLE "core"."Item" (
        "id" text NOT NULL,
        "sectionId" text,
        "sectionIndex" integer NOT NULL DEFAULT '0',
        "summary" text NOT NULL,
        "archived" TIMESTAMP WITH TIME ZONE,
        "snoozed" TIMESTAMP WITH TIME ZONE,
        "type" text,
        "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" text NOT NULL,

        CONSTRAINT "Item_PK" PRIMARY KEY ("id"),
        CONSTRAINT "Item_FK_user" FOREIGN KEY ("userId") REFERENCES "core"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Item_FK_section" FOREIGN KEY ("sectionId", "userId") REFERENCES "core"."Section"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Item_UNQ_sectionIndex" ON "core"."Item" ("sectionId", "sectionIndex")
    `);
    await db.update(`
      CREATE UNIQUE INDEX "Item_UNQ_user" ON "core"."Item" ("id", "userId")
    `);

    await db.update(`
      CREATE TABLE "core"."TaskInfo" (
        "id" text NOT NULL,
        "due" TIMESTAMP WITH TIME ZONE,
        "done" TIMESTAMP WITH TIME ZONE,
        "manualDue" TIMESTAMP WITH TIME ZONE,
        "manualDone" TIMESTAMP WITH TIME ZONE,
        "controller" text NOT NULL,

        CONSTRAINT "TaskInfo_PK" PRIMARY KEY ("id"),
        CONSTRAINT "TaskInfo_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "core"."LinkDetail" (
        "id" text NOT NULL,
        "icon" text,
        "url" text NOT NULL,

        CONSTRAINT "LinkDetail_PK" PRIMARY KEY ("id"),
        CONSTRAINT "LinkDetail_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "core"."NoteDetail" (
        "id" text NOT NULL,
        "url" text NOT NULL,
        "note" text NOT NULL,

        CONSTRAINT "NoteDetail_PK" PRIMARY KEY ("id"),
        CONSTRAINT "NoteDetail_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "core"."FileDetail" (
        "id" text NOT NULL,
        "filename" text NOT NULL,
        "path" text NOT NULL,
        "size" integer NOT NULL,
        "mimetype" text NOT NULL,

        CONSTRAINT "FileDetail_PK" PRIMARY KEY ("id"),
        CONSTRAINT "FileDetail_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await db.update(`
      CREATE TABLE "core"."ServiceDetail" (
        "id" text NOT NULL,
        "serviceId" text NOT NULL,
        "hasTaskState" boolean NOT NULL,
        "taskDone" TIMESTAMP WITH TIME ZONE,
        "taskDue" TIMESTAMP WITH TIME ZONE,

        CONSTRAINT "ServiceDetail_PK" PRIMARY KEY ("id"),
        CONSTRAINT "ServiceDetail_FK_item" FOREIGN KEY ("id") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "ServiceDetail_UNQ_serviceId" ON "core"."ServiceDetail" ("id", "serviceId")
    `);

    await db.update(`
      CREATE TABLE "core"."ServiceList" (
        "id" text NOT NULL,
        "serviceId" text NOT NULL,
        "name" text NOT NULL,
        "url" text,

        CONSTRAINT "ServiceList_PK" PRIMARY KEY ("id")
      )
    `);
    await db.update(`
      CREATE UNIQUE INDEX "ServiceList_UNQ_serviceId" ON "core"."ServiceList" ("id", "serviceId")
    `);

    await db.update(`
      CREATE TABLE "core"."ServiceListItem" (
        "itemId" text NOT NULL,
        "listId" text NOT NULL,
        "present" TIMESTAMP WITH TIME ZONE NOT NULL,
        "done" TIMESTAMP WITH TIME ZONE,
        "due" TIMESTAMP WITH TIME ZONE,
        "serviceId" text NOT NULL,

        CONSTRAINT "ServiceListItem_PK" PRIMARY KEY ("itemId", "listId"),
        CONSTRAINT "ServiceListItem_FK_item" FOREIGN KEY ("itemId") REFERENCES "core"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ServiceListItem_FK_serviceDetail" FOREIGN KEY ("itemId", "serviceId") REFERENCES "core"."ServiceDetail"("id", "serviceId") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ServiceListItem_FK_serviceId" FOREIGN KEY ("listId", "serviceId") REFERENCES "core"."ServiceList"("id", "serviceId") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  public async down(db: Database): Promise<void> {
    await db.update(`DROP SCHEMA IF EXISTS "core" CASCADE`);
  }
}
