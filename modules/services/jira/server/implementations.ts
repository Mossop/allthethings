import { URL } from "url";

import type { Version3Models } from "jira.js";
import { Version3Client } from "jira.js";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type { JiraAccountParams } from "#schema";
import type {
  ResolverImpl,
  ServiceItem,
  ServiceTransaction,
} from "#server/utils";
import {
  id,
  storeBuilder,
  BaseList,
  BaseItem,
  BaseAccount,
} from "#server/utils";
import type { IssueFields } from "#services/jira/schema";
import type { DateTimeOffset } from "#utils";
import { offsetFromJson } from "#utils";

import type {
  JiraAccountEntity,
  JiraIssueEntity,
  JiraSearchEntity,
} from "./entities";
import type { JiraAccountResolvers, JiraSearchResolvers } from "./schema";

type JiraIssue = Version3Models.IssueBean;

export class Account
  extends BaseAccount<JiraAccountEntity>
  implements ResolverImpl<JiraAccountResolvers>
{
  public static readonly store = storeBuilder(Account, "jira.Account");

  public get userId(): string {
    return this.entity.userId;
  }

  public get serverName(): string {
    return this.entity.serverName;
  }

  public get userName(): string {
    return this.entity.userName;
  }

  public get url(): string {
    return this.entity.url;
  }

  public get email(): string {
    return this.entity.email;
  }

  public get apiToken(): string {
    return this.entity.apiToken;
  }

  public get searches(): Promise<Search[]> {
    return Search.store(this.tx).find({
      accountId: this.id,
    });
  }

  public async items(): Promise<[]> {
    return [];
  }

  public get apiClient(): Version3Client {
    return new Version3Client({
      host: this.url,
      authentication: {
        basic: {
          email: this.email,
          apiToken: this.apiToken,
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
      userName: userInfo.displayName ?? userInfo.name ?? this.email,
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

export class Search
  extends BaseList<JiraSearchEntity, JiraIssue[]>
  implements ResolverImpl<JiraSearchResolvers>
{
  public static readonly store = storeBuilder(Search, "jira.Search");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get name(): string {
    return this.entity.name;
  }

  public get query(): string {
    return this.entity.query;
  }

  public override get dueOffset(): DateTimeOffset | null {
    return this.entity.dueOffset
      ? offsetFromJson(JSON.parse(this.entity.dueOffset))
      : null;
  }

  public override async url(): Promise<string> {
    let account = await this.account();
    let url = new URL("/issues/", account.url);
    url.searchParams.set("jql", this.query);

    return url.toString();
  }

  public async listItems(issues?: JiraIssue[]): Promise<Issue[]> {
    let account = await this.account();

    if (!issues) {
      issues = await Search.getIssues(account, this.query);
    }

    let instances: Issue[] = [];

    for (let issue of issues) {
      if (!issue.key) {
        continue;
      }

      let instance = await Issue.store(this.tx).findOne({
        issueKey: issue.key,
      });

      if (!instance) {
        instance = await Issue.create(
          account,
          issue,
          TaskController.ServiceList,
        );
      } else {
        await instance.updateItem(issue);
      }

      instances.push(instance);
    }

    return instances;
  }

  public static async getIssues(
    account: Account,
    query: string,
  ): Promise<JiraIssue[]> {
    let results =
      await account.apiClient.issueSearch.searchForIssuesUsingJqlPost({
        jql: query,
      });

    return results.issues ?? [];
  }

  public static async create(
    account: Account,
    record: Omit<JiraSearchEntity, "id">,
  ): Promise<Search> {
    let issues = await Search.getIssues(account, record.query);

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let search = await Search.store(account.tx).create({
      id,
      ...record,
    });

    await search.updateList(issues);

    return search;
  }
}

function recordFromIssue(
  issue: JiraIssue,
): Omit<JiraIssueEntity, "id" | "accountId"> {
  if (!issue.key) {
    throw new Error("Invalid issue: no key.");
  }

  return {
    issueKey: issue.key,
    icon: issue.fields.issuetype?.iconUrl ?? null,
    summary: issue.fields.summary,
    status: issue.fields.status.name ?? "Unknown",
    type: issue.fields.issuetype?.name ?? "Unknown",
  };
}

export class Issue
  extends BaseItem<JiraIssueEntity>
  implements ServiceItem<IssueFields>
{
  public static readonly store = storeBuilder(Issue, "jira.Issue");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Issue | null> {
    for (let account of await Account.store(tx).find({ userId })) {
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

        let controller = isTask ? TaskController.Service : null;
        if (controller && issue.fields.resolutiondate) {
          controller = TaskController.Manual;
        }

        return Issue.create(account, issue, controller);
      } catch (e) {
        // Probably an unknown issue.
      }
    }

    return null;
  }

  public get issueKey(): string {
    return this.entity.issueKey;
  }

  public override async url(): Promise<string> {
    let account = await this.account();
    let baseUrl = new URL(account.url);

    return new URL(`browse/${this.issueKey}`, baseUrl).toString();
  }

  public override async icon(): Promise<string | null> {
    return this.entity.icon;
  }

  public override async updateItem(issue?: JiraIssue): Promise<void> {
    let account = await this.account();

    if (!issue) {
      issue = await account.apiClient.issues.getIssue({
        issueIdOrKey: this.issueKey,
      });

      if (!issue) {
        throw new Error("Unknown issue.");
      }
    }

    await this.update({
      ...recordFromIssue(issue),
      accountId: account.id,
    });

    let done = issue.fields.resolutiondate
      ? DateTime.fromISO(issue.fields.resolutiondate)
      : null;
    await this.tx.setItemTaskDone(this.id, done);
    await this.tx.setItemSummary(this.id, issue.fields.summary);
  }

  public async fields(): Promise<IssueFields> {
    let account = await this.account();
    return {
      accountId: account.id,
      issueKey: this.entity.issueKey,
      summary: this.entity.summary,
      url: await this.url(),
      icon: this.entity.icon,
      status: this.entity.status,
      type: this.entity.type,
    };
  }

  public static async create(
    account: Account,
    issue: JiraIssue,
    controller: TaskController | null,
  ): Promise<Issue> {
    let id = await account.tx.createItem(account.userId, {
      summary: issue.fields.summary,
      archived: null,
      snoozed: null,
      done: issue.fields.resolutiondate
        ? DateTime.fromISO(issue.fields.resolutiondate)
        : null,
      controller,
    });

    let record = {
      ...recordFromIssue(issue),
      id,
      accountId: account.id,
    };

    return Issue.store(account.tx).create(record);
  }
}
