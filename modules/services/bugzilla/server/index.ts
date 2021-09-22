import type { ServiceExport, Server, ServiceTransaction } from "#server/utils";
import { BaseService } from "#server/utils";

import { Bug, Search } from "./implementations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

class BugzillaService extends BaseService {
  public readonly itemProviders = [Bug];

  public readonly listProviders = [Search];

  public constructor(private readonly server: Server) {
    super();

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      await this.server.withTransaction("Update", (tx: ServiceTransaction) =>
        this.update(tx),
      );

      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): ServiceTransaction {
    return tx;
  }
}

const serviceExport: ServiceExport = {
  id: "bugzilla",

  init: (server: Server) => new BugzillaService(server),
};

export default serviceExport;
