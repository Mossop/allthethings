import { URL, URLSearchParams } from "url";

import type { Bug as BugzillaAPIBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import type {
  ResolverImpl,
  ServiceItem,
  ServiceTransaction,
} from "#server/utils";
import {
  id,
  storeBuilder,
  BaseItem,
  BaseAccount,
  BaseList,
} from "#server/utils";
import { SearchType } from "#services/bugzilla/schema";
import type { BugFields } from "#services/bugzilla/schema";
import type { DateTimeOffset } from "#utils";
import { offsetFromJson } from "#utils";

import type { BugzillaAccount, BugzillaAccountParams } from "../../../schema";
import { TaskController } from "../../../schema";
import type {
  BugzillaAccountEntity,
  BugzillaBugEntity,
  BugzillaSearchEntity,
} from "./entities";
import type {
  BugzillaAccountResolvers,
  BugzillaSearchResolvers,
} from "./schema";

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

export class Account
  extends BaseAccount<BugzillaAccountEntity>
  implements ResolverImpl<BugzillaAccountResolvers>
{
  public static readonly store = storeBuilder(Account, "bugzilla.Account");

  private api: BugzillaAPI | null = null;

  public async items(): Promise<Bug[]> {
    return Bug.store(this.tx).find({ accountId: this.id });
  }

  public override lists(): Promise<Search[]> {
    return this.searches();
  }

  public async searches(): Promise<Search[]> {
    return Search.store(this.tx).find({ accountId: this.id });
  }

  public normalizeQuery(
    query: string,
  ): Pick<BugzillaSearchEntity, "query" | "type"> {
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
    record: Pick<BugzillaAccountEntity, "url" | "username" | "password">,
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
      this.api = Account.buildAPI(this.entity);
    }

    return this.api;
  }

  public get name(): string {
    return this.entity.name;
  }

  public get icon(): string | null {
    return this.entity.icon;
  }

  public get url(): string {
    return this.entity.url;
  }

  public get userId(): string {
    return this.entity.userId;
  }

  public get username(): string | null {
    return this.entity.username;
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

    let existing = await Bug.store(this.tx).findOne({ bugId: parseInt(id) });
    if (existing) {
      return existing;
    }

    let api = this.getAPI();
    let bugs: BugzillaAPIBug[];
    try {
      bugs = await this.tx.segment.inSegment("Bug API Request", async () =>
        api.getBugs([id!]),
      );
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
    let history = await this.tx.segment.inSegment(
      "History API Lookup",
      async () => api.bugHistory(bug.id),
    );

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
    tx: ServiceTransaction,
    userId: string,
    args: BugzillaAccountParams & Pick<BugzillaAccount, "icon">,
  ): Promise<Account> {
    let record: BugzillaAccountEntity = {
      ...args,
      id: await id(),
      username: args.username ?? null,
      password: args.password ?? null,
      userId,
      icon: args.icon ?? null,
    };

    return Account.store(tx).create(record);
  }
}

export class Search
  extends BaseList<BugzillaSearchEntity, BugzillaAPIBug[]>
  implements ResolverImpl<BugzillaSearchResolvers>
{
  public static readonly store = storeBuilder(Search, "bugzilla.Search");

  public owner(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get name(): string {
    return this.entity.name;
  }

  public get type(): SearchType {
    return this.entity.type;
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

  public async listItems(bugs?: BugzillaAPIBug[]): Promise<Bug[]> {
    if (!bugs) {
      bugs = await this.getBugRecords();
    }

    let instances: Bug[] = [];

    for (let bug of bugs) {
      let instance = await Bug.store(this.tx).findOne({ bugId: bug.id });

      if (!instance) {
        let account = await this.owner();
        instance = await Bug.create(account, bug, TaskController.ServiceList);
      } else {
        await instance.updateItem(bug);
      }

      instances.push(instance);
    }

    return instances;
  }

  public async getBugRecords(): Promise<BugzillaAPIBug[]> {
    let account = await this.owner();
    return Search.getBugRecords(account.tx, account.getAPI(), this.entity);
  }

  public static async getBugRecords(
    tx: ServiceTransaction,
    api: BugzillaAPI,
    record: Pick<BugzillaSearchEntity, "type" | "query">,
  ): Promise<BugzillaAPIBug[]> {
    return tx.segment.inSegment("Bug API search", async () => {
      if (record.type == SearchType.Quicksearch) {
        return api.quicksearch(record.query);
      } else {
        return api.advancedSearch(record.query);
      }
    });
  }

  public static async create(
    account: Account,
    record: Omit<BugzillaSearchEntity, "id">,
  ): Promise<Search> {
    let bugs = await Search.getBugRecords(account.tx, account.getAPI(), {
      type: record.type,
      query: record.query,
    });

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let search = await Search.store(account.tx).create({
      id,
      ...record,
    });
    await search.updateList(bugs);

    return search;
  }
}

type FixedFields = "accountId" | "id";

function recordFromBug(
  bug: BugzillaAPIBug,
): Omit<BugzillaBugEntity, FixedFields> {
  return {
    bugId: bug.id,
    summary: bug.summary,
    status: bug.status,
    resolution: bug.resolution || null,
  };
}

export class Bug
  extends BaseItem<BugzillaBugEntity>
  implements ServiceItem<BugFields>
{
  public static readonly store = storeBuilder(Bug, "bugzilla.Bug");

  public owner(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Bug | null> {
    for (let account of await Account.store(tx).find({ userId })) {
      let bug = await account.getBugFromURL(url, isTask);
      if (bug) {
        return bug;
      }
    }

    return null;
  }

  public get bugId(): number {
    return this.entity.bugId;
  }

  public override async url(): Promise<string> {
    let account = await this.owner();
    let baseUrl = new URL(account.url);

    return new URL(`show_bug.cgi?id=${this.entity.bugId}`, baseUrl).toString();
  }

  public override async icon(): Promise<string | null> {
    let account = await this.owner();
    return account.icon;
  }

  public override async updateItem(record?: BugzillaAPIBug): Promise<void> {
    let account = await this.owner();

    if (!record) {
      let bugs = await this.tx.segment.inSegment("Bug API update", async () =>
        account.getAPI().getBugs([this.bugId]),
      );
      if (!bugs.length) {
        throw new Error("Unknown bug.");
      }

      record = bugs[0];
    }

    await this.update({
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
      bugId: this.entity.bugId,
      summary: this.entity.summary,
      url: await this.url(),
      icon: account.icon,
      status: this.entity.status,
      resolution: this.entity.resolution,
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
      id,
      ...recordFromBug(bug),
      accountId: account.id,
    };

    return Bug.store(account.tx).create(record);
  }
}
