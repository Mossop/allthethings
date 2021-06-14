import { promises as fs } from "fs";
import path from "path";

import type {
  PluginDbMigration,
  ServerPlugin,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  PluginWebMiddleware,
} from "@allthethings/server";
import { BasePlugin } from "@allthethings/server";
import koaStatic from "koa-static";

import { Query, Revision } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

export * from "./types";

const UPDATE_DELAY = 60000;

class PhabricatorPlugin extends BasePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  public readonly itemProviders = [
    Revision,
  ];

  public readonly listProviders = [
    Query,
  ];

  public constructor(private readonly server: PluginServer) {
    super();

    this.clientPath = path.dirname(require.resolve("@allthethings/phabricator-client/dist/app.js"));

    this.middleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withContext((context: PluginContext) => this.update(context));
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, UPDATE_DELAY);
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
}

const plugin: ServerPluginExport = (server: PluginServer) => new PhabricatorPlugin(server);

export default plugin;
