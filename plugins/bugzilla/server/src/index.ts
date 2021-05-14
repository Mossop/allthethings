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
import type Koa from "koa";
import koaStatic from "koa-static";

import { Account, Bug, Search } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";
import { TaskType } from "./types";

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
    let unreferenced: string[] = [];

    for (let account of await Account.list(context)) {
      let api = account.getAPI();

      // All the bugs that potentially need their search status updating.
      let changedIds = new Set<number>();
      // All the bugs that were present in at least one search.
      let presentBugs = new Set<number>();

      let searches = await Search.list(account);
      for (let search of searches) {
        let results = await search.update();
        for (let id of results.changedIds) {
          changedIds.add(id);
        }
        for (let bug of results.presentBugs) {
          presentBugs.add(bug.id);
        }
      }

      let bugs = await account.getBugs();

      let toUpdate = bugs.filter((bug: Bug) => !presentBugs.has(bug.id));
      let searchUpdate = bugs.filter((bug: Bug) => changedIds.has(bug.id));

      if (toUpdate.length) {
        let updateIds = toUpdate.map((bug: Bug): number => bug.id);
        let remotes = await api.getBugs(updateIds);

        for (let bug of remotes) {
          // This should be cached from above.
          let local = await Bug.get(account, bug.id);
          await local?.update(bug);
        }
      }

      for (let bug of searchUpdate) {
        if (bug.taskType == TaskType.Search) {
          let searches = await bug.updateSearchStatus();
          if (searches == 0) {
            unreferenced.push(bug.itemId);
          }
        }
      }
    }

    await context.deleteUnreferencedItems(unreferenced);
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
