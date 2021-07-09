import type {
  ServerPlugin,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  PluginDbMigration,
} from "#server-utils";
import {
  BasePlugin,
} from "#server-utils";

import { Account, Issue, Search } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

export class JiraPlugin extends BasePlugin implements ServerPlugin {
  protected readonly listProviders = [
    Search,
  ];

  protected readonly itemProviders = [
    Issue,
  ];

  public constructor(
    private readonly server: PluginServer,
  ) {
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

  public override async update(context: PluginContext): Promise<void> {
    let accounts = await Account.store.list(context);
    for (let account of accounts) {
      await account.update();
    }
    await super.update(context);
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }
}

const pluginExport: ServerPluginExport = {
  id: "jira",
  init: (server: PluginServer) => new JiraPlugin(server),
};

export default pluginExport;
