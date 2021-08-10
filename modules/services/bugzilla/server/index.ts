import type {
  ServiceExport,
  ServiceDbMigration,
  Server,
  ServiceTransaction,
} from "#server/utils";
import { BaseService } from "#server/utils";

import { Bug, Search } from "./implementations";
import buildMigrations from "./migrations";
import Resolvers from "./resolvers";
import type { BugzillaTransaction } from "./stores";
import { buildTransaction } from "./stores";

const UPDATE_DELAY = 60000;

class BugzillaService extends BaseService<BugzillaTransaction> {
  public readonly itemProviders = [Bug];

  public readonly listProviders = [Search];

  public constructor(private readonly server: Server<BugzillaTransaction>) {
    super();

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withTransaction((tx: BugzillaTransaction) =>
          this.update(tx),
        );
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): BugzillaTransaction {
    return buildTransaction(tx);
  }
}

const serviceExport: ServiceExport<unknown, BugzillaTransaction> = {
  id: "bugzilla",

  get dbMigrations(): ServiceDbMigration[] {
    return buildMigrations();
  },

  init: (server: Server<BugzillaTransaction>) => new BugzillaService(server),
};

export default serviceExport;
