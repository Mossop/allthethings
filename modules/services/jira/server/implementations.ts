import { URL } from "url";

import type { Version3Models } from "jira.js";
import { Version3Client } from "jira.js";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type {
  JiraAccountParams,
} from "#schema";
import type { ItemStore, Listable, ResolverImpl, ServiceItem } from "#server/utils";
import {
  BaseList,
  BaseItem,
  BaseAccount,
} from "#server/utils";
import type { IssueFields } from "#services/jira/schema";
import { assert } from "#utils";

import type { JiraAccountResolvers, JiraSearchResolvers } from "./schema";
import type { JiraTransaction } from "./stores";
import type { JiraAccountRecord, JiraIssueRecord, JiraSearchRecord } from "./types";

type JiraIssue = Version3Models.IssueBean;

export class Account extends BaseAccount<JiraTransaction>
  implements ResolverImpl<JiraAccountResolvers> {
  public constructor(
    tx: JiraTransaction,
    private record: JiraAccountRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: JiraAccountRecord): Promise<void> {
    this.record = record;
  }

  public get id(): string {
    return this.record.id;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get serverName(): string {
    return this.record.serverName;
  }

  public get userName(): string {
    return this.record.userName;
  }

  public get url(): string {
    return this.record.url;
  }

  public get email(): string {
    return this.record.email;
  }

  public get apiToken(): string {
    return this.record.apiToken;
  }

  public get searches(): Promise<Search[]> {
    return this.tx.stores.searches.list({
      accountId: this.id,
    });
  }

  public async items(): Promise<[]> {
    return [];
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.accounts.deleteOne(this.id);
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

  public async update(): Promise<void> {
    let client = this.apiClient;

    let serverInfo = await client.serverInfo.getServerInfo();
    let userInfo = await client.myself.getCurrentUser();

    await this.tx.stores.accounts.updateOne(this.id, {
      serverName: serverInfo.serverTitle ?? this.url,
      userName: userInfo.displayName ?? userInfo.name ?? this.email,
    });
  }

  public static async create(
    tx: JiraTransaction,
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

    let record: Omit<JiraAccountRecord, "id"> = {
      ...args,
      userId,
      serverName: serverInfo.serverTitle ?? args.url,
      userName: userInfo.displayName ?? userInfo.name ?? args.email,
    };

    return tx.stores.accounts.insertOne(record);
  }
}

export class Search extends BaseList<JiraIssue[], JiraTransaction>
  implements ResolverImpl<JiraSearchResolvers> {
  public static getStore(tx: JiraTransaction): Listable<Search> {
    return tx.stores.searches;
  }

  public constructor(
    tx: JiraTransaction,
    private record: JiraSearchRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: JiraSearchRecord): Promise<void> {
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
    let account = await this.account();
    let url = new URL("/issues/", account.url);
    url.searchParams.set("jql", this.query);

    return url.toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.searches.deleteOne(this.id);
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

      let instance = await this.tx.stores.issues.first({ issueKey: issue.key });

      if (!instance) {
        instance = await Issue.create(account, issue, TaskController.ServiceList);
      } else {
        await instance.update(issue);
      }

      instances.push(instance);
    }

    return instances;
  }

  public static async getIssues(
    account: Account,
    query: string,
  ): Promise<JiraIssue[]> {
    let results = await account.apiClient.issueSearch.searchForIssuesUsingJqlPost({
      jql: query,
    });

    return results.issues ?? [];
  }

  public static async create(
    account: Account,
    record: Omit<JiraSearchRecord, "id">,
  ): Promise<Search> {
    let issues = await Search.getIssues(account, record.query);

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let search = await account.tx.stores.searches.insertOne(record, id);
    await search.update(issues);

    return search;
  }
}

function recordFromIssue(issue: JiraIssue): Omit<JiraIssueRecord, "id" | "accountId"> {
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

export class Issue extends BaseItem<JiraTransaction> implements ServiceItem<IssueFields> {
  public static getStore(tx: JiraTransaction): ItemStore<Issue> {
    return tx.stores.issues;
  }

  public constructor(
    tx: JiraTransaction,
    private record: JiraIssueRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: JiraIssueRecord): Promise<void> {
    this.record = record;
  }

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public static async createItemFromURL(
    tx: JiraTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Issue | null> {
    for (let account of await tx.stores.accounts.list({ userId })) {
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

  public get id(): string {
    return this.record.id;
  }

  public get issueKey(): string {
    return this.record.issueKey;
  }

  public override async url(): Promise<string> {
    let account = await this.account();
    let baseUrl = new URL(account.url);

    return new URL(`browse/${this.issueKey}`, baseUrl).toString();
  }

  public override async icon(): Promise<string | null> {
    return this.record.icon;
  }

  public override async update(issue?: JiraIssue): Promise<void> {
    let account = await this.account();

    if (!issue) {
      issue = await account.apiClient.issues.getIssue({
        issueIdOrKey: this.issueKey,
      });

      if (!issue) {
        throw new Error("Unknown issue.");
      }
    }

    await this.tx.stores.issues.updateOne(this.id, {
      ...recordFromIssue(issue),
      accountId: account.id,
    });

    let done = issue.fields.resolutiondate ? DateTime.fromISO(issue.fields.resolutiondate) : null;
    await this.tx.setItemTaskDone(this.id, done);
    await this.tx.setItemSummary(this.id, issue.fields.summary);
  }

  public async fields(): Promise<IssueFields> {
    let account = await this.account();
    return {
      accountId: account.id,
      issueKey: this.record.issueKey,
      summary: this.record.summary,
      url: await this.url(),
      icon: this.record.icon,
      status: this.record.status,
      type: this.record.type,
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
      done: issue.fields.resolutiondate ? DateTime.fromISO(issue.fields.resolutiondate) : null,
      controller,
    });

    let record = {
      ...recordFromIssue(issue),
      accountId: account.id,
    };

    return account.tx.stores.issues.insertOne(record, id);
  }
}
