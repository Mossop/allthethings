import { URL, URLSearchParams } from "url";

import { TaskController } from "@allthethings/schema";
import type { PluginContext } from "@allthethings/server";
import { ItemsTable, OwnedItemsTable } from "@allthethings/server";
import type { GraphQLResolver, GraphQLType } from "@allthethings/utils";
import type { Bug as BugzillaAPIBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import type {
  BugzillaAccount,
  BugzillaAccountParams,
  BugzillaSearch,
} from "../schema";
import type { BugFields } from "../types";
import { SearchType } from "../types";
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

export class Account implements GraphQLResolver<BugzillaAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  private api: BugzillaAPI | null = null;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: BugzillaAccountRecord,
  ) {
  }

  public async searches(): Promise<Search[]> {
    return Search.store.list(this.context, { ownerId: this.id });
  }

  public async delete(): Promise<void> {
    let searches = await Search.store.list(this.context, { ownerId: this.id });
    for (let search of searches) {
      await search.delete();
    }

    let bugs = await Bug.store.list(this.context, { ownerId: this.id });
    for (let bug of bugs) {
      await bug.update();
      await this.context.disconnectItem(bug.id, bug.url.toString(), this.icon);
    }

    await Account.store.delete(this.context, { id: this.id });
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

export class Search implements GraphQLType<BugzillaSearch> {
  public static readonly store = new OwnedItemsTable(Account.store, Search, "Search");

  public constructor(
    private readonly account: Account,
    private readonly record: BugzillaSearchRecord,
  ) {
  }

  public get owner(): Account {
    return this.account;
  }

  private get context(): PluginContext {
    return this.account.context;
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
    await this.context.deleteList(this.id);
  }

  public async update(bugs?: BugzillaAPIBug[]): Promise<void> {
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

    await this.context.updateList(this.id, {
      items: instances.map((bug: Bug): string => bug.id),
    });
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
    record: Omit<BugzillaSearchRecord, "id" | "accountId">,
  ): Promise<Search> {
    let bugs = await Search.getBugRecords(account.getAPI(), {
      type: record.type,
      query: record.query,
    });

    let id = await account.context.addList({
      name: record.name,
      url: "",
    });

    let dbRecord = {
      ...record,
      id,
    };

    let search = await Search.store.insert(account, dbRecord);
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

export class Bug {
  public static readonly store = new OwnedItemsTable(Account.store, Bug, "Bug");

  public constructor(
    private readonly account: Account,
    private record: BugzillaBugRecord,
  ) {
  }

  public get owner(): Account {
    return this.account;
  }

  private get context(): PluginContext {
    return this.account.context;
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

  public get url(): URL {
    let baseUrl = new URL(this.account.url);

    return new URL(`show_bug.cgi?id=${this.record.id}`, baseUrl);
  }

  public async update(record?: BugzillaAPIBug): Promise<void> {
    if (!record) {
      let bugs = await this.account.getAPI().getBugs([this.bugId]);
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    await Bug.store.update(this, recordFromBug(record));
    await this.context.setItemTaskDone(this.id, await this.account.doneForStatus(record));
    await this.context.setItemSummary(this.id, record.summary);
  }

  public async fields(): Promise<BugFields> {
    return {
      accountId: this.account.id,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: this.url.toString(),
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
    };

    return Bug.store.insert(account, record);
  }
}
