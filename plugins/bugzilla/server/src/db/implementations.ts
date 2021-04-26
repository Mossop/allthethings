import { URL, URLSearchParams } from "url";

import type { PluginContext, BasePluginItem, PluginTaskInfo } from "@allthethings/server";
import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import type { Bug as BugzillaBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { Knex } from "knex";
import { DateTime } from "luxon";

import type {
  BugzillaAccount,
  BugzillaAccountParams,
  BugzillaSearch,
  BugzillaSearchParams,
} from "../schema";
import type { BugRecord, SearchPresence } from "../types";
import { TaskType, SearchType } from "../types";

type Impl<T> = Omit<T, "__typename">;

type Resolver<T> = {
  readonly [K in keyof Impl<T>]: MaybeCallable<Awaitable<T[K]>>;
};

export type BugzillaAccountRecord = Omit<Impl<BugzillaAccount>, "searches"> & {
  user: string;
  password: string | null;
};

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

interface IdItem<I> {
  id: I;
}
type Getter<I, T extends IdItem<I>> = (id: I) => Awaitable<T | null>;
type Builder<T> = () => Awaitable<T>;

class ItemCache<I, T extends IdItem<I>> {
  private cache = new Map<I, T>();

  public constructor(private readonly getter: Getter<I, T>) {
  }

  public async getItem(id: I): Promise<T | null> {
    let item = this.cache.get(id);
    if (item) {
      return item;
    }

    let newItem = await this.getter(id);
    if (newItem) {
      this.cache.set(id, newItem);
    }
    return newItem;
  }

  public getCachedItem(id: I): T | null {
    return this.cache.get(id) ?? null;
  }

  public addItem(item: T): void {
    this.cache.set(item.id, item);
  }

  public async upsertItem(id: I, builder: Builder<T>): Promise<T> {
    let item = this.cache.get(id);
    if (item) {
      return item;
    }

    let newItem = await builder();
    this.cache.set(id, newItem);
    return newItem;
  }

  public deleteItem(id: I): void {
    this.cache.delete(id);
  }
}

export class Account implements Resolver<BugzillaAccount> {
  private api: BugzillaAPI | null = null;
  public readonly bugCache: ItemCache<number, Bug>;
  public readonly searchCache: ItemCache<string, Search>;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: BugzillaAccountRecord,
  ) {
    this.bugCache = new ItemCache(async (id: number): Promise<Bug | null> => {
      let records = await this.context.table<BugzillaBugRecord>("Bug").where({
        accountId: this.id,
        bugId: id,
      }).select("*");

      if (records.length == 1) {
        return new Bug(this, records[0]);
      }

      return null;
    });

    this.searchCache = new ItemCache(async (id: string): Promise<Search | null> => {
      let records = await this.context.table<BugzillaSearchRecord>("Search").where({
        accountId: this.id,
        id,
      }).select("*");

      if (records.length == 1) {
        return new Search(this, records[0]);
      }

      return null;
    });
  }

  public normalizeQuery(query: string): URLSearchParams {
    let params: URLSearchParams;

    if (query.startsWith("https:") || query.startsWith("http:")) {
      let queryUrl = new URL(query);
      let ourUrl = new URL(this.url);

      if (queryUrl.origin != ourUrl.origin) {
        throw new Error("Query is for a different bugzilla installation.");
      }

      if (!queryUrl.pathname.endsWith("/buglist.cgi")) {
        throw new Error("Query doesn't appear to be correct.");
      }

      params = queryUrl.searchParams;
    } else {
      params = new URLSearchParams(query);
    }

    params.delete("list_id");
    params.delete("known_name");
    params.delete("query_based_on");
    return params;
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

  public get user(): string {
    return this.record.user;
  }

  public get username(): string | null {
    return this.record.username;
  }

  public async searches(): Promise<BugzillaSearch[]> {
    return Search.list(this);
  }

  public async getBugs(): Promise<Bug[]> {
    let records = await this.context
      .table<BugzillaBugRecord>("Bug")
      .where("accountId", this.id)
      .select("*");

    return Promise.all(records.map((record: BugzillaBugRecord): Promise<Bug> => {
      return this.bugCache.upsertItem(record.bugId, () => new Bug(this, record));
    }));
  }

  public async getBugFromURL(url: URL, isTask: boolean): Promise<Bug | null> {
    let baseUrl = new URL(this.url);
    if (baseUrl.origin != url.origin || url.pathname != "/show_bug.cgi") {
      return null;
    }

    let id = url.searchParams.get("id");
    if (!id) {
      return null;
    }

    let api = this.getAPI();
    try {
      let bugs = await api.getBugs([id]);
      if (bugs.length) {
        let taskType = TaskType.None;
        if (isTask) {
          taskType = TaskType.Resolved;
          if (isDone(bugs[0].status)) {
            // It doesn't make much sense to be creating a complete task so assume this is manual.
            taskType = TaskType.Manual;
          }
        }

        return await Bug.create(this, bugs[0], taskType);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  public async doneForStatus(bug: BugzillaBug): Promise<DateTime | null> {
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

  public static async list(context: PluginContext, user: string | null = null): Promise<Account[]> {
    let query = context.table<BugzillaAccountRecord>("Account");
    if (user) {
      query = query.where("user", user);
    }

    let records = await query;
    return records.map((record: BugzillaAccountRecord): Account => new Account(context, record));
  }

  public static async create(
    context: PluginContext,
    user: string,
    args: BugzillaAccountParams & Pick<BugzillaAccount, "icon">,
  ): Promise<Account> {
    let record: BugzillaAccountRecord = {
      ...args,
      id: await context.id(),
      user,
      icon: args.icon,
    };

    await context.table("Account").insert(record);
    return new Account(context, record);
  }

  public static async get(context: PluginContext, id: string): Promise<Account | null> {
    let records = await context.table("Account").where("id", id).select("*");
    if (records.length == 1) {
      return new Account(context, records[0]);
    }
    return null;
  }
}

interface BugzillaSearchBugsRecord {
  accountId: string;
  searchId: string;
  bugId: number;
  present: boolean;
}

type BugzillaSearchRecord = Omit<Impl<BugzillaSearch>, "url" | "type"> & {
  accountId: string;
  type: SearchType;
};

interface SearchUpdateResults {
  presentBugs: Bug[],
  changedIds: number[],
}

export class Search implements Impl<BugzillaSearch> {
  public constructor(
    private readonly account: Account,
    private readonly record: BugzillaSearchRecord,
  ) {
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

    let url = new URL("/buglist.cgi", this.account.url);
    url.search = search;

    return url.toString();
  }

  /**
   * @returns all bug IDs that changed presence from this update.
   */
  public async update(bugs?: BugzillaBug[]): Promise<SearchUpdateResults> {
    if (!bugs) {
      bugs = await this.getBugs();
    }

    let newInstances: Bug[] = [];
    let instances: Bug[] = [];

    for (let bug of bugs) {
      let instance = await Bug.get(this.account, bug.id);

      if (!instance) {
        instance = await Bug.create(this.account, bug, TaskType.Search);
        newInstances.push(instance);
      } else {
        await instance.update(bug);
      }

      instances.push(instance);
    }

    let presentIds = bugs.map((bug: BugzillaBug): number => bug.id);

    let changedIds = await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
      .where((builder: Knex.QueryBuilder): void => {
        void builder
          .whereIn("bugId", presentIds)
          .andWhere({
            searchId: this.id,
            present: false,
          });
      })
      .orWhere((builder: Knex.QueryBuilder): void => {
        void builder
          .whereNotIn("bugId", presentIds)
          .andWhere({
            searchId: this.id,
            present: true,
          });
      })
      .pluck("bugId");

    // Mark all existing present bugs as present.
    await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
      .whereIn("bugId", presentIds)
      .andWhere({
        searchId: this.id,
        present: false,
      })
      .update({
        present: true,
      });

    // Mark all existing absent bugs as absent.
    await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
      .whereNotIn("bugId", presentIds)
      .andWhere({
        searchId: this.id,
        present: true,
      })
      .update({
        present: false,
      });

    if (newInstances.length) {
    // Add all the new records.
      let newRecords: BugzillaSearchBugsRecord[] = newInstances.map(
        (bug: Bug): BugzillaSearchBugsRecord => ({
          accountId: this.account.id,
          searchId: this.id,
          bugId: bug.id,
          present: true,
        }),
      );

      await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
        .insert(newRecords);
    }

    return {
      presentBugs: instances,
      changedIds,
    };
  }

  public async getBugs(): Promise<BugzillaBug[]> {
    return Search.getBugs(this.account.getAPI(), this.record);
  }

  public static async getBugs(
    api: BugzillaAPI,
    record: Pick<BugzillaSearchRecord, "type" | "query">,
  ): Promise<BugzillaBug[]> {
    if (record.type == SearchType.Quicksearch) {
      return api.quicksearch(record.query);
    } else {
      return api.advancedSearch(record.query);
    }
  }

  public static async create(
    context: PluginContext,
    account: Account,
    args: BugzillaSearchParams,
  ): Promise<Search> {
    let record: BugzillaSearchRecord = {
      ...args,
      id: await context.id(),
      accountId: account.id,
      type: args.type as SearchType,
    };

    await context.table("Search").insert(record);
    return account.searchCache.upsertItem(record.id, () => new Search(account, record));
  }

  public static async list(account: Account): Promise<Search[]> {
    let records = await account.context.table<BugzillaSearchRecord>("Search")
      .where("accountId", account.id);
    return Promise.all(records.map(
      (record: BugzillaSearchRecord): Promise<Search> => {
        return account.searchCache.upsertItem(record.id, () => new Search(account, record));
      },
    ));
  }
}

type BugzillaBugRecord = Pick<BugzillaBug, "summary"> & {
  accountId: string;
  bugId: number;
  itemId: string;
  taskType: TaskType;
  status: string;
  resolution: string | null;
};

export class Bug {
  public constructor(
    private readonly account: Account,
    private record: BugzillaBugRecord,
  ) {
  }

  private get context(): PluginContext {
    return this.account.context;
  }

  public async getBug(): Promise<BugzillaBug> {
    let account = this.account;
    let api = account.getAPI();
    let bugs = await api.getBugs([this.id]);

    if (!bugs.length) {
      throw new Error("Bug is missing.");
    }

    return bugs[0];
  }

  public get id(): number {
    return this.record.bugId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public get taskType(): TaskType {
    return this.record.taskType;
  }

  public async searches(): Promise<SearchPresence[]> {
    let searches = await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
      .where({
        bugId: this.id,
        accountId: this.account.id,
      })
      .select("*");

    return searches.map((record: BugzillaSearchBugsRecord): SearchPresence => ({
      search: record.searchId,
      present: record.present,
    }));
  }

  public async updateSearchStatus(): Promise<void> {
    if (this.taskType != TaskType.Search) {
      return;
    }

    let item = await this.getItem();

    let presentSearches = await this.context.table<BugzillaSearchBugsRecord>("SearchBugs")
      .where({
        bugId: this.id,
        accountId: this.account.id,
        present: true,
      })
      .pluck("searchId");

    let taskInfo = item.taskInfo;
    if (presentSearches.length == 0 && taskInfo?.done) {
      return;
    }
    if (presentSearches.length > 0 && taskInfo && !taskInfo.done) {
      return;
    }

    await this.context.setItemTaskInfo(item.id, {
      due: taskInfo?.due ?? null,
      done: presentSearches.length ? null : DateTime.utc(),
    });
  }

  public async update(record?: BugzillaBug): Promise<void> {
    if (!record) {
      let bugs = await this.account.getAPI().getBugs([this.id]);
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    let item = await this.getItem();

    if (this.taskType == TaskType.Resolved) {
      let done = await this.account.doneForStatus(record);

      let taskInfo = {
        due: null,
        ...item.taskInfo ?? {},
        done,
      };

      await this.context.setItemTaskInfo(item.id, taskInfo);
    }
  }

  public async setTaskType(taskType: TaskType): Promise<void> {
    if (taskType == this.taskType) {
      return;
    }

    let item = await this.getItem();

    switch (taskType) {
      case TaskType.None:
        await this.context.setItemTaskInfo(item.id, null);
        break;
      case TaskType.Search: {
        let searches = await this.searches();
        let isDone = searches.every((presence: SearchPresence): boolean => !presence.present);

        let taskInfo = {
          due: null,
          ...item.taskInfo ?? {},
          done: isDone ? DateTime.now() : null,
        };

        await this.context.setItemTaskInfo(item.id, taskInfo);
        break;
      }
      case TaskType.Manual:
        if (!item.taskInfo) {
          await this.context.setItemTaskInfo(item.id, {
            due: null,
            done: null,
          });
        }
        break;
      case TaskType.Resolved: {
        let done = await this.account.doneForStatus(await this.getBug());

        let taskInfo = {
          due: null,
          ...item.taskInfo ?? {},
          done,
        };

        await this.context.setItemTaskInfo(item.id, taskInfo);
        break;
      }
      default:
        return;
    }

    await this.context.table("Bug").update({ taskType }).where("itemId", this.itemId);

    this.record.taskType = taskType;
  }

  public async fields(): Promise<BugRecord> {
    let baseUrl = new URL(this.account.url);

    return {
      accountId: this.account.id,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: new URL(`/show_bug.cgi?id=${this.record.bugId}`, baseUrl).toString(),
      taskType: this.record.taskType,
      icon: this.account.icon,
      searches: await this.searches(),
      status: this.record.status,
      resolution: this.record.resolution,
    };
  }

  public async getItem(): Promise<BasePluginItem> {
    let item = await this.context.getItem(this.itemId);
    if (!item) {
      throw new Error(`Missing item record for ${this.itemId}`);
    }

    return item;
  }

  public async editTaskInfo(
    newTaskInfo: PluginTaskInfo | null,
  ): Promise<void> {
    let { taskInfo: oldTaskInfo } = await this.getItem();

    if (newTaskInfo === null && oldTaskInfo === null) {
      return;
    }

    if (newTaskInfo && oldTaskInfo && oldTaskInfo.due?.valueOf() !== newTaskInfo.due?.valueOf()) {
      // No change.
      return;
    }

    // Make a manual task

    this.record.taskType = newTaskInfo ? TaskType.Manual : TaskType.None;

    await this.context.table("Bug").update(this.record).where("itemId", this.itemId);
  }

  public static async create(
    account: Account,
    bug: BugzillaBug,
    taskType: TaskType,
  ): Promise<Bug> {
    let taskInfo: PluginTaskInfo | null;

    switch (taskType) {
      case TaskType.None:
        taskInfo = null;
        break;
      case TaskType.Manual:
        // Just asume that since we're creating it the user isn't done with it yet.
        taskInfo = {
          done: null,
          due: null,
        };
        break;
      case TaskType.Resolved: {
        taskInfo = {
          done: await account.doneForStatus(bug),
          due: null,
        };
        break;
      }
      case TaskType.Search: {
        // Assume that we're only creating the item as the result of a search and so it is in the
        // results.
        taskInfo = {
          done: null,
          due: null,
        };
        break;
      }
    }

    let item = await account.context.createItem(account.user, {
      summary: bug.summary,
      archived: null,
      snoozed: null,
      taskInfo,
    });

    let record: BugzillaBugRecord = {
      accountId: account.id,
      bugId: bug.id,
      itemId: item.id,
      summary: bug.summary,
      status: bug.status,
      resolution: bug.resolution || null,
      taskType,
    };

    await account.context.table("Bug").insert(record);
    let instance = new Bug(account, record);
    account.bugCache.addItem(instance);
    return instance;
  }

  public static async getForItem(context: PluginContext, itemId: string): Promise<Bug | null> {
    let records = await context.table<BugzillaBugRecord>("Bug").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return account.bugCache.upsertItem(records[0].bugId, () => new Bug(account!, records[0]));
    }

    return null;
  }

  public static async get(
    account: Account,
    bugId: number,
  ): Promise<Bug | null> {
    return account.bugCache.getItem(bugId);
  }
}
