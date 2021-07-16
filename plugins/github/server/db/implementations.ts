import type { URL } from "url";

import { DateTime } from "luxon";

import type { IssueLikeFields, LabelFields, RepositoryFields } from "#plugins/github/schema";
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
import type { IssueLikeApiResult, LabelApiResult, RepositoryApiResult } from "../types";
import type {
  GithubAccountRecord,
  GithubIssueLikeRecord,
  GithubLabelRecord,
  GithubRepositoryRecord,
  IssueLikeLabelsRecord,
} from "./types";

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
    let userInfo = await this.api.userInfo();
    await Account.store.update(this.context, {
      id: this.id,
      user: userInfo.viewer.login,
      avatar: userInfo.viewer.avatarUrl,
    });
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

export class Repository {
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(Repository),
    "Repository",
  );

  public constructor(
    public readonly account: Account,
    private record: GithubRepositoryRecord,
  ) {
  }

  public static async getOrCreate(
    account: Account,
    record: RepositoryApiResult,
  ): Promise<Repository> {
    let repo = await Repository.store.first(account.context, {
      ownerId: account.id,
      nodeId: record.id,
    });

    if (repo) {
      await Repository.store.update(account.context, {
        id: repo.id,
        owner: record.owner.login,
        name: record.name,
        url: record.url,
      });
      return repo;
    }

    return Repository.store.insert(account.context, {
      id: await account.context.id(),
      ownerId: account.id,
      nodeId: record.id,
      owner: record.owner.login,
      name: record.name,
      url: record.url,
    });
  }

  public async onRecordUpdate(record: GithubRepositoryRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
  }

  public get context(): PluginContext {
    return this.account.context;
  }

  public get id(): string {
    return this.record.id;
  }

  public get nodeId(): string {
    return this.record.nodeId;
  }

  public async fields(): Promise<RepositoryFields> {
    return {
      owner: this.record.owner,
      name: this.record.name,
      url: this.record.url,
    };
  }
}

export class Label {
  public static readonly store = new OwnedItemsTable(
    Repository.store,
    classBuilder(Label),
    "Label",
  );

  public constructor(
    private readonly repository: Repository,
    private record: GithubLabelRecord,
  ) {
  }

  public static async issueLabels(issueLike: IssueLike): Promise<Label[]> {
    let records = await Label.store.table(issueLike.context)
      .join(issueLike.context.tableRef("IssueLikeLabels"), "Label.id", "IssueLikeLabels.label")
      .where("IssueLikeLabels.issueLike", issueLike.id)
      .select<GithubLabelRecord[]>("Label.*");

    return records.map((record: GithubLabelRecord): Label => new Label(issueLike.owner, record));
  }

  public static async setIssueLabels(issueLike: IssueLike, labels: Label[]): Promise<void> {
    let labelIds = labels.map((label: Label): string => label.id);

    await issueLike.context.table<IssueLikeLabelsRecord>("IssueLikeLabels")
      .where("issueLike", issueLike.id)
      .delete();

    await issueLike.context.table<IssueLikeLabelsRecord>("IssueLikeLabels")
      .insert(labelIds.map((label: string): IssueLikeLabelsRecord => ({
        ownerId: issueLike.owner.id,
        issueLike: issueLike.id,
        label,
      })));
  }

  public static async getOrCreate(
    repository: Repository,
    record: LabelApiResult,
  ): Promise<Label> {
    let label = await Label.store.first(repository.context, {
      ownerId: repository.id,
      nodeId: record.id,
    });

    if (label) {
      await Label.store.update(repository.context, {
        id: label.id,
        color: record.color,
        name: record.name,
        url: record.url,
      });
      return label;
    }

    return Label.store.insert(repository.context, {
      id: await repository.context.id(),
      ownerId: repository.id,
      nodeId: record.id,
      color: record.color,
      name: record.name,
      url: record.url,
    });
  }

  public async onRecordUpdate(record: GithubLabelRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Repository {
    return this.repository;
  }

  public get id(): string {
    return this.record.id;
  }

  public get nodeId(): string {
    return this.record.nodeId;
  }

  public async fields(): Promise<LabelFields> {
    return {
      name: this.record.name,
      color: this.record.color,
      url: this.record.url,
    };
  }
}

export class IssueLike extends BaseItem {
  public static readonly store = new OwnedItemsTable(
    Repository.store,
    classBuilder(IssueLike),
    "IssueLike",
  );

  public constructor(
    private readonly repository: Repository,
    private record: GithubIssueLikeRecord,
  ) {
    super(repository.context);
  }

  public async onRecordUpdate(record: GithubIssueLikeRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Repository {
    return this.repository;
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
  ): Omit<GithubIssueLikeRecord, "id" | "ownerId" | "repository"> {
    let state = data.__typename == "Issue" ? data.issueState : data.prState;
    return {
      nodeId: data.id,
      type: data.__typename == "Issue" ? "issue" : "pr",
      number: data.number,
      title: data.title,
      url: data.url,
      state,
    };
  }

  public override async update(issueLike?: IssueLikeApiResult): Promise<void> {
    if (!issueLike) {
      issueLike = await this.repository.account.api.node(this.nodeId) ?? undefined;
      if (!issueLike) {
        return this.context.deleteItem(this.id);
      }
    }

    let record = IssueLike.recordFromApi(issueLike);

    await IssueLike.store.update(this.context, {
      id: this.id,
      ...record,
    });

    let labels: Label[] = [];
    for (let apiLabel of issueLike.labels?.nodes ?? []) {
      if (apiLabel) {
        labels.push(await Label.getOrCreate(this.repository, apiLabel));
      }
    }

    await Label.setIssueLabels(this, labels);

    await this.context.setItemTaskDone(
      this.id,
      issueLike.closedAt ? DateTime.fromISO(issueLike.closedAt) : null,
    );
  }

  public static async create(
    repository: Repository,
    data: IssueLikeApiResult,
    controller: TaskController | null,
  ): Promise<IssueLike> {
    let record = IssueLike.recordFromApi(data);

    // Probably didn't want to create an already complete task.
    if (data.closedAt && controller == TaskController.Plugin) {
      controller = TaskController.Manual;
    }

    let id = await repository.context.createItem(repository.account.userId, {
      summary: record.title,
      archived: null,
      snoozed: null,
      done: data.closedAt ? DateTime.fromISO(data.closedAt) : null,
      controller,
    });

    let issueLike = await IssueLike.store.insert(repository.context, {
      ...record,
      id,
      ownerId: repository.id,
    });

    let labels: Label[] = [];
    for (let apiLabel of data.labels?.nodes ?? []) {
      if (apiLabel) {
        labels.push(await Label.getOrCreate(repository, apiLabel));
      }
    }

    await Label.setIssueLabels(issueLike, labels);

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
      let repository = await Repository.store.first(account.context, {
        ownerId: account.id,
        owner: owner,
        name: repo,
      });

      if (repository) {
        let existing = await IssueLike.store.first(account.context, {
          ownerId: repository.id,
          number,
        });

        if (existing) {
          return existing;
        }
      }

      let issueLike = await account.api.lookup(owner, repo, number);
      if (issueLike?.__typename != "Issue" && issueLike?.__typename != "PullRequest") {
        continue;
      }

      if (!repository) {
        repository = await Repository.getOrCreate(account, issueLike.repository);
      }

      return IssueLike.create(repository, issueLike, isTask ? TaskController.Plugin : null);
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

    let labels = await Label.issueLabels(this);
    let labelFields = Promise.all(
      labels.map((label: Label): Promise<LabelFields> => label.fields()),
    );

    return {
      ...fields,
      repository: await this.repository.fields(),
      labels: await labelFields,
    };
  }
}
