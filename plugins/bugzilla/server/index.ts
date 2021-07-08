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
} from "#server-utils";
import { BasePlugin } from "#server-utils";

import { Bug, Search } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

class BugzillaPlugin extends BasePlugin implements ServerPlugin {
  public readonly itemProviders = [
    Bug,
  ];

  public readonly listProviders = [
    Search,
  ];

  public constructor(private readonly server: PluginServer) {
    super();

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
    let schemaFile = path.join(__dirname, "..", "schema", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }
}

const pluginExport: ServerPluginExport = {
  id: "bugzilla",
  init: (server: PluginServer) => new BugzillaPlugin(server),
};

export default pluginExport;
