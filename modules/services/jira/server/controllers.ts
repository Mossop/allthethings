import { Body, Delete, Get, Patch, Put, Route } from "@tsoa/runtime";

import { ServiceController } from "../../../server/utils";
import { map } from "../../../utils";
import type {
  JiraAccountState,
  JiraAccountParams,
  JiraSearchParams,
  JiraSearchState,
} from "./implementations";
import { Search, Account } from "./implementations";

@Route("/account")
export class AccountController extends ServiceController {
  @Get()
  public async listAccounts(): Promise<JiraAccountState[]> {
    let tx = await this.startTransaction(false);
    let accounts = await Account.store(tx).find({ userId: this.userId });
    return map(
      accounts,
      (account: Account): Promise<JiraAccountState> => account.state(),
    );
  }

  @Put()
  public async createAccount(
    @Body()
    { params }: { params: JiraAccountParams },
  ): Promise<JiraAccountState> {
    let tx = await this.startTransaction(true);
    let account = await Account.create(tx, this.userId, params);

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

@Route("/search")
export class SearchController extends ServiceController {
  @Put()
  public async createSearch(
    @Body()
    { accountId, params }: { accountId: string; params: JiraSearchParams },
  ): Promise<JiraSearchState> {
    let tx = await this.startTransaction(true);

    let account = await Account.store(tx).get(accountId);
    let search = await Search.create(account, params);
    return search.state();
  }

  @Patch()
  public async editSearch(
    @Body()
    { id, params }: { id: string; params: Partial<JiraSearchParams> },
  ): Promise<JiraSearchState> {
    let tx = await this.startTransaction(true);

    let search = await Search.store(tx).get(id);
    await search.update(params);
    return search.state();
  }

  @Delete()
  public async deleteSearch(
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    let tx = await this.startTransaction(true);

    let search = await Search.store(tx).get(id);
    await search.delete();
  }
}
