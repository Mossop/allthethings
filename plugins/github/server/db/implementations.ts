import type { URL } from "url";

import { DateTime } from "luxon";

import type { IssueLikeFields } from "#plugins/github/schema";
import { TaskController } from "#schema";
import {
  BaseAccount,
  ItemsTable,
  classBuilder,
  BaseItem,
  OwnedItemsTable,
} from "#server-utils";
import type {
  PluginContext,
  AuthedPluginContext,
} from "#server-utils";

import { GitHubApi, UserInfo } from "../api";
import type { GithubAccountResolvers } from "../schema";
import type { IssueLikeApiResult } from "../types";
import type { GithubAccountRecord, GithubIssueLikeRecord } from "./types";

const ISSUELIKE_REGEX = /https:\/\/github\.com\/([^/]+)\/(.+)\/(?:pull|issues)\/(\d+)/;

export class Account extends BaseAccount implements GithubAccountResolvers {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  private client: GitHubApi | null;

  public constructor(
    public override readonly context: PluginContext,
    private record: GithubAccountRecord,
  ) {
    super(context);
    this.client = null;
  }

  public get api(): GitHubApi {
    if (!this.client) {
      this.client = new GitHubApi(this);
    }

    return this.client;
  }

  public async onRecordUpdate(record: GithubAccountRecord): Promise<void> {
    this.record = record;
  }

  public get token(): string {
    return this.record.token;
  }

  public get id(): string {
    return this.record.id;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get user(): string {
    return this.record.user;
  }

  public get avatar(): string {
    return this.record.avatar;
  }

  public get loginUrl(): string {
    return this.api.generateLoginUrl();
  }

  public async items(): Promise<BaseItem[]> {
    return [];
  }

  public async update(): Promise<void> {
    // TODO
  }

  public static async create(context: AuthedPluginContext, code: string): Promise<Account> {
    let token = await GitHubApi.getToken(code);
    let kit = GitHubApi.getKit(token);
    let userInfo = await UserInfo(kit);

    let existing = await Account.store.first(context, {
      userId: context.userId,
      user: userInfo.viewer.login,
    });

    if (!existing) {
      let record: GithubAccountRecord = {
        id: await context.id(),
        userId: context.userId,
        user: userInfo.viewer.login,
        avatar: userInfo.viewer.avatarUrl,
        token,
      };

      return Account.store.insert(context, record);
    } else {
      await Account.store.update(context, {
        id: existing.id,
        token,
      });

      return existing;
    }
  }
}

export class IssueLike extends BaseItem {
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(IssueLike),
    "IssueLike",
  );

  public constructor(
    private readonly account: Account,
    private record: GithubIssueLikeRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: GithubIssueLikeRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get nodeId(): string {
    return this.record.nodeId;
  }

  public override get url(): string {
    return this.record.url;
  }

  public static recordFromApi(
    data: IssueLikeApiResult,
  ): Omit<GithubIssueLikeRecord, "id" | "ownerId"> {
    return {
      nodeId: data.id,
      type: data.__typename == "Issue" ? "issue" : "pr",
      number: data.number,
      title: data.title,
      url: data.url,
      repositoryOwner: data.repository.owner.login,
      repositoryName: data.repository.name,
    };
  }

  public override async update(issueLike?: IssueLikeApiResult): Promise<void> {
    if (!issueLike) {
      issueLike = await this.account.api.node(this.nodeId) ?? undefined;
      if (!issueLike) {
        return this.context.deleteItem(this.id);
      }
    }

    let record = IssueLike.recordFromApi(issueLike);

    await IssueLike.store.update(this.context, {
      id: this.id,
      ...record,
    });

    await this.context.setItemTaskDone(
      this.id,
      issueLike.closedAt ? DateTime.fromISO(issueLike.closedAt) : null,
    );
  }

  public static async create(
    account: Account,
    data: IssueLikeApiResult,
    controller: TaskController | null,
  ): Promise<IssueLike> {
    let record = IssueLike.recordFromApi(data);

    // Probably didn't want to create an already complete task.
    if (data.closedAt && controller == TaskController.Plugin) {
      controller = TaskController.Manual;
    }

    let id = await account.context.createItem(account.userId, {
      summary: record.title,
      archived: null,
      snoozed: null,
      done: data.closedAt ? DateTime.fromISO(data.closedAt) : null,
      controller,
    });

    let issueLike = await IssueLike.store.insert(account.context, {
      ...record,
      id,
      ownerId: account.id,
    });

    return issueLike;
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<IssueLike | null> {
    let matches = ISSUELIKE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let [, owner, repo, numberStr] = matches;
    let number = parseInt(numberStr);

    for (let account of await Account.store.list(context, { userId: context.userId })) {
      let existing = await IssueLike.store.first(account.context, {
        ownerId: account.id,
        number,
        repositoryOwner: owner,
        repositoryName: repo,
      });

      if (existing) {
        return existing;
      }

      let issueLike = await account.api.lookup(owner, repo, number);
      if (issueLike?.__typename != "Issue" && issueLike?.__typename != "PullRequest") {
        continue;
      }

      return IssueLike.create(account, issueLike, isTask ? TaskController.Plugin : null);
    }

    return null;
  }

  public async fields(): Promise<IssueLikeFields> {
    let {
      id,
      ownerId,
      nodeId,
      ...fields
    } = this.record;

    return fields;
  }
}
