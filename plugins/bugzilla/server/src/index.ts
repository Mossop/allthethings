import { promises as fs } from "fs";
import path from "path";
import type { URL } from "url";

import type {
  PluginDbMigration,
  ServerPlugin,
  PluginItemFields,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  BasePluginItem,
  PluginWebMiddleware,
} from "@allthethings/server";
import koaStatic from "koa-static";

import { Account, Bug, Search } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

export * from "./types";

const UPDATE_DELAY = 60000;

class BugzillaPlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  public constructor(private readonly server: PluginServer) {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));

    this.middleware = koaStatic(this.clientPath, {
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
      let searches = await Search.list(account);
      for (let search of searches) {
        await search.updateBugs();
      }

      let bugs = await Bug.list(account);
      for (let bug of bugs) {
        await bug.update();
      }
    }
  }

  public schema(): Promise<string> {
    let schemaFile = path.join(__dirname, "..", "..", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public clientScripts(): string[] {
    return ["/app.js"];
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
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
    context: AuthedPluginContext,
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
