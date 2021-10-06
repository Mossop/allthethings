import type * as KoaRouter from "@koa/router";

import type {
  Server,
  ServiceExport,
  ServiceTransaction,
} from "../../../server/utils";
import { BaseService } from "../../../server/utils";
import { Account, Query, Revision } from "./implementations";
import { RegisterRoutes } from "./routes";

const UPDATE_DELAY = 60000;

class PhabricatorService extends BaseService {
  public readonly itemProviders = [Revision];

  public readonly listProviders = [Query];

  public constructor(private readonly server: Server) {
    super();

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      await this.server.withTransaction("Update", (tx: ServiceTransaction) =>
        this.update(tx),
      );

      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public override async update(tx: ServiceTransaction): Promise<void> {
    let accounts = await Account.store(tx).find();
    for (let account of accounts) {
      await account.updateAccount();
    }

    await super.update(tx);
  }

  public addWebRoutes(router: KoaRouter): void {
    RegisterRoutes(router);
  }
}

const serviceExport: ServiceExport<unknown> = {
  id: "phabricator",

  init: (server: Server) => new PhabricatorService(server),
};

export default serviceExport;
