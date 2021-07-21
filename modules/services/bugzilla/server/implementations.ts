import { URL, URLSearchParams } from "url";

import type { Bug as BugzillaAPIBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import { TaskController } from "#schema";
import type {
  BugzillaAccount,
  BugzillaAccountParams,
} from "#schema";
import type { ItemStore, Listable, ResolverImpl, ServiceItem } from "#server/utils";
import {
  BaseItem,
  BaseAccount,
  BaseList,
} from "#server/utils";
import { SearchType } from "#services/bugzilla/schema";
import type { BugFields } from "#services/bugzilla/schema";
import { assert } from "#utils";

import type { BugzillaAccountResolvers, BugzillaSearchResolvers } from "./schema";
import type { BugzillaTransaction } from "./stores";
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

export class Account extends BaseAccount<BugzillaTransaction>
  implements ResolverImpl<BugzillaAccountResolvers> {
  private api: BugzillaAPI | null = null;

  public constructor(
    tx: BugzillaTransaction,
    private record: BugzillaAccountRecord,
  ) {
    super(tx);
  }

  public updateRecord(record: BugzillaAccountRecord): void {
    this.record = record;
  }

  public async items(): Promise<Bug[]> {
    return this.tx.stores.bugs.list({ accountId: this.id });
  }

  public override lists(): Promise<Search[]> {
    return this.searches();
  }

  public async searches(): Promise<Search[]> {
    return this.tx.stores.searches.list({ accountId: this.id });
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

    let existing = await this.tx.stores.bugs.first({ bugId: parseInt(id) });
    if (existing) {
      return existing;
    }

    let api = this.getAPI();
    let bugs: BugzillaAPIBug[];
    try {
      bugs = await api.getBugs([id]);
    } catch (e) {
      return null;
    }

    if (bugs.length) {
      let controller: TaskController | null = null;
      if (isTask) {
        controller = TaskController.Service;
        if (isDone(bugs[0].status)) {
          // It doesn't make much sense to be creating a complete task so assume this is manual.
          controller = TaskController.Manual;
        }
      }

      return await Bug.create(this, bugs[0], controller);
    }

    return null;
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

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.accounts.deleteOne(this.id);
  }

  public static async create(
    tx: BugzillaTransaction,
    userId: string,
    args: BugzillaAccountParams & Pick<BugzillaAccount, "icon">,
  ): Promise<Account> {
    let record: Omit<BugzillaAccountRecord, "id"> = {
      ...args,
      username: args.username ?? null,
      password: args.password ?? null,
      userId,
      icon: args.icon ?? null,
    };

    return tx.stores.accounts.insertOne(record);
  }
}

export class Search extends BaseList<BugzillaAPIBug[], BugzillaTransaction>
  implements ResolverImpl<BugzillaSearchResolvers> {
  public static getStore(tx: BugzillaTransaction): Listable<Search> {
    return tx.stores.searches;
  }

  public constructor(
    tx: BugzillaTransaction,
    private record: BugzillaSearchRecord,
  ) {
    super(tx);
  }

  public updateRecord(record: BugzillaSearchRecord): void {
    this.record = record;
  }

  public owner(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
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

  public override async url(): Promise<string> {
    let search = this.query;
    if (this.type == SearchType.Quicksearch) {
      let params = new URLSearchParams();
      params.set("quicksearch", this.query);
      search = params.toString();
    }

    let account = await this.owner();
    let url = new URL("buglist.cgi", account.url);
    url.search = search;

    return url.toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.searches.deleteOne(this.id);
  }

  public async listItems(bugs?: BugzillaAPIBug[]): Promise<Bug[]> {
    if (!bugs) {
      bugs = await this.getBugRecords();
    }

    let instances: Bug[] = [];

    for (let bug of bugs) {
      let instance = await this.tx.stores.bugs.first({ bugId: bug.id });

      if (!instance) {
        let account = await this.owner();
        instance = await Bug.create(account, bug, TaskController.ServiceList);
      } else {
        await instance.update(bug);
      }

      instances.push(instance);
    }

    return instances;
  }

  public async getBugRecords(): Promise<BugzillaAPIBug[]> {
    let account = await this.owner();
    return Search.getBugRecords(account.getAPI(), this.record);
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

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let search = await account.tx.stores.searches.insertOne(record, id);
    await search.update(bugs);

    return search;
  }
}

type FixedFields = "accountId" | "id";

function recordFromBug(bug: BugzillaAPIBug): Omit<BugzillaBugRecord, FixedFields> {
  return {
    bugId: bug.id,
    summary: bug.summary,
    status: bug.status,
    resolution: bug.resolution || null,
  };
}

export class Bug extends BaseItem<BugzillaTransaction> implements ServiceItem<BugFields> {
  public static getStore(tx: BugzillaTransaction): ItemStore<Bug> {
    return tx.stores.bugs;
  }

  public constructor(
    tx: BugzillaTransaction,
    private record: BugzillaBugRecord,
  ) {
    super(tx);
  }

  public updateRecord(record: BugzillaBugRecord): void {
    this.record = record;
  }

  public owner(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public static async createItemFromURL(
    tx: BugzillaTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Bug | null> {
    for (let account of await tx.stores.accounts.list({ userId })) {
      let bug = await account.getBugFromURL(url, isTask);
      if (bug) {
        return bug;
      }
    }

    return null;
  }

  public async getBug(): Promise<BugzillaAPIBug> {
    let account = await this.owner();
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

  public override async url(): Promise<string> {
    let account = await this.owner();
    let baseUrl = new URL(account.url);

    return new URL(`show_bug.cgi?id=${this.record.bugId}`, baseUrl).toString();
  }

  public override async icon(): Promise<string | null> {
    let account = await this.owner();
    return account.icon;
  }

  public override async update(record?: BugzillaAPIBug): Promise<void> {
    let account = await this.owner();

    if (!record) {
      let bugs = await account.getAPI().getBugs([this.bugId]);
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    await this.tx.stores.bugs.updateOne(this.id, {
      ...recordFromBug(record),
      accountId: account.id,
    });
    await this.tx.setItemTaskDone(this.id, await account.doneForStatus(record));
    await this.tx.setItemSummary(this.id, record.summary);
  }

  public async fields(): Promise<BugFields> {
    let account = await this.owner();

    return {
      accountId: account.id,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: await this.url(),
      icon: account.icon,
      status: this.record.status,
      resolution: this.record.resolution,
    };
  }

  public static async create(
    account: Account,
    bug: BugzillaAPIBug,
    controller: TaskController | null,
  ): Promise<Bug> {
    let id = await account.tx.createItem(account.userId, {
      summary: bug.summary,
      archived: null,
      snoozed: null,
      done: await account.doneForStatus(bug),
      controller,
    });

    let record = {
      ...recordFromBug(bug),
      accountId: account.id,
    };

    return account.tx.stores.bugs.insertOne(record, id);
  }
}
