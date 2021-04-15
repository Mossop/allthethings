import { URL } from "url";

import type { PluginContext, BasePluginItem, PluginTaskInfo } from "@allthethings/server";
import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import type { Bug as BugzillaBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import type {
  BugzillaAccount,
  BugzillaSearch,
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
} from "../schema";
import type { BugRecord, SearchType } from "../types";
import { TaskType } from "../types";

type Impl<T> = Omit<T, "__typename">;

type Resolver<T> = {
  readonly [K in keyof Impl<T>]: MaybeCallable<Awaitable<T[K]>>;
};

type BugzillaAccountRecord = Omit<Impl<BugzillaAccount>, "searches"> & {
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

export class Account implements Resolver<BugzillaAccount> {
  private api: BugzillaAPI | null = null;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: BugzillaAccountRecord,
  ) {
  }

  public getAPI(): BugzillaAPI {
    if (!this.api) {
      if (!this.username) {
        this.api = new BugzillaAPI(this.url);
      } else if (!this.record.password) {
        this.api = new BugzillaAPI(this.url, this.username);
      } else {
        this.api = new BugzillaAPI(this.url, this.username, this.record.password);
      }
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
    return Search.list(this.context, this);
  }

  public async getBugs(): Promise<Bug[]> {
    let records = await this.context
      .table<BugzillaBugRecord>("Bug")
      .where("accountId", this.id)
      .select("*");

    return records.map((record: BugzillaBugRecord): Bug => new Bug(this, record));
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

        return await Bug.create(this.context, this, bugs[0], taskType);
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
    args: MutationCreateBugzillaAccountArgs["params"] & Pick<BugzillaAccount, "icon">,
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

type BugzillaSearchRecord = Omit<Impl<BugzillaSearch>, "url" | "type"> & {
  accountId: string;
  type: SearchType;
};

export class Search implements Impl<BugzillaSearch> {
  public constructor(
    public readonly context: PluginContext,
    private readonly record: BugzillaSearchRecord,
  ) {
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
    return "";
  }

  public static async create(
    context: PluginContext,
    account: Account,
    args: MutationCreateBugzillaSearchArgs["params"],
  ): Promise<Search> {
    let record: BugzillaSearchRecord = {
      ...args,
      id: await context.id(),
      accountId: account.id,
      type: args.type as SearchType,
    };

    await context.table("Search").insert(record);
    return new Search(context, record);
  }

  public static async list(context: PluginContext, account: Account): Promise<Search[]> {
    let records = await context.table<BugzillaSearchRecord>("Search")
      .where("accountId", account.id);
    return records.map((record: BugzillaSearchRecord): Search => new Search(context, record));
  }
}

type BugzillaBugRecord = Pick<BugzillaBug, "summary"> & {
  accountId: string;
  bugId: number;
  itemId: string;
  taskType: TaskType;
};

export class Bug {
  public constructor(
    private readonly account: Account,
    private readonly record: BugzillaBugRecord,
  ) {
  }

  private get context(): PluginContext {
    return this.account.context;
  }

  public async getBug(): Promise<BugzillaBug> {
    let account = this.account;
    let api = account.getAPI();
    let bugs = await api.getBugs([this.bugId]);

    if (!bugs.length) {
      throw new Error("Bug is missing.");
    }

    return bugs[0];
  }

  public get bugId(): number {
    return this.record.bugId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public get taskType(): TaskType {
    return this.record.taskType;
  }

  public async update(record?: BugzillaBug): Promise<void> {
    if (!record) {
      let bugs = await this.account.getAPI().getBugs([this.bugId]);
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
      // The next search will update this.
      case TaskType.Search:
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
      accountId: this.record.accountId,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: new URL(`/show_bug.cgi?id=${this.record.bugId}`, baseUrl).toString(),
      taskType: this.record.taskType,
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

    let newRecord = {
      ...this.record,
      taskType: newTaskInfo ? TaskType.Manual : TaskType.None,
    };

    await this.context.table("Bug").update(newRecord).where("itemId", this.itemId);
  }

  public static async create(
    context: PluginContext,
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

    let item = await context.createItem(account.user, {
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
      taskType,
    };

    await context.table("Bug").insert(record);
    return new Bug(account, record);
  }

  public static async getForItem(context: PluginContext, itemId: string): Promise<Bug | null> {
    let records = await context.table<BugzillaBugRecord>("Bug").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      return new Bug(account, records[0]);
    }
    return null;
  }

  public static async get(
    context: PluginContext,
    accountId: string,
    bugId: number,
  ): Promise<Bug | null> {
    let account = await Account.get(context, accountId);

    if (!account) {
      throw new Error("Missing account");
    }

    let records = await context.table("Bug").where({
      accountId,
      bugId,
    }).select("*");

    if (records.length == 1) {
      return new Bug(account, records[0]);
    }

    return null;
  }
}
