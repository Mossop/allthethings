import { promises as fs } from "fs";
import path from "path";
import type { URL } from "url";

import type {
  PluginDbMigration,
  ServerPlugin,
  PluginItemFields,
  GraphQLContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  BasePluginItem,
  PluginTaskInfo,
} from "@allthethings/server";
import type { Bug as BugzillaBug } from "bugzilla";
import type Koa from "koa";
import koaStatic from "koa-static";

import { Account, Bug } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

export * from "./types";

const UPDATE_DELAY = 60000;

class BugzillaPlugin implements ServerPlugin {
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor(private readonly server: PluginServer) {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));

    this.serverMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withContext((context: PluginContext) => this.update(context));
      } catch (e) {
        console.log(e);
      }
      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public async update(context: PluginContext): Promise<void> {
    for (let account of await Account.list(context)) {
      let api = account.getAPI();
      let bugs = await account.getBugs();
      if (bugs.length == 0) {
        continue;
      }

      console.log(`Updating ${bugs.length} from ${account.url}`);
      let bugMap = new Map(bugs.map((bug: Bug): [number, Bug] => [bug.bugId, bug]));

      let results = await api.getBugs(Array.from(bugMap.keys()));

      await Promise.all(
        results.map(async (result: BugzillaBug): Promise<void> => {
          await bugMap.get(result.id)?.update(result);
        }),
      );
    }
  }

  public middleware(): Koa.Middleware {
    return this.serverMiddleware;
  }

  public schema(): Promise<string> {
    let schemaFile = path.join(__dirname, "..", "..", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public resolvers(): Resolver<GraphQLContext> {
    return Resolvers;
  }

  public clientScripts(): string[] {
    return ["/app.js"];
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }

  public async editTaskInfo(
    context: PluginContext,
    item: BasePluginItem,
    taskInfo: PluginTaskInfo | null,
  ): Promise<void> {
    let bug = await Bug.getForItem(context, item.id);
    if (!bug) {
      throw new Error("Missing bug record.");
    }

    return bug.editTaskInfo(taskInfo);
  }

  public async getItemFields(
    context: PluginContext,
    item: BasePluginItem,
  ): Promise<PluginItemFields> {
    let bug = await Bug.getForItem(context, item.id);
    if (!bug) {
      throw new Error("Missing bug record.");
    }

    return bug.fields();
  }

  public async createItemFromURL(
    context: GraphQLContext,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    if (!context.userId) {
      return null;
    }

    let accounts = await Account.list(context, context.userId);
    for (let account of accounts) {
      let bug = await account.getBugFromURL(url, isTask);
      if (bug) {
        return bug.itemId;
      }
    }

    return null;
  }
}

const plugin: ServerPluginExport = (server: PluginServer) => new BugzillaPlugin(server);

export default plugin;
