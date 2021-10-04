import { URL } from "url";

import { Body, Delete, Get, Patch, Put, Route } from "@tsoa/runtime";

import {
  bestIcon,
  loadPageInfo,
  ServiceController,
} from "../../../server/utils";
import { map } from "../../../utils";
import type {
  BugzillaAccountState,
  BugzillaAccountParams,
  BugzillaSearchParams,
  BugzillaSearchState,
} from "./implementations";
import { Search, Account } from "./implementations";

@Route("/account")
export class AccountController extends ServiceController {
  @Get()
  public async listAccounts(): Promise<BugzillaAccountState[]> {
    let tx = await this.startTransaction(false);
    let accounts = await Account.store(tx).find({ userId: this.userId });
    return map(
      accounts,
      (account: Account): Promise<BugzillaAccountState> => account.state(),
    );
  }

  @Put()
  public async createAccount(
    @Body()
    { params }: { params: BugzillaAccountParams },
  ): Promise<BugzillaAccountState> {
    let tx = await this.startTransaction(true);

    let api = Account.buildAPI(params);
    if (params.username) {
      await api.whoami();
    } else {
      await api.version();
    }

    let info = await loadPageInfo(tx.segment, new URL(params.url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    let account = await Account.create(tx, this.userId, {
      ...params,
      icon,
    });

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
    { accountId, params }: { accountId: string; params: BugzillaSearchParams },
  ): Promise<BugzillaSearchState> {
    let tx = await this.startTransaction(true);

    let account = await Account.store(tx).get(accountId);
    let search = await Search.create(account, params);
    return search.state();
  }

  @Patch()
  public async editSearch(
    @Body()
    { id, params }: { id: string; params: Partial<BugzillaSearchParams> },
  ): Promise<BugzillaSearchState> {
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
