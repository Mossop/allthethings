import { Body, Delete, Get, Patch, Put, Route } from "@tsoa/runtime";

import { ServiceController } from "../../../server/utils";
import { map } from "../../../utils";
import { GoogleApi } from "./api";
import type {
  GoogleAccountState,
  GoogleMailSearchParams,
  GoogleMailSearchState,
} from "./implementations";
import { MailSearch, Account } from "./implementations";

@Route()
export class MainController extends ServiceController {
  @Get("loginUrl")
  public async getLoginUrl(): Promise<string> {
    return GoogleApi.generateAuthUrl(this.serviceUrl, this.userId);
  }

  @Get("accounts")
  public async listAccounts(): Promise<GoogleAccountState[]> {
    let tx = await this.startTransaction(false);

    return map(
      Account.store(tx).find({ userId: this.userId }),
      (account: Account): Promise<GoogleAccountState> => account.state(),
    );
  }
}

@Route("/search")
export class SearchController extends ServiceController {
  @Put()
  public async createSearch(
    @Body()
    {
      accountId,
      params,
    }: {
      accountId: string;
      params: GoogleMailSearchParams;
    },
  ): Promise<GoogleMailSearchState> {
    let tx = await this.startTransaction(true);

    let account = await Account.store(tx).get(accountId);
    let search = await MailSearch.create(account, params);
    return search.state();
  }

  @Patch()
  public async editSearch(
    @Body()
    { id, params }: { id: string; params: Partial<GoogleMailSearchParams> },
  ): Promise<GoogleMailSearchState> {
    let tx = await this.startTransaction(true);

    let search = await MailSearch.store(tx).get(id);
    await search.update(params);
    return search.state();
  }

  @Delete()
  public async deleteSearch(
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    let tx = await this.startTransaction(true);

    let search = await MailSearch.store(tx).get(id);
    await search.delete();
  }
}
