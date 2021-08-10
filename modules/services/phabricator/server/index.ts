import type {
  Server,
  ServiceDbMigration,
  ServiceExport,
  ServiceTransaction,
} from "#server/utils";
import { BaseService } from "#server/utils";

import { Query, Revision } from "./implementations";
import buildMigrations from "./migrations";
import Resolvers from "./resolvers";
import type { PhabricatorTransaction } from "./stores";
import { buildTransaction } from "./stores";

const UPDATE_DELAY = 60000;

class PhabricatorService extends BaseService<PhabricatorTransaction> {
  public readonly itemProviders = [Revision];

  public readonly listProviders = [Query];

  public constructor(private readonly server: Server<PhabricatorTransaction>) {
    super();

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withTransaction((tx: PhabricatorTransaction) =>
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

  public buildTransaction(tx: ServiceTransaction): PhabricatorTransaction {
    return buildTransaction(tx);
  }
}

const serviceExport: ServiceExport<unknown, PhabricatorTransaction> = {
  id: "phabricator",

  get dbMigrations(): ServiceDbMigration[] {
    return buildMigrations();
  },

  init: (server: Server<PhabricatorTransaction>) =>
    new PhabricatorService(server),
};

export default serviceExport;
