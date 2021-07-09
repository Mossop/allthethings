import { URL, URLSearchParams } from "url";

import type { Bug as BugzillaAPIBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import type { BugFields } from "#plugins/bugzilla/schema";
import { SearchType } from "#plugins/bugzilla/schema";
import { TaskController } from "#schema";
import type {
  BugzillaAccount,
  BugzillaAccountParams,
} from "#schema";
import type { AuthedPluginContext, PluginContext } from "#server-utils";
import {
  BaseItem,
  BaseAccount,
  BaseList,
  ItemsTable,
  OwnedItemsTable,
  classBuilder,
} from "#server-utils";

import type { BugzillaAccountResolvers, BugzillaSearchResolvers } from "../schema";
import type { BugzillaAccountRecord, BugzillaBugRecord, BugzillaSearchRecord } from "./types";

function isDone(status: string): boolean {
  switch (status) {
    case "RESOLVED":
    case "VERIFIED":
    case "CLOSED":
      return true;
    default:
      return false;
  }
}

export class Account extends BaseAccount implements BugzillaAccountResolvers {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  private api: BugzillaAPI | null = null;

  public constructor(
    context: PluginContext,
    private record: BugzillaAccountRecord,
  ) {
    super(context);
  }

  public async onRecordUpdate(record: BugzillaAccountRecord): Promise<void> {
    this.record = record;
  }

  public async items(): Promise<Bug[]> {
    return Bug.store.list(this.context, { ownerId: this.id });
  }

  public lists(): Promise<Search[]> {
    return this.searches();
  }

  public async searches(): Promise<Search[]> {
    return Search.store.list(this.context, { ownerId: this.id });
  }

  public normalizeQuery(query: string): Pick<BugzillaSearchRecord, "query" | "type"> {
    if (!query.startsWith("https://") && !query.startsWith("http://")) {
      return {
        query,
        type: SearchType.Quicksearch,
      };
    }

    let queryUrl = new URL(query);
    let ourUrl = new URL(this.url);

    if (queryUrl.origin != ourUrl.origin) {
      throw new Error("Query is for a different bugzilla installation.");
    }

    if (!queryUrl.pathname.endsWith("/buglist.cgi")) {
      throw new Error("Query doesn't appear to be correct.");
    }

    let params = queryUrl.searchParams;

    params.delete("list_id");
    params.delete("known_name");
    params.delete("query_based_on");

    let entries = [...params.entries()];
    if (entries.length == 1 && entries[0][0] == "quicksearch") {
      return {
        query: entries[0][1],
        type: SearchType.Quicksearch,
      };
    }

    return {
      query: params.toString(),
      type: SearchType.Advanced,
    };
  }

  public static buildAPI(
    record: Pick<BugzillaAccountRecord, "url" | "username" | "password">,
  ): BugzillaAPI {
    if (!record.username) {
      return new BugzillaAPI(record.url);
    } else if (!record.password) {
      return new BugzillaAPI(record.url, record.username);
    } else {
      return new BugzillaAPI(record.url, record.username, record.password);
    }
  }

  public getAPI(): BugzillaAPI {
    if (!this.api) {
      this.api = Account.buildAPI(this.record);
    }

    return this.api;
  }

  public get id(): string {
    return this.record.id;
  }

  public get name(): string {
    return this.record.name;
  }

  public get icon(): string | null {
    return this.record.icon;
  }

  public get url(): string {
    return this.record.url;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get username(): string | null {
    return this.record.username;
  }

  public async getBugFromURL(url: URL, isTask: boolean): Promise<Bug | null> {
    let baseUrl = new URL("show_bug.cgi", this.url);
    if (baseUrl.origin != url.origin || baseUrl.pathname != url.pathname) {
      return null;
    }

    let id = url.searchParams.get("id");
    if (!id) {
      return null;
    }

    let existing = await Bug.store.first(this.context, { bugId: parseInt(id) });
    if (existing) {
      return existing;
    }

    let api = this.getAPI();
    try {
      let bugs = await api.getBugs([id]);
      if (bugs.length) {
        let controller: TaskController | null = null;
        if (isTask) {
          controller = TaskController.Plugin;
          if (isDone(bugs[0].status)) {
            // It doesn't make much sense to be creating a complete task so assume this is manual.
            controller = TaskController.Manual;
          }
        }

        return await Bug.create(this, bugs[0], controller);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  public async doneForStatus(bug: BugzillaAPIBug): Promise<DateTime | null> {
    if (!isDone(bug.status)) {
      return null;
    }

    // If it is done we need to find the last time the resolution was changed.
    let api = this.getAPI();
    let history = await api.bugHistory(bug.id);
    // Work newest to oldest.
    history.reverse();

    // Find the first item where the status changed from a not done state.
    let change = history.find((history: History): boolean => {
      for (let change of history.changes) {
        if (change.field_name != "status") {
          continue;
        }

        if (!isDone(change.removed)) {
          return true;
        }
      }

      return false;
    });

    if (change) {
      return change.when;
    }

    return null;
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
  }

  public static async create(
    context: PluginContext,
    userId: string,
    args: BugzillaAccountParams & Pick<BugzillaAccount, "icon">,
  ): Promise<Account> {
    let record: BugzillaAccountRecord = {
      ...args,
      id: await context.id(),
      userId,
      icon: args.icon,
    };

    return Account.store.insert(context, record);
  }
}

export class Search extends BaseList<BugzillaAPIBug[]> implements BugzillaSearchResolvers {
  public static readonly store = new OwnedItemsTable(Account.store, classBuilder(Search), "Search");

  public constructor(
    private readonly account: Account,
    private record: BugzillaSearchRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: BugzillaSearchRecord): Promise<void> {
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

  public get type(): SearchType {
    return this.record.type;
  }

  public get query(): string {
    return this.record.query;
  }

  public get url(): string {
    let search = this.query;
    if (this.type == SearchType.Quicksearch) {
      let params = new URLSearchParams();
      params.set("quicksearch", this.query);
      search = params.toString();
    }

    let url = new URL("buglist.cgi", this.account.url);
    url.search = search;

    return url.toString();
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Search.store.delete(this.context, this.id);
  }

  public async listItems(bugs?: BugzillaAPIBug[]): Promise<Bug[]> {
    if (!bugs) {
      bugs = await this.getBugRecords();
    }

    let instances: Bug[] = [];

    for (let bug of bugs) {
      let instance = await Bug.store.first(this.context, { bugId: bug.id });

      if (!instance) {
        instance = await Bug.create(this.account, bug, TaskController.PluginList);
      } else {
        await instance.update(bug);
      }

      instances.push(instance);
    }

    return instances;
  }

  public async getBugRecords(): Promise<BugzillaAPIBug[]> {
    return Search.getBugRecords(this.account.getAPI(), this.record);
  }

  public static async getBugRecords(
    api: BugzillaAPI,
    record: Pick<BugzillaSearchRecord, "type" | "query">,
  ): Promise<BugzillaAPIBug[]> {
    if (record.type == SearchType.Quicksearch) {
      return api.quicksearch(record.query);
    } else {
      return api.advancedSearch(record.query);
    }
  }

  public static async create(
    account: Account,
    record: Omit<BugzillaSearchRecord, "id">,
  ): Promise<Search> {
    let bugs = await Search.getBugRecords(account.getAPI(), {
      type: record.type,
      query: record.query,
    });

    let id = await account.context.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      id,
    };

    let search = await Search.store.insert(account.context, dbRecord);
    await search.update(bugs);

    return search;
  }
}

type FixedFields = "ownerId" | "id";

function recordFromBug(bug: BugzillaAPIBug): Omit<BugzillaBugRecord, FixedFields> {
  return {
    bugId: bug.id,
    summary: bug.summary,
    status: bug.status,
    resolution: bug.resolution || null,
  };
}

export class Bug extends BaseItem {
  public static readonly store = new OwnedItemsTable(Account.store, classBuilder(Bug), "Bug");

  public constructor(
    private readonly account: Account,
    private record: BugzillaBugRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: BugzillaBugRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<Bug | null> {
    for (let account of await Account.store.list(context, { userId: context.userId })) {
      let bug = await account.getBugFromURL(url, isTask);
      if (bug) {
        return bug;
      }
    }

    return null;
  }

  public async getBug(): Promise<BugzillaAPIBug> {
    let account = this.account;
    let api = account.getAPI();
    let bugs = await api.getBugs([this.id]);

    if (!bugs.length) {
      throw new Error("Bug is missing.");
    }

    return bugs[0];
  }

  public get id(): string {
    return this.record.id;
  }

  public get bugId(): number {
    return this.record.bugId;
  }

  public get url(): string {
    let baseUrl = new URL(this.account.url);

    return new URL(`show_bug.cgi?id=${this.record.bugId}`, baseUrl).toString();
  }

  public get icon(): string | null {
    return this.account.icon;
  }

  public async update(record?: BugzillaAPIBug): Promise<void> {
    if (!record) {
      let bugs = await this.account.getAPI().getBugs([this.bugId]);
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    await Bug.store.update(this.context, {
      ...recordFromBug(record),
      id: this.id,
      ownerId: this.account.id,
    });
    await this.context.setItemTaskDone(this.id, await this.account.doneForStatus(record));
    await this.context.setItemSummary(this.id, record.summary);
  }

  public async fields(): Promise<BugFields> {
    return {
      accountId: this.account.id,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: this.url,
      icon: this.account.icon,
      status: this.record.status,
      resolution: this.record.resolution,
    };
  }

  public static async create(
    account: Account,
    bug: BugzillaAPIBug,
    controller: TaskController | null,
  ): Promise<Bug> {
    let id = await account.context.createItem(account.userId, {
      summary: bug.summary,
      archived: null,
      snoozed: null,
      done: await account.doneForStatus(bug),
      controller,
    });

    let record = {
      id,
      ...recordFromBug(bug),
      ownerId: account.id,
    };

    return Bug.store.insert(account.context, record);
  }
}
