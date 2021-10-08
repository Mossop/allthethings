import { URL } from "url";

import { DateTime } from "luxon";

import { sql } from "../../../db";
import {
  BaseAccount,
  BaseList,
  id,
  storeBuilder,
  ItemUpdater,
} from "../../../server/utils";
import type {
  ServiceTransaction,
  CoreItemParams,
  RemoteList,
} from "../../../server/utils";
import type { DateTimeOffset } from "../../../utils";
import { decodeRelativeDateTime, map, offsetFromJson } from "../../../utils";
import type { IssueLikeFields, LabelFields } from "../schema";
import { GitHubApi, UserInfo } from "./api";
import type {
  GithubAccountEntity,
  GithubIssueLikeEntity,
  GithubSearchEntity,
} from "./entities";
import type { IssueLikeApiResult, LabelApiResult } from "./types";

const ISSUELIKE_REGEX =
  /https:\/\/github\.com\/([^/]+)\/(.+)\/(?:pull|issues)\/(\d+)/;

export type GithubAccountParams = Omit<GithubAccountEntity, "id" | "userId">;
export type GithubAccountState = Omit<
  GithubAccountEntity,
  "userId" | "token"
> & {
  loginUrl: string;
  searches: GithubSearchState[];
};

interface RemoteIssueLike {
  issueLike: IssueLikeApiResult;
  accountId: string;
}

export class Account extends BaseAccount<GithubAccountEntity> {
  public static readonly store = storeBuilder(Account, "github.Account");

  private client: GitHubApi | null = null;

  public get api(): GitHubApi {
    if (!this.client) {
      this.client = new GitHubApi(this);
    }

    return this.client;
  }

  public get token(): string {
    return this.entity.token;
  }

  public get userId(): string {
    return this.entity.userId;
  }

  public get user(): string {
    return this.entity.user;
  }

  public get loginUrl(): string {
    return this.api.generateLoginUrl();
  }

  protected lists(): Promise<Search[]> {
    return this.searches();
  }

  public searches(): Promise<Search[]> {
    return Search.store(this.tx).find({
      accountId: this.id,
    });
  }

  public async state(): Promise<GithubAccountState> {
    return {
      id: this.id,
      user: this.entity.user,
      avatar: this.entity.avatar,
      loginUrl: this.loginUrl,
      searches: await map(
        this.searches(),
        (search: Search): Promise<GithubSearchState> => search.state(),
      ),
    };
  }

  protected items(): Promise<string[]> {
    return this.db.pluck<string>(
      sql`SELECT "id" FROM "github"."IssueLike" WHERE "accountId" = ${this.id}`,
    );
  }

  public async updateAccount(): Promise<void> {
    let userInfo = await this.api.userInfo();

    await this.update({
      user: userInfo.viewer.login,
      avatar: userInfo.viewer.avatarUrl,
    });
  }

  public static async create(
    tx: ServiceTransaction,
    userId: string,
    code: string,
  ): Promise<Account> {
    let token = await GitHubApi.getToken(code);
    let kit = GitHubApi.getKit(token);
    let userInfo = await UserInfo(kit);

    let existing = await Account.store(tx).findOne({
      userId,
      user: userInfo.viewer.login,
    });

    if (!existing) {
      let record: GithubAccountEntity = {
        id: await id(),
        userId,
        user: userInfo.viewer.login,
        avatar: userInfo.viewer.avatarUrl,
        token,
      };

      return Account.store(tx).create(record);
    } else {
      await existing.update({
        token,
      });

      return existing;
    }
  }
}

export type GithubSearchParams = Omit<GithubSearchEntity, "id" | "accountId">;
export type GithubSearchState = Omit<GithubSearchEntity, "accountId"> & {
  url: string;
};

export class Search extends BaseList<GithubSearchEntity, RemoteIssueLike> {
  public static readonly store = storeBuilder(Search, "github.Search");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public async userId(): Promise<string> {
    let account = await this.account();
    return account.entity.userId;
  }

  public get name(): string {
    return this.entity.name;
  }

  public override get dueOffset(): DateTimeOffset | null {
    return this.entity.dueOffset
      ? offsetFromJson(JSON.parse(this.entity.dueOffset))
      : null;
  }

  public override async url(): Promise<string> {
    let url = new URL("https://github.com/issues");
    url.searchParams.set("q", this.entity.query);
    return url.toString();
  }

  public async state(): Promise<GithubSearchState> {
    return {
      id: this.id,
      name: this.name,
      query: this.entity.query,
      dueOffset: this.entity.dueOffset,
      url: await this.url(),
    };
  }

  public async listItems(): Promise<RemoteIssueLike[]> {
    let account = await this.account();
    return map(
      account.api.search(this.entity.query),
      (issueLike: IssueLikeApiResult): RemoteIssueLike => ({
        accountId: this.entity.accountId,
        issueLike,
      }),
    );
  }

  public static async create(
    account: Account,
    record: GithubSearchParams,
  ): Promise<Search> {
    let issues = await map(
      account.api.search(record.query),
      (issueLike: IssueLikeApiResult): RemoteIssueLike => ({
        accountId: account.id,
        issueLike,
      }),
    );

    let url = new URL("https://github.com/issues");
    url.searchParams.set("q", record.query);

    let updater = new IssueLikeUpdater(account.tx);
    let id = await updater.addList({
      userId: account.entity.userId,
      url: url.toString(),
      due: decodeRelativeDateTime(record.dueOffset),
      name: record.name,
      remotes: issues,
    });

    let dbRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    return Search.store(account.tx).create(dbRecord);
  }
}

export class IssueLikeUpdater extends ItemUpdater<
  GithubIssueLikeEntity,
  RemoteIssueLike
> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "github.IssueLike", "nodeId");
  }

  private accounts: Map<string, Account> = new Map();

  protected override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
    }
  }

  protected async entityForRemote({
    accountId,
    issueLike,
  }: RemoteIssueLike): Promise<GithubIssueLikeEntity> {
    return {
      accountId,
      nodeId: issueLike.id,
    };
  }

  protected paramsForRemote({ issueLike }: RemoteIssueLike): CoreItemParams {
    let isLabel = (label: LabelApiResult | null): label is LabelApiResult =>
      !!label;
    let labels = issueLike.labels?.nodes?.filter(isLabel) ?? [];

    let fields: IssueLikeFields = {
      type: issueLike.__typename == "Issue" ? "issue" : "pr",
      number: issueLike.number,
      title: issueLike.title,
      url: issueLike.url,
      state:
        issueLike.__typename == "Issue"
          ? issueLike.issueState
          : issueLike.prState,
      repository: {
        name: issueLike.repository.name,
        owner: issueLike.repository.owner.login,
        url: issueLike.repository.url,
      },
      labels: labels.map(
        (label: LabelApiResult): LabelFields => ({
          color: label.color,
          name: label.name,
          url: label.url,
        }),
      ),
    };

    return {
      summary: issueLike.title,
      fields,
      due: null,
      done: issueLike.closedAt ? DateTime.fromISO(issueLike.closedAt) : null,
    };
  }

  protected async updateEntities(
    entities: GithubIssueLikeEntity[],
  ): Promise<RemoteIssueLike[]> {
    let results: RemoteIssueLike[] = [];

    for (let entity of entities) {
      let account = this.accounts.get(entity.accountId)!;

      let node = await account.api.node(entity.nodeId);
      if (node) {
        results.push({
          accountId: account.id,
          issueLike: node,
        });
      }
    }

    return results;
  }

  protected getLists(): Promise<RemoteList<RemoteIssueLike>[]> {
    return Search.store(this.tx).find();
  }

  protected async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteIssueLike | null> {
    let matches = ISSUELIKE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let [, owner, repo, numberStr] = matches;
    let number = parseInt(numberStr);

    for (let account of this.accounts.values()) {
      if (account.entity.userId != userId) {
        continue;
      }

      let issueLike = await account.api.lookup(owner, repo, number);
      if (
        issueLike?.__typename == "Issue" ||
        issueLike?.__typename == "PullRequest"
      ) {
        return {
          accountId: account.id,
          issueLike,
        };
      }
    }

    return null;
  }
}
