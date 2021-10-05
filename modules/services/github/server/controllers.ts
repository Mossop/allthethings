import { Body, Delete, Get, Patch, Put, Route } from "@tsoa/runtime";

import { ServiceController } from "../../../server/utils";
import { map } from "../../../utils";
import { GitHubApi } from "./api";
import type {
  GithubAccountState,
  GithubSearchParams,
  GithubSearchState,
} from "./implementations";
import { Search, Account } from "./implementations";

@Route()
export class MainController extends ServiceController {
  @Get("loginUrl")
  public async getLoginUrl(): Promise<string> {
    return GitHubApi.generateLoginUrl(this.serviceUrl, this.userId);
  }

  @Get("accounts")
  public async listAccounts(): Promise<GithubAccountState[]> {
    let tx = await this.startTransaction(false);

    return map(
      Account.store(tx).find({ userId: this.userId }),
      (account: Account): Promise<GithubAccountState> => account.state(),
    );
  }
}

@Route("/search")
export class SearchController extends ServiceController {
  @Put()
  public async createSearch(
    @Body()
    { accountId, params }: { accountId: string; params: GithubSearchParams },
  ): Promise<GithubSearchState> {
    let tx = await this.startTransaction(true);

    let account = await Account.store(tx).get(accountId);
    let search = await Search.create(account, params);
    return search.state();
  }

  @Patch()
  public async editSearch(
    @Body()
    { id, params }: { id: string; params: Partial<GithubSearchParams> },
  ): Promise<GithubSearchState> {
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
