import { promises as fs } from "fs";
import path from "path";

import type {
  ServerPlugin,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  PluginWebMiddleware,
  PluginDbMigration,
} from "@allthethings/server";
import {
  BasePlugin,
} from "@allthethings/server";
import koaStatic from "koa-static";

import { Account } from "./db/implementation";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

export class JiraPlugin extends BasePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  protected readonly listProviders = [
  ];

  protected readonly itemProviders = [
  ];

  public constructor(
    private readonly server: PluginServer,
  ) {
    super();

    this.clientPath = path.dirname(require.resolve("@allthethings/jira-client/dist/app.js"));

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

  public async update(context: PluginContext): Promise<void> {
    let accounts = await Account.store.list(context);
    for (let account of accounts) {
      await account.update();
    }
    await super.update(context);
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

const plugin: ServerPluginExport = (server: PluginServer) => {
  return new JiraPlugin(server);
};

export default plugin;
