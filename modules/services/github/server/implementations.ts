import { URL } from "url";

import { DateTime } from "luxon";

import { In, Not, sql } from "../../../db";
import {
  TaskController,
  BaseAccount,
  BaseItem,
  BaseList,
  EntityImpl,
  id,
  IdentifiedEntityImpl,
  ref,
  storeBuilder,
} from "../../../server/utils";
import type { ServiceItem, ServiceTransaction } from "../../../server/utils";
import type { DateTimeOffset } from "../../../utils";
import { map, offsetFromJson } from "../../../utils";
import type { IssueLikeFields, LabelFields, RepositoryFields } from "../schema";
import { GitHubApi, UserInfo } from "./api";
import type {
  GithubAccountEntity,
  GithubIssueLikeEntity,
  GithubLabelEntity,
  GithubRepositoryEntity,
  GithubSearchEntity,
  IssueLikeLabelEntity,
} from "./entities";
import type {
  IssueLikeApiResult,
  LabelApiResult,
  RepositoryApiResult,
} from "./types";

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

  public async items(): Promise<IssueLike[]> {
    return IssueLike.store(this.tx).list(sql`
      SELECT "IssueLike".*
      FROM ${ref(IssueLike)} AS "IssueLike"
      JOIN ${ref(
        Repository,
      )} AS "Repository" ON "Repository"."id"="IssueLike"."repositoryId"
      WHERE "Repository"."accountId"=${this.id}
    `);
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

export class Repository extends IdentifiedEntityImpl<
  GithubRepositoryEntity,
  ServiceTransaction
> {
  public static readonly store = storeBuilder(Repository, "github.Repository");

  public static async getOrCreate(
    account: Account,
    record: RepositoryApiResult,
  ): Promise<Repository> {
    let repo = await Repository.store(account.tx).findOne({
      accountId: account.id,
      nodeId: record.id,
    });

    if (repo) {
      await repo.update({
        owner: record.owner.login,
        name: record.name,
        url: record.url,
      });
      return repo;
    }

    return Repository.store(account.tx).create({
      id: await id(),
      accountId: account.id,
      nodeId: record.id,
      owner: record.owner.login,
      name: record.name,
      url: record.url,
    });
  }

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get nodeId(): string {
    return this.entity.nodeId;
  }

  public async fields(): Promise<RepositoryFields> {
    return {
      owner: this.entity.owner,
      name: this.entity.name,
      url: this.entity.url,
    };
  }
}

export class Label extends IdentifiedEntityImpl<
  GithubLabelEntity,
  ServiceTransaction
> {
  public static readonly store = storeBuilder(Label, "github.Label");

  public static async getOrCreate(
    repository: Repository,
    record: LabelApiResult,
  ): Promise<Label> {
    let label = await Label.store(repository.tx).findOne({
      repositoryId: repository.id,
      nodeId: record.id,
    });

    if (label) {
      await label.update({
        color: record.color,
        name: record.name,
        url: record.url,
      });
      return label;
    }

    return Label.store(repository.tx).create({
      id: await id(),
      repositoryId: repository.id,
      nodeId: record.id,
      color: record.color,
      name: record.name,
      url: record.url,
    });
  }

  public repository(): Promise<Repository> {
    return Repository.store(this.tx).get(this.entity.repositoryId);
  }

  public get nodeId(): string {
    return this.entity.nodeId;
  }

  public async fields(): Promise<LabelFields> {
    return {
      name: this.entity.name,
      color: this.entity.color,
      url: this.entity.url,
    };
  }
}

export type GithubSearchParams = Omit<GithubSearchEntity, "id" | "accountId">;
export type GithubSearchState = Omit<GithubSearchEntity, "accountId"> & {
  url: string;
};

export class Search extends BaseList<GithubSearchEntity, IssueLikeApiResult[]> {
  public static readonly store = storeBuilder(Search, "github.Search");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
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

  public async listItems(
    issueList?: readonly IssueLikeApiResult[],
  ): Promise<IssueLike[]> {
    let account = await this.account();

    if (!issueList) {
      issueList = await account.api.search(this.entity.query);
    }

    let instances: IssueLike[] = [];

    for (let issue of issueList) {
      let repo = await Repository.getOrCreate(account, issue.repository);

      let instance = await IssueLike.store(this.tx).findOne({
        repositoryId: repo.id,
        nodeId: issue.id,
      });

      if (instance) {
        await instance.updateItem(issue);
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
    account: Account,
    record: GithubSearchParams,
  ): Promise<Search> {
    let issues = await account.api.search(record.query);

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    let search = await Search.store(account.tx).create(dbRecord);
    await search.updateList(issues);
    return search;
  }
}

export class IssueLike
  extends BaseItem<GithubIssueLikeEntity>
  implements ServiceItem<IssueLikeFields>
{
  public static readonly store = storeBuilder(IssueLike, "github.IssueLike");

  public repository(): Promise<Repository> {
    return Repository.store(this.tx).get(this.entity.repositoryId);
  }

  public get nodeId(): string {
    return this.entity.nodeId;
  }

  public override async url(): Promise<string> {
    return this.entity.url;
  }

  public static recordFromApi(
    data: IssueLikeApiResult,
  ): Omit<GithubIssueLikeEntity, "id" | "repositoryId"> {
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

  public override async updateItem(
    issueLike?: IssueLikeApiResult,
  ): Promise<void> {
    let repository = await this.repository();
    let account = await repository.account();

    if (!issueLike) {
      issueLike = (await account.api.node(this.nodeId)) ?? undefined;
      if (!issueLike) {
        return this.tx.deleteItem(this.id);
      }
    }

    await this.update(IssueLike.recordFromApi(issueLike));

    let labels: Label[] = [];
    for (let apiLabel of issueLike.labels?.nodes ?? []) {
      if (apiLabel) {
        labels.push(await Label.getOrCreate(repository, apiLabel));
      }
    }

    await IssueLikeLabel.setIssueLabels(this, labels);

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

    let issueLike = await IssueLike.store(repository.tx).create({
      ...record,
      id,
      repositoryId: repository.id,
    });

    let labels: Label[] = [];
    for (let apiLabel of data.labels?.nodes ?? []) {
      if (apiLabel) {
        labels.push(await Label.getOrCreate(repository, apiLabel));
      }
    }

    await IssueLikeLabel.setIssueLabels(issueLike, labels);

    return issueLike;
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
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

    for (let account of await Account.store(tx).find({ userId })) {
      let repository = await Repository.store(tx).findOne({
        accountId: account.id,
        owner: owner,
        name: repo,
      });

      if (repository) {
        let existing = await IssueLike.store(tx).findOne({
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
    let { id, repositoryId, nodeId, ...fields } = this.entity;

    let labels = await IssueLikeLabel.issueLabels(this);
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

class IssueLikeLabel extends EntityImpl<
  IssueLikeLabelEntity,
  ServiceTransaction
> {
  public static readonly store = storeBuilder(
    IssueLikeLabel,
    "github.IssueLikeLabel",
    ["issueLike", "label"],
  );

  public static async issueLabels(issueLike: IssueLike): Promise<Label[]> {
    return Label.store(issueLike.tx).list(sql`
      SELECT "Label".*
      FROM ${ref(Label)} AS "Label"
        JOIN ${ref(
          IssueLikeLabel,
        )} AS "IssueLikeLabel" ON "IssueLikeLabel"."label" = "Label"."id"
        WHERE "IssueLikeLabel"."issueLike" = ${issueLike.id}
    `);
  }

  public static async setIssueLabels(
    issueLike: IssueLike,
    labels: Label[],
  ): Promise<void> {
    let store = IssueLikeLabel.store(issueLike.tx);
    await store.delete({
      issueLike: issueLike.id,
      label: Not(In(labels.map((label: Label) => label.id))),
    });

    await store.upsert(
      labels.map((label: Label) => ({
        repositoryId: issueLike.entity.repositoryId,
        issueLike: issueLike.id,
        label: label.id,
      })),
    );
  }
}
