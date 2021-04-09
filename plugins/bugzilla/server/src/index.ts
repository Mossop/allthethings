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

import { Account, Bug } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

export * from "./types";

class BugzillaPlugin implements ServerPlugin {
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor(private readonly server: PluginServer) {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));

    this.serverMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });
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

  public async createItemFromURL(context: GraphQLContext, url: URL): Promise<string | null> {
    if (!context.userId) {
      return null;
    }

    let accounts = await Account.list(context, context.userId);
    for (let account of accounts) {
      let bug = await account.getBugFromURL(url);
      if (bug) {
        return bug.itemId;
      }
    }

    return null;
  }
}

const plugin: ServerPluginExport = (server: PluginServer) => new BugzillaPlugin(server);

export default plugin;
