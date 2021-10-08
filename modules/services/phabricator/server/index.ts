import type * as KoaRouter from "@koa/router";

import type {
  Server,
  ServiceExport,
  ServiceTransaction,
} from "../../../server/utils";
import { BaseService } from "../../../server/utils";
import { Account, RevisionUpdater } from "./implementations";
import { RegisterRoutes } from "./routes";

class PhabricatorService extends BaseService {
  public readonly itemUpdaters = [RevisionUpdater];

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
