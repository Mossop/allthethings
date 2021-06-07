import { URL, URLSearchParams } from "url";

import { TaskController } from "@allthethings/schema";
import type { PluginContext, BasePluginItem } from "@allthethings/server";
import { relatedCache } from "@allthethings/utils";
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

const accounts = relatedCache(
  async (context: PluginContext, id: string): Promise<Account | null> => {
    let records = await context.table<BugzillaAccountRecord>("Account").where({
      id,
    }).select("*");

    if (records.length == 1) {
      return new Account(context, records[0]);
    }

    return null;
  },
);

const bugs = relatedCache(async (account: Account, id: number): Promise<Bug | null> => {
  let records = await account.context.table<BugzillaBugRecord>("Bug").where({
    accountId: account.id,
    bugId: id,
  }).select("*");

  if (records.length == 1) {
    return new Bug(account, records[0]);
  }

  return null;
});

const searches = relatedCache(async (account: Account, id: string): Promise<Search | null> => {
  let records = await account.context.table<BugzillaSearchRecord>("Search").where({
    accountId: account.id,
    id,
  }).select("*");

  if (records.length == 1) {
    return new Search(account, records[0]);
  }

  return null;
});

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
  private api: BugzillaAPI | null = null;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: BugzillaAccountRecord,
  ) {
  }

  public async delete(): Promise<void> {
    let searches = await Search.list(this);
    for (let search of searches) {
      await search.delete();
    }

    let bugs = await this.getBugs();

    for (let bug of bugs) {
      await bug.update();
      await this.context.disconnectItem(bug.itemId, bug.url.toString(), this.icon);
    }

    await this.context.table<BugzillaAccountRecord>("Account")
      .where("id", this.id)
      .delete();

    accounts(this.context).deleteItem(this.id);
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

    return records.map((record: BugzillaBugRecord): Bug => {
      return bugs(this).upsertItem(record.bugId, () => new Bug(this, record));
    });
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

    let existing = await Bug.get(this, parseInt(id));
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

  public static async list(context: PluginContext, user: string | null = null): Promise<Account[]> {
    let query = context.table<BugzillaAccountRecord>("Account");
    if (user) {
      query = query.where("user", user);
    }

    let records = await query;
    return records.map((record: BugzillaAccountRecord): Account => {
      return accounts(context).upsertItem(record.id, () => new Account(context, record));
    });
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
    return accounts(context).addItem(new Account(context, record));
  }

  public static async get(context: PluginContext, id: string): Promise<Account | null> {
    return accounts(context).getItem(id);
  }
}

export class Search implements GraphQLType<BugzillaSearch> {
  public constructor(
    private readonly account: Account,
    private readonly record: BugzillaSearchRecord,
  ) {
  }

  public async delete(): Promise<void> {
    await this.context.deleteList(this.id);
    searches(this.account).deleteItem(this.id);
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

  public async update(bugs?: BugzillaAPIBug[]): Promise<void> {
    if (!bugs) {
      bugs = await this.getBugRecords();
    }

    let instances: Bug[] = [];

    for (let bug of bugs) {
      let instance = await Bug.get(this.account, bug.id);

      if (!instance) {
        instance = await Bug.create(this.account, bug, TaskController.PluginList);
      } else {
        await instance.update(bug);
      }

      instances.push(instance);
    }

    await this.context.updateList(this.id, {
      items: instances.map((bug: Bug): string => bug.itemId),
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
    context: PluginContext,
    account: Account,
    record: Omit<BugzillaSearchRecord, "id" | "accountId">,
  ): Promise<Search> {
    let bugs = await Search.getBugRecords(account.getAPI(), {
      type: record.type,
      query: record.query,
    });

    let id = await context.addList({
      name: record.name,
      url: "",
    });

    let dbRecord: BugzillaSearchRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    await context.table<BugzillaSearchRecord>("Search").insert(dbRecord);
    let search = searches(account).upsertItem(id, () => new Search(account, dbRecord));
    await search.update(bugs);

    return search;
  }

  public static async get(context: PluginContext, id: string): Promise<Search | null> {
    let record = await context.table<BugzillaSearchRecord>("Search")
      .where("id", id)
      .first();

    if (!record) {
      return null;
    }

    let account = await Account.get(context, record.accountId);
    if (!account) {
      throw new Error("Unexpected.");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return searches(account).upsertItem(record.id, () => new Search(account!, record!));
  }

  public static async list(account: Account): Promise<Search[]> {
    let records = await account.context.table<BugzillaSearchRecord>("Search")
      .where("accountId", account.id);
    return records.map(
      (record: BugzillaSearchRecord): Search => {
        return searches(account).upsertItem(record.id, () => new Search(account, record));
      },
    );
  }
}

type FixedFields = "accountId" | "itemId";

function recordFromBug(bug: BugzillaAPIBug): Omit<BugzillaBugRecord, FixedFields> {
  return {
    bugId: bug.id,
    summary: bug.summary,
    status: bug.status,
    resolution: bug.resolution || null,
  };
}

export class Bug {
  public constructor(
    private readonly account: Account,
    private record: BugzillaBugRecord,
  ) {
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

  public get id(): number {
    return this.record.bugId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public get url(): URL {
    let baseUrl = new URL(this.account.url);

    return new URL(`show_bug.cgi?id=${this.record.bugId}`, baseUrl);
  }

  public async update(record?: BugzillaAPIBug): Promise<void> {
    if (!record) {
      let bugs = await this.account.getAPI().getBugs([this.id]);
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    await this.context.table("Bug")
      .where({
        itemId: this.itemId,
      })
      .update(recordFromBug(record));

    await this.context.setItemTaskDone(this.itemId, await this.account.doneForStatus(record));
    await this.context.setItemSummary(this.itemId, record.summary);
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

  public async getItem(): Promise<BasePluginItem> {
    let item = await this.context.getItem(this.itemId);
    if (!item) {
      throw new Error(`Missing item record for ${this.itemId}`);
    }

    return item;
  }

  public static async create(
    account: Account,
    bug: BugzillaAPIBug,
    controller: TaskController | null,
  ): Promise<Bug> {
    let item = await account.context.createItem(account.user, {
      summary: bug.summary,
      archived: null,
      snoozed: null,
      done: await account.doneForStatus(bug),
      controller,
    });

    let record: BugzillaBugRecord = {
      accountId: account.id,
      itemId: item.id,
      ...recordFromBug(bug),
    };

    await account.context.table("Bug").insert(record);
    return bugs(account).addItem(new Bug(account, record));
  }

  public static async getForItem(context: PluginContext, itemId: string): Promise<Bug | null> {
    let records = await context.table<BugzillaBugRecord>("Bug").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return bugs(account).upsertItem(records[0].bugId, () => new Bug(account!, records[0]));
    }

    return null;
  }

  public static async get(
    account: Account,
    bugId: number,
  ): Promise<Bug | null> {
    return bugs(account).getItem(bugId);
  }

  public static async list(account: Account): Promise<Bug[]> {
    let records = await account.context.table<BugzillaBugRecord>("Bug")
      .where("accountId", account.id)
      .select("*");

    return records.map(
      (record: BugzillaBugRecord): Bug => {
        return bugs(account).upsertItem(record.bugId, () => new Bug(account, record));
      },
    );
  }
}
