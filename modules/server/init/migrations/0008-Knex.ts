import type { Database, Migration, Sql } from "#db";
import { sql } from "#db";

export class Migration0008Knex implements Migration {
  public name = "0008-Knex";

  public async up(db: Database): Promise<void> {
    let count = await db.value<number>(sql`
      SELECT COUNT(*)::integer
      FROM "information_schema"."tables"
      WHERE "table_schema"=${"public"} AND "table_name"=${"Item"}
    `);

    if (!count) {
      return;
    }

    let migrate = (
      oldSchema: string,
      newSchema: string,
      oldTable: string,
      columns: string[],
      newTable: string = oldTable,
    ): Promise<void> => {
      let colSql = sql.join(
        columns.map((column: string): Sql => sql.ref(column)),
        ", ",
      );
      return db.update(sql`
        INSERT INTO ${sql.ref(`${newSchema}.${newTable}`)} (${colSql})
        SELECT ${colSql} FROM ${sql.ref(`${oldSchema}.${oldTable}`)}
      `);
    };

    await migrate("public", "core", "User", [
      "id",
      "email",
      "password",
      "isAdmin",
    ]);
    await migrate("public", "core", "Context", ["id", "userId", "name"]);
    await migrate("public", "core", "Project", [
      "id",
      "userId",
      "contextId",
      "parentId",
      "name",
    ]);

    await db.update(sql`
      INSERT INTO "core"."Section" ("id", "userId", "projectId", "name", "index")
      SELECT "id", "userId", "ownerId", "name", "index" FROM "public"."Section"
    `);

    await db.update(sql`
      INSERT INTO "core"."Item"
        ("id", "userId", "summary", "type", "created", "archived", "snoozed", "sectionId", "sectionIndex")
      SELECT
        "Item"."id", "Item"."userId", "summary", "type", "created", "archived", "snoozed", "ownerId", COALESCE("index", 0)
      FROM "public"."Item" LEFT JOIN "public"."SectionItems" USING ("id")
    `);

    await migrate("public", "core", "FileDetail", [
      "id",
      "filename",
      "path",
      "mimetype",
      "size",
    ]);
    await migrate("public", "core", "NoteDetail", ["id", "note"]);
    await migrate("public", "core", "LinkDetail", ["id", "url", "icon"]);
    await migrate("public", "core", "ServiceDetail", [
      "id",
      "serviceId",
      "hasTaskState",
      "taskDone",
      "taskDue",
    ]);
    await migrate("public", "core", "TaskInfo", [
      "id",
      "due",
      "done",
      "manualDue",
      "manualDone",
      "controller",
    ]);

    await migrate("public", "core", "ServiceList", [
      "id",
      "serviceId",
      "name",
      "url",
    ]);
    await migrate(
      "public",
      "core",
      "ServiceListItems",
      ["serviceId", "listId", "itemId", "present", "due", "done"],
      "ServiceListItem",
    );

    await migrate("old_bugzilla", "bugzilla", "Account", [
      "id",
      "userId",
      "name",
      "url",
      "username",
      "icon",
      "password",
    ]);
    await migrate("old_bugzilla", "bugzilla", "Search", [
      "id",
      "accountId",
      "name",
      "type",
      "query",
      "dueOffset",
    ]);
    await migrate("old_bugzilla", "bugzilla", "Bug", [
      "id",
      "accountId",
      "bugId",
      "summary",
      "status",
      "resolution",
    ]);

    await db.update(`DROP TABLE "old_bugzilla"."Bug"`);
    await db.update(`DROP TABLE "old_bugzilla"."Search"`);
    await db.update(`DROP TABLE "old_bugzilla"."Account"`);

    await db.update(`DROP SCHEMA "old_bugzilla"`);

    await migrate("old_github", "github", "Account", [
      "id",
      "userId",
      "token",
      "user",
      "avatar",
    ]);
    await migrate("old_github", "github", "Repository", [
      "id",
      "accountId",
      "nodeId",
      "owner",
      "name",
      "url",
    ]);
    await migrate("old_github", "github", "Label", [
      "id",
      "repositoryId",
      "nodeId",
      "name",
      "color",
      "url",
    ]);
    await migrate("old_github", "github", "Search", [
      "id",
      "accountId",
      "name",
      "query",
      "dueOffset",
    ]);
    await migrate("old_github", "github", "IssueLike", [
      "id",
      "repositoryId",
      "type",
      "nodeId",
      "number",
      "title",
      "url",
      "state",
    ]);
    await migrate(
      "old_github",
      "github",
      "IssueLikeLabels",
      ["repositoryId", "issueLike", "label"],
      "IssueLikeLabel",
    );

    await db.update(`DROP TABLE "old_github"."IssueLikeLabels"`);
    await db.update(`DROP TABLE "old_github"."IssueLike"`);
    await db.update(`DROP TABLE "old_github"."Search"`);
    await db.update(`DROP TABLE "old_github"."Label"`);
    await db.update(`DROP TABLE "old_github"."Repository"`);
    await db.update(`DROP TABLE "old_github"."Account"`);

    await db.update(`DROP SCHEMA "old_github"`);

    await migrate("old_google", "google", "Account", [
      "id",
      "userId",
      "email",
      "avatar",
      "accessToken",
      "refreshToken",
      "expiry",
    ]);
    await migrate("old_google", "google", "Label", ["id", "accountId", "name"]);
    await migrate("old_google", "google", "MailSearch", [
      "id",
      "accountId",
      "name",
      "query",
      "dueOffset",
    ]);
    await migrate("old_google", "google", "File", [
      "id",
      "accountId",
      "fileId",
      "name",
      "description",
      "mimeType",
      "url",
    ]);
    await migrate("old_google", "google", "Thread", [
      "id",
      "accountId",
      "threadId",
      "subject",
      "unread",
      "starred",
    ]);
    await migrate("old_google", "google", "ThreadLabel", [
      "accountId",
      "threadId",
      "labelId",
    ]);

    await db.update(`DROP TABLE "old_google"."ThreadLabel"`);
    await db.update(`DROP TABLE "old_google"."Thread"`);
    await db.update(`DROP TABLE "old_google"."File"`);
    await db.update(`DROP TABLE "old_google"."MailSearch"`);
    await db.update(`DROP TABLE "old_google"."Label"`);
    await db.update(`DROP TABLE "old_google"."Account"`);

    await db.update(`DROP SCHEMA "old_google"`);

    await migrate("old_jira", "jira", "Account", [
      "id",
      "userId",
      "url",
      "email",
      "apiToken",
      "serverName",
      "userName",
    ]);
    await migrate("old_jira", "jira", "Search", [
      "id",
      "accountId",
      "name",
      "query",
      "dueOffset",
    ]);
    await migrate("old_jira", "jira", "Issue", [
      "id",
      "accountId",
      "issueKey",
      "icon",
      "summary",
      "status",
      "type",
    ]);

    await db.update(`DROP TABLE "old_jira"."Issue"`);
    await db.update(`DROP TABLE "old_jira"."Search"`);
    await db.update(`DROP TABLE "old_jira"."Account"`);

    await db.update(`DROP SCHEMA "old_jira"`);

    await migrate("old_phabricator", "phabricator", "Account", [
      "id",
      "userId",
      "phid",
      "email",
      "url",
      "apiKey",
      "icon",
      "userIcon",
    ]);
    await migrate("old_phabricator", "phabricator", "Query", [
      "id",
      "accountId",
      "queryId",
    ]);
    await migrate("old_phabricator", "phabricator", "Revision", [
      "id",
      "accountId",
      "revisionId",
      "title",
      "uri",
      "status",
    ]);

    await db.update(`DROP TABLE "old_phabricator"."Revision"`);
    await db.update(`DROP TABLE "old_phabricator"."Query"`);
    await db.update(`DROP TABLE "old_phabricator"."Account"`);

    await db.update(`DROP SCHEMA "old_phabricator"`);

    await db.update(`DROP TABLE "public"."ServiceListItems"`);
    await db.update(`DROP TABLE "public"."ServiceList"`);
    await db.update(`DROP TABLE "public"."TaskInfo"`);
    await db.update(`DROP TABLE "public"."NoteDetail"`);
    await db.update(`DROP TABLE "public"."ServiceDetail"`);
    await db.update(`DROP TABLE "public"."LinkDetail"`);
    await db.update(`DROP TABLE "public"."FileDetail"`);
    await db.update(`DROP TABLE "public"."SectionItems"`);
    await db.update(`DROP TABLE "public"."Item"`);
    await db.update(`DROP TABLE "public"."Section"`);
    await db.update(`DROP TABLE "public"."Project"`);
    await db.update(`DROP TABLE "public"."Context"`);
    await db.update(`DROP TABLE "public"."User"`);

    let dropMigrations = async (name: string): Promise<void> => {
      await db.update(
        sql`DROP TABLE ${sql.ref(`public.${name}_migrations_lock`)}`,
      );
      await db.update(sql`DROP TABLE ${sql.ref(`public.${name}_migrations`)}`);
    };

    await dropMigrations("phabricator");
    await dropMigrations("jira");
    await dropMigrations("google");
    await dropMigrations("github");
    await dropMigrations("bugzilla");
    await dropMigrations("allthethings");
  }
}
