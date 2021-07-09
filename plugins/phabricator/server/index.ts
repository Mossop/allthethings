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

import { Query, Revision } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

class PhabricatorPlugin extends BasePlugin implements ServerPlugin {
  public readonly itemProviders = [
    Revision,
  ];

  public readonly listProviders = [
    Query,
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

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }
}

const pluginExport: ServerPluginExport = {
  id: "phabricator",
  init: (server: PluginServer) => new PhabricatorPlugin(server),
};

export default pluginExport;
