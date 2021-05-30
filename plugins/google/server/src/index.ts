import { promises as fs } from "fs";
import path from "path";

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
} from "@allthethings/server";
import type Koa from "koa";
import koaStatic from "koa-static";

import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

class GooglePlugin implements ServerPlugin {
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor(private readonly server: PluginServer) {
    this.clientPath = path.dirname(require.resolve("@allthethings/google-client/dist/app.js"));

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

  public async getItemFields(
    _context: PluginContext,
    _item: BasePluginItem,
  ): Promise<PluginItemFields> {
    return {};
  }

  // public async createItemFromURL(
  //   context: GraphQLContext,
  //   url: URL,
  //   isTask: boolean,
  // ): Promise<string | null> {
  //   if (!context.userId) {
  //     return null;
  //   }

  //   let accounts = await Account.list(context, context.userId);
  //   for (let account of accounts) {
  //     let bug = await account.getBugFromURL(url, isTask);
  //     if (bug) {
  //       return bug.itemId;
  //     }
  //   }

  //   return null;
  // }
}

const plugin: ServerPluginExport = (server: PluginServer) => new GooglePlugin(server);

export default plugin;
