import type { Server, ServiceDbMigration, ServiceExport, ServiceTransaction } from "#server/utils";
import { BaseService } from "#server/utils";

import { Issue, Search } from "./implementations";
import buildMigrations from "./migrations";
import Resolvers from "./resolvers";
import type { JiraTransaction } from "./stores";
import { buildTransaction } from "./stores";

const UPDATE_DELAY = 60000;

export class JiraService extends BaseService<JiraTransaction> {
  protected readonly listProviders = [
    Search,
  ];

  protected readonly itemProviders = [
    Issue,
  ];

  public constructor(
    private readonly server: Server<JiraTransaction>,
  ) {
    super();

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withTransaction((tx: JiraTransaction) => this.update(tx));
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public override async update(tx: JiraTransaction): Promise<void> {
    let accounts = await tx.stores.accounts.list();
    for (let account of accounts) {
      await account.update();
    }
    await super.update(tx);
  }

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): JiraTransaction {
    return buildTransaction(tx);
  }
}

const serviceExport: ServiceExport<unknown, JiraTransaction> = {
  id: "jira",

  get dbMigrations(): ServiceDbMigration[] {
    return buildMigrations();
  },

  init: (server: Server<JiraTransaction>) => new JiraService(server),
};

export default serviceExport;
