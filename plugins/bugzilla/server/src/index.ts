import { promises as fs } from "fs";
import path from "path";

import type {
  PluginDbMigration,
  ServerPlugin,
  PluginItemFields,
  GraphQLContext,
  Resolver,
} from "@allthethings/types";
import type Koa from "koa";
import koaStatic from "koa-static";

import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

class BuzillaPlugin implements ServerPlugin {
  public readonly id = "bugzilla";
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor() {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));

    this.serverMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });
  }

  public getSchema(): Promise<string> {
    let schemaFile = path.join(__dirname, "..", "..", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public getResolvers(): Resolver<GraphQLContext> {
    return Resolvers;
  }

  public getClientScripts(): string[] {
    return [`/${this.id}/app.js`];
  }

  public getDbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }

  public getItemFields(): Promise<PluginItemFields> {
    throw new Error("Unknown item");
  }
}

export default new BuzillaPlugin();
