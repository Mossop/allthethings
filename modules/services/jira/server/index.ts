import type * as KoaRouter from "@koa/router";

import type {
  Server,
  ServiceExport,
  ServiceTransaction,
} from "../../../server/utils";
import { BaseService } from "../../../server/utils";
import { Account, IssueUpdater } from "./implementations";
import { RegisterRoutes } from "./routes";

export class JiraService extends BaseService {
  protected readonly itemUpdaters = [IssueUpdater];

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
  id: "jira",

  init: (server: Server) => new JiraService(server),
};

export default serviceExport;
