import { URL } from "url";

import type { Version3Models } from "jira.js";
import { Version3Client } from "jira.js";
import { DateTime } from "luxon";

import { sql } from "../../../db";
import type {
  CoreItemParams,
  RemoteList,
  ServiceTransaction,
} from "../../../server/utils";
import {
  ItemUpdater,
  id,
  storeBuilder,
  BaseList,
  BaseAccount,
} from "../../../server/utils";
import type { DateTimeOffset } from "../../../utils";
import { decodeRelativeDateTime, map, offsetFromJson } from "../../../utils";
import type { IssueFields } from "../schema";
import type {
  JiraAccountEntity,
  JiraIssueEntity,
  JiraSearchEntity,
} from "./entities";

type JiraIssue = Version3Models.Issue;

export type JiraAccountParams = Omit<
  JiraAccountEntity,
  "id" | "userId" | "serverName" | "userName"
>;

export type JiraAccountState = Omit<JiraAccountEntity, "userId"> & {
  searches: JiraSearchState[];
};

export class Account extends BaseAccount<JiraAccountEntity> {
  public static readonly store = storeBuilder(Account, "jira.Account");

  public get userId(): string {
    return this.entity.userId;
  }

  public get url(): string {
    return this.entity.url;
  }

  protected lists(): Promise<Search[]> {
    return this.searches;
  }

  public get searches(): Promise<Search[]> {
    return Search.store(this.tx).find({
      accountId: this.id,
    });
  }

  public async state(): Promise<JiraAccountState> {
    return {
      id: this.id,
      apiToken: this.entity.apiToken,
      email: this.entity.email,
      userName: this.entity.userName,
      serverName: this.entity.serverName,
      url: this.entity.url,
      searches: await map(
        this.searches,
        (search: Search): Promise<JiraSearchState> => search.state(),
      ),
    };
  }

  public async items(): Promise<string[]> {
    return this.tx.db.pluck<string>(
      sql`SELECT "id" FROM "jira"."Issue" WHERE "accountId" = ${this.id}`,
    );
  }

  public get apiClient(): Version3Client {
    return new Version3Client({
      host: this.url,
      authentication: {
        basic: {
          email: this.entity.email,
          apiToken: this.entity.apiToken,
        },
      },
      telemetry: false,
    });
  }

  public async updateAccount(): Promise<void> {
    let client = this.apiClient;

    let serverInfo = await client.serverInfo.getServerInfo();
    let userInfo = await client.myself.getCurrentUser();

    await this.update({
      serverName: serverInfo.serverTitle ?? this.url,
      userName: userInfo.displayName ?? userInfo.name ?? this.entity.email,
    });
  }

  public static async create(
    tx: ServiceTransaction,
    userId: string,
    args: JiraAccountParams,
  ): Promise<Account> {
    let client = new Version3Client({
      host: args.url,
      authentication: {
        basic: {
          email: args.email,
          apiToken: args.apiToken,
        },
      },
      telemetry: false,
    });

    let serverInfo = await client.serverInfo.getServerInfo();
    let userInfo = await client.myself.getCurrentUser();

    let record: JiraAccountEntity = {
      ...args,
      id: await id(),
      userId,
      serverName: serverInfo.serverTitle ?? args.url,
      userName: userInfo.displayName ?? userInfo.name ?? args.email,
    };

    return Account.store(tx).create(record);
  }
}

export type JiraSearchParams = Omit<JiraSearchEntity, "id" | "accountId">;

export type JiraSearchState = Omit<JiraSearchEntity, "accountId"> & {
  url: string;
};

export class Search extends BaseList<JiraSearchEntity, RemoteIssue> {
  public static readonly store = storeBuilder(Search, "jira.Search");

  public async userId(): Promise<string> {
    let account = await this.account();
    return account.userId;
  }

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
    let account = await this.account();
    let url = new URL("/issues/", account.url);
    url.searchParams.set("jql", this.entity.query);

    return url.toString();
  }

  public async state(): Promise<JiraSearchState> {
    return {
      id: this.id,
      name: this.name,
      query: this.entity.query,
      url: await this.url(),
      dueOffset: this.entity.dueOffset,
    };
  }

  public async listItems(): Promise<RemoteIssue[]> {
    let account = await this.account();
    let issues = await Search.getIssues(account, this.entity.query);

    return issues.map(
      (issue: JiraIssue): RemoteIssue => ({
        accountId: account.id,
        issue,
      }),
    );
  }

  public static async getIssues(
    account: Account,
    query: string,
  ): Promise<JiraIssue[]> {
    let results = await account.tx.segment.inSegment("Issue API List", () =>
      account.apiClient.issueSearch.searchForIssuesUsingJqlPost({
        jql: query,
      }),
    );

    return results.issues ?? [];
  }

  public static async create(
    account: Account,
    record: JiraSearchParams,
  ): Promise<Search> {
    let issues = await Search.getIssues(account, record.query);
    let updater = new IssueUpdater(account.tx);
    let url = new URL("/issues/", account.url);
    url.searchParams.set("jql", record.query);

    let id = await updater.addList({
      userId: account.userId,
      name: record.name,
      url: url.toString(),
      due: decodeRelativeDateTime(record.dueOffset),
      remotes: issues.map(
        (issue: JiraIssue): RemoteIssue => ({ accountId: account.id, issue }),
      ),
    });

    return Search.store(account.tx).create({
      ...record,
      accountId: account.id,
      id,
    });
  }
}

interface RemoteIssue {
  accountId: string;
  issue: JiraIssue;
}

export class IssueUpdater extends ItemUpdater<JiraIssueEntity, RemoteIssue> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "jira.Issue", "accountId", "issueKey");
  }

  private accounts: Map<string, Account> = new Map();

  protected override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
    }
  }

  protected async entityForRemote({
    accountId,
    issue,
  }: RemoteIssue): Promise<JiraIssueEntity> {
    return {
      accountId,
      issueKey: issue.key,
    };
  }

  protected paramsForRemote({ accountId, issue }: RemoteIssue): CoreItemParams {
    let account = this.accounts.get(accountId)!;
    let baseUrl = new URL(account.url);

    let fields: IssueFields = {
      accountId: accountId,
      issueKey: issue.key,
      summary: issue.fields.summary,
      url: new URL(`browse/${issue.key}`, baseUrl).toString(),
      icon: issue.fields.issuetype?.iconUrl ?? null,
      status: issue.fields.status.name ?? "Unknown",
      type: issue.fields.issuetype?.name ?? "Unknown",
    };

    return {
      summary: "",
      fields,
      due: null,
      done: issue.fields.resolutiondate
        ? DateTime.fromISO(issue.fields.resolutiondate)
        : null,
    };
  }

  protected async updateEntities(
    entities: JiraIssueEntity[],
  ): Promise<RemoteIssue[]> {
    let results: RemoteIssue[] = [];

    for (let { accountId, issueKey } of entities) {
      let account = this.accounts.get(accountId)!;
      let issue = await account.apiClient.issues.getIssue({
        issueIdOrKey: issueKey,
      });

      results.push({
        accountId,
        issue,
      });
    }

    return results;
  }

  protected getLists(): Promise<RemoteList<RemoteIssue>[]> {
    return Search.store(this.tx).find();
  }

  protected async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteIssue | null> {
    for (let account of this.accounts.values()) {
      if (account.userId != userId) {
        continue;
      }

      let base = new URL("/browse/", account.url);
      if (base.origin != url.origin) {
        continue;
      }

      if (!url.pathname.startsWith(base.pathname)) {
        continue;
      }

      let issueIdOrKey = url.pathname.substring(base.pathname.length);
      try {
        let issue = await account.apiClient.issues.getIssue({
          issueIdOrKey,
        });

        return {
          accountId: account.id,
          issue,
        };
      } catch (e) {
        // Probably an unknown issue.
      }
    }

    return null;
  }
}
