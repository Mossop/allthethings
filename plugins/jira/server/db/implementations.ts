import { URL } from "url";

import type { Version3Models } from "jira.js";
import { Version3Client } from "jira.js";
import { DateTime } from "luxon";

import type { IssueFields } from "#plugins/jira/schema";
import { TaskController } from "#schema";
import type {
  JiraAccountParams,
} from "#schema";
import type { AuthedPluginContext, PluginContext } from "#server-utils";
import {
  BaseList,
  BaseItem,
  classBuilder,
  BaseAccount,
  ItemsTable,
  OwnedItemsTable,
} from "#server-utils";

import type { JiraAccountResolvers, JiraSearchResolvers } from "../schema";
import type { JiraAccountRecord, JiraIssueRecord, JiraSearchRecord } from "./types";

type JiraIssue = Version3Models.IssueBean;

export class Account extends BaseAccount implements JiraAccountResolvers {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  public constructor(
    context: PluginContext,
    private record: JiraAccountRecord,
  ) {
    super(context);
  }

  public async onRecordUpdate(record: JiraAccountRecord): Promise<void> {
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
    return Search.store.list(this.context, {
      ownerId: this.id,
    });
  }

  public async items(): Promise<[]> {
    return [];
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
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

    await Account.store.update(this.context, {
      id: this.id,
      serverName: serverInfo.serverTitle ?? this.url,
      userName: userInfo.displayName ?? userInfo.name ?? this.email,
    });
  }

  public static async create(
    context: PluginContext,
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

    let record: JiraAccountRecord = {
      ...args,
      userId,
      serverName: serverInfo.serverTitle ?? args.url,
      userName: userInfo.displayName ?? userInfo.name ?? args.email,
      id: await context.id(),
    };

    return Account.store.insert(context, record);
  }
}

export class Search extends BaseList<JiraIssue[]> implements JiraSearchResolvers {
  public static readonly store = new OwnedItemsTable(Account.store, classBuilder(Search), "Search");

  public constructor(
    private readonly account: Account,
    private record: JiraSearchRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: JiraSearchRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
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

  public override get url(): string {
    let url = new URL("/issues/", this.account.url);
    url.searchParams.set("jql", this.query);

    return url.toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await Search.store.delete(this.context, this.id);
  }

  public async listItems(issues?: JiraIssue[]): Promise<Issue[]> {
    if (!issues) {
      issues = await Search.getIssues(this.account, this.query);
    }

    let instances: Issue[] = [];

    for (let issue of issues) {
      if (!issue.key) {
        continue;
      }

      let instance = await Issue.store.first(this.context, { issueKey: issue.key });

      if (!instance) {
        instance = await Issue.create(this.account, issue, TaskController.PluginList);
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

    let id = await account.context.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      id,
    };

    let search = await Search.store.insert(account.context, dbRecord);
    await search.update(issues);

    return search;
  }
}

function recordFromIssue(issue: JiraIssue): Omit<JiraIssueRecord, "id" | "ownerId"> {
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

export class Issue extends BaseItem {
  public static readonly store = new OwnedItemsTable(Account.store, classBuilder(Issue), "Issue");

  public constructor(
    private readonly account: Account,
    private record: JiraIssueRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: JiraIssueRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<Issue | null> {
    for (let account of await Account.store.list(context, { userId: context.userId })) {
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

        let controller = isTask ? TaskController.Plugin : null;
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

  public override get url(): string {
    let baseUrl = new URL(this.account.url);

    return new URL(`browse/${this.issueKey}`, baseUrl).toString();
  }

  public override get icon(): string | null {
    return this.record.icon;
  }

  public override async update(issue?: JiraIssue): Promise<void> {
    if (!issue) {
      issue = await this.account.apiClient.issues.getIssue({
        issueIdOrKey: this.issueKey,
      });

      if (!issue) {
        throw new Error("Unknown issue.");
      }
    }

    await Issue.store.update(this.context, {
      ...recordFromIssue(issue),
      id: this.id,
      ownerId: this.account.id,
    });

    let done = issue.fields.resolutiondate ? DateTime.fromISO(issue.fields.resolutiondate) : null;
    await this.context.setItemTaskDone(this.id, done);
    await this.context.setItemSummary(this.id, issue.fields.summary);
  }

  public async fields(): Promise<IssueFields> {
    return {
      accountId: this.account.id,
      issueKey: this.record.issueKey,
      summary: this.record.summary,
      url: this.url,
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
    let id = await account.context.createItem(account.userId, {
      summary: issue.fields.summary,
      archived: null,
      snoozed: null,
      done: issue.fields.resolutiondate ? DateTime.fromISO(issue.fields.resolutiondate) : null,
      controller,
    });

    let record = {
      ...recordFromIssue(issue),
      id,
      ownerId: account.id,
    };

    return Issue.store.insert(account.context, record);
  }
}
