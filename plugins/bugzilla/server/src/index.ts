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
} from "@allthethings/server";
import type Koa from "koa";
import koaStatic from "koa-static";

import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

class BugzillaPlugin implements ServerPlugin {
  public readonly id = "bugzilla";
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor(private readonly server: PluginServer) {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));

    this.serverMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });
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
    return [`/${this.id}/app.js`];
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }

  public getItemFields(): Promise<PluginItemFields> {
    throw new Error("Unknown item");
  }
}

const plugin: ServerPluginExport = (server: PluginServer) => new BugzillaPlugin(server);

export default plugin;
