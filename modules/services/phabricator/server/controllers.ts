import { Body, Delete, Get, Patch, Put, Route } from "@tsoa/runtime";

import { ServiceController } from "../../../server/utils";
import { map } from "../../../utils";
import type {
  PhabricatorAccountState,
  PhabricatorAccountParams,
  PhabricatorQueryState,
  QueryClass,
} from "./implementations";
import { Query, Account } from "./implementations";

@Route("/account")
export class AccountController extends ServiceController {
  @Get()
  public async listAccounts(): Promise<PhabricatorAccountState[]> {
    let tx = await this.startTransaction(false);
    let accounts = await Account.store(tx).find({ userId: this.userId });
    return map(
      accounts,
      (account: Account): Promise<PhabricatorAccountState> => account.state(),
    );
  }

  @Put()
  public async createAccount(
    @Body()
    { params }: { params: PhabricatorAccountParams },
  ): Promise<PhabricatorAccountState> {
    let tx = await this.startTransaction(true);
    let account = await Account.create(tx, this.userId, params);

    return account.state();
  }

  @Patch()
  public async editAccount(
    @Body()
    { id, params }: { id: string; params: Partial<PhabricatorAccountParams> },
  ): Promise<PhabricatorAccountState> {
    let tx = await this.startTransaction(true);
    let account = await Account.store(tx).get(id);
    await account.update(params);

    return account.state();
  }

  @Delete()
  public async deleteAccount(
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    let tx = await this.startTransaction(true);

    let account = await Account.store(tx).get(id);
    await account.delete();
  }
}

@Route("/query")
export class SearchController extends ServiceController {
  @Get()
  public async listQueries(): Promise<PhabricatorQueryState[]> {
    return Object.values(Query.queries).map(
      (query: QueryClass): PhabricatorQueryState => ({
        queryId: query.queryId,
        name: query.queryName,
        description: query.description,
      }),
    );
  }
}
