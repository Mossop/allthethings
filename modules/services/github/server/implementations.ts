import { URL } from "url";

import { DateTime } from "luxon";

import { TaskController } from "#schema";
import { BaseAccount, BaseItem, BaseList } from "#server/utils";
import type {
  ResolverImpl,
  ServiceItem,
  Listable,
  ItemStore,
} from "#server/utils";
import type {
  IssueLikeFields,
  LabelFields,
  RepositoryFields,
} from "#services/github/schema";
import { assert } from "#utils";

import { GitHubApi, UserInfo } from "./api";
import type { GithubAccountResolvers, GithubSearchResolvers } from "./schema";
import type { GithubTransaction } from "./stores";
import type {
  GithubAccountRecord,
  GithubIssueLikeRecord,
  GithubLabelRecord,
  GithubRepositoryRecord,
  GithubSearchRecord,
  IssueLikeApiResult,
  LabelApiResult,
  RepositoryApiResult,
} from "./types";

const ISSUELIKE_REGEX =
  /https:\/\/github\.com\/([^/]+)\/(.+)\/(?:pull|issues)\/(\d+)/;

export class Account
  extends BaseAccount<GithubTransaction>
  implements ResolverImpl<GithubAccountResolvers>
{
  private client: GitHubApi | null;

  public constructor(
    tx: GithubTransaction,
    private record: GithubAccountRecord,
  ) {
    super(tx);
    this.client = null;
  }

  public get api(): GitHubApi {
    if (!this.client) {
      this.client = new GitHubApi(this);
    }

    return this.client;
  }

  public updateRecord(record: GithubAccountRecord): void {
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

  public searches(): Promise<Search[]> {
    return this.tx.stores.searches.list({
      accountId: this.id,
    });
  }

  public async items(): Promise<BaseItem[]> {
    return [];
  }

  public async update(): Promise<void> {
    let userInfo = await this.api.userInfo();
    await this.tx.stores.accounts.updateOne(this.id, {
      user: userInfo.viewer.login,
      avatar: userInfo.viewer.avatarUrl,
    });
  }

  public static async create(
    tx: GithubTransaction,
    userId: string,
    code: string,
  ): Promise<Account> {
    let token = await GitHubApi.getToken(code);
    let kit = GitHubApi.getKit(token);
    let userInfo = await UserInfo(kit);

    let existing = await tx.stores.accounts.first({
      userId,
      user: userInfo.viewer.login,
    });

    if (!existing) {
      let record: Omit<GithubAccountRecord, "id"> = {
        userId,
        user: userInfo.viewer.login,
        avatar: userInfo.viewer.avatarUrl,
        token,
      };

      return tx.stores.accounts.insertOne(record);
    } else {
      await tx.stores.accounts.updateOne(existing.id, {
        token,
      });

      return existing;
    }
  }
}

export class Repository {
  public constructor(
    public readonly tx: GithubTransaction,
    private record: GithubRepositoryRecord,
  ) {}

  public static async getOrCreate(
    account: Account,
    record: RepositoryApiResult,
  ): Promise<Repository> {
    let repo = await account.tx.stores.repositories.first({
      accountId: account.id,
      nodeId: record.id,
    });

    if (repo) {
      await repo.tx.stores.repositories.updateOne(repo.id, {
        owner: record.owner.login,
        name: record.name,
        url: record.url,
      });
      return repo;
    }

    return account.tx.stores.repositories.insertOne({
      accountId: account.id,
      nodeId: record.id,
      owner: record.owner.login,
      name: record.name,
      url: record.url,
    });
  }

  public updateRecord(record: GithubRepositoryRecord): void {
    this.record = record;
  }

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
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
  public constructor(
    private readonly tx: GithubTransaction,
    private record: GithubLabelRecord,
  ) {}

  public static async issueLabels(issueLike: IssueLike): Promise<Label[]> {
    let records = await issueLike.tx.stores.labels
      .table()
      .join(
        issueLike.tx.tableRef("IssueLikeLabels"),
        "Label.id",
        "IssueLikeLabels.label",
      )
      .where("IssueLikeLabels.issueLike", issueLike.id)
      .select<GithubLabelRecord[]>("Label.*");

    return Promise.all(
      records.map(
        async (record: GithubLabelRecord): Promise<Label> =>
          new Label(issueLike.tx, record),
      ),
    );
  }

  public static async setIssueLabels(
    issueLike: IssueLike,
    labels: Label[],
  ): Promise<void> {
    let repo = await issueLike.repository();
    await issueLike.tx.stores.issueLikeLabels.setItems(
      issueLike.id,
      labels.map((label: Label) => ({
        label: label.id,
        repositoryId: repo.id,
      })),
    );
  }

  public static async getOrCreate(
    repository: Repository,
    record: LabelApiResult,
  ): Promise<Label> {
    let label = await repository.tx.stores.labels.first({
      repositoryId: repository.id,
      nodeId: record.id,
    });

    if (label) {
      await repository.tx.stores.labels.updateOne(label.id, {
        color: record.color,
        name: record.name,
        url: record.url,
      });
      return label;
    }

    return repository.tx.stores.labels.insertOne({
      repositoryId: repository.id,
      nodeId: record.id,
      color: record.color,
      name: record.name,
      url: record.url,
    });
  }

  public async updateRecord(record: GithubLabelRecord): Promise<void> {
    this.record = record;
  }

  public repository(): Promise<Repository> {
    return assert(this.tx.stores.repositories.get(this.record.repositoryId));
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

export class Search
  extends BaseList<IssueLikeApiResult[], GithubTransaction>
  implements ResolverImpl<GithubSearchResolvers>
{
  public static getStore(tx: GithubTransaction): Listable<Search> {
    return tx.stores.searches;
  }

  public constructor(
    tx: GithubTransaction,
    private record: GithubSearchRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: GithubSearchRecord): Promise<void> {
    this.record = record;
  }

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public get id(): string {
    return this.record.id;
  }

  public get name(): string {
    return this.record.name;
  }

  public get query(): string {
    return this.record.query;
  }

  public override async url(): Promise<string> {
    let url = new URL("https://github.com/issues");
    url.searchParams.set("q", this.query);
    return url.toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.searches.deleteOne(this.id);
  }

  public async listItems(
    issueList?: readonly IssueLikeApiResult[],
  ): Promise<IssueLike[]> {
    let account = await this.account();

    if (!issueList) {
      issueList = await account.api.search(this.query);
    }

    let instances: IssueLike[] = [];

    for (let issue of issueList) {
      let repo = await Repository.getOrCreate(account, issue.repository);

      let instance = await this.tx.stores.issueLikes.first({
        repositoryId: repo.id,
        nodeId: issue.id,
      });

      if (instance) {
        await instance.update(issue);
      } else {
        instance = await IssueLike.create(
          repo,
          issue,
          TaskController.ServiceList,
        );
      }

      instances.push(instance);
    }

    return instances;
  }

  public static async create(
    tx: GithubTransaction,
    account: Account,
    record: Omit<GithubSearchRecord, "id" | "accountId">,
  ): Promise<Search> {
    let issues = await account.api.search(record.query);

    let id = await tx.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      accountId: account.id,
    };

    let search = await tx.stores.searches.insertOne(dbRecord, id);
    await search.update(issues);
    return search;
  }
}

export class IssueLike
  extends BaseItem<GithubTransaction>
  implements ServiceItem<IssueLikeFields>
{
  public static getStore(tx: GithubTransaction): ItemStore<IssueLike> {
    return tx.stores.issueLikes;
  }

  public constructor(
    tx: GithubTransaction,
    private record: GithubIssueLikeRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: GithubIssueLikeRecord): Promise<void> {
    this.record = record;
  }

  public repository(): Promise<Repository> {
    return assert(this.tx.stores.repositories.get(this.record.repositoryId));
  }

  public get id(): string {
    return this.record.id;
  }

  public get nodeId(): string {
    return this.record.nodeId;
  }

  public override async url(): Promise<string> {
    return this.record.url;
  }

  public static recordFromApi(
    data: IssueLikeApiResult,
  ): Omit<GithubIssueLikeRecord, "id" | "repositoryId"> {
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
    let repository = await this.repository();
    let account = await repository.account();

    if (!issueLike) {
      issueLike = (await account.api.node(this.nodeId)) ?? undefined;
      if (!issueLike) {
        return this.tx.deleteItem(this.id);
      }
    }

    await this.tx.stores.issueLikes.updateOne(
      this.id,
      IssueLike.recordFromApi(issueLike),
    );

    let labels: Label[] = [];
    for (let apiLabel of issueLike.labels?.nodes ?? []) {
      if (apiLabel) {
        labels.push(await Label.getOrCreate(repository, apiLabel));
      }
    }

    await Label.setIssueLabels(this, labels);

    await this.tx.setItemTaskDone(
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
    if (data.closedAt && controller == TaskController.Service) {
      controller = TaskController.Manual;
    }

    let account = await repository.account();
    let id = await repository.tx.createItem(account.userId, {
      summary: record.title,
      archived: null,
      snoozed: null,
      done: data.closedAt ? DateTime.fromISO(data.closedAt) : null,
      controller,
    });

    let issueLike = await repository.tx.stores.issueLikes.insertOne(
      {
        ...record,
        repositoryId: repository.id,
      },
      id,
    );

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
    tx: GithubTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<IssueLike | null> {
    let matches = ISSUELIKE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let [, owner, repo, numberStr] = matches;
    let number = parseInt(numberStr);

    for (let account of await tx.stores.accounts.list({ userId })) {
      let repository = await tx.stores.repositories.first({
        accountId: account.id,
        owner: owner,
        name: repo,
      });

      if (repository) {
        let existing = await tx.stores.issueLikes.first({
          repositoryId: repository.id,
          number,
        });

        if (existing) {
          return existing;
        }
      }

      let issueLike = await account.api.lookup(owner, repo, number);
      if (
        issueLike?.__typename != "Issue" &&
        issueLike?.__typename != "PullRequest"
      ) {
        continue;
      }

      if (!repository) {
        repository = await Repository.getOrCreate(
          account,
          issueLike.repository,
        );
      }

      return IssueLike.create(
        repository,
        issueLike,
        isTask ? TaskController.Service : null,
      );
    }

    return null;
  }

  public async fields(): Promise<IssueLikeFields> {
    let { id, repositoryId, nodeId, ...fields } = this.record;

    let labels = await Label.issueLabels(this);
    let labelFields = Promise.all(
      labels.map((label: Label): Promise<LabelFields> => label.fields()),
    );

    let repository = await this.repository();
    return {
      ...fields,
      repository: await repository.fields(),
      labels: await labelFields,
    };
  }
}
