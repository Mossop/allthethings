import type {
  Server,
  ServiceExport,
  ServiceTransaction,
} from "../../../server/utils";
import { BaseService } from "../../../server/utils";
import { Account, Issue, Search } from "./implementations";
import Resolvers from "./resolvers";

const UPDATE_DELAY = 60000;

export class JiraService extends BaseService {
  protected readonly listProviders = [Search];

  protected readonly itemProviders = [Issue];

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

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): ServiceTransaction {
    return tx;
  }
}

const serviceExport: ServiceExport<unknown> = {
  id: "jira",

  init: (server: Server) => new JiraService(server),
};

export default serviceExport;
