import { URL } from "url";

import type { PluginContext, BasePluginItem, PluginTaskInfo } from "@allthethings/server";
import type { Bug as BugzillaBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";

import type { BugzillaAccount, MutationCreateBugzillaAccountArgs } from "../schema";
import type { BugRecord } from "../types";
import { TaskType } from "../types";

type Impl<T> = Omit<T, "__typename">;

type BugzillaAccountRecord = Impl<BugzillaAccount> & {
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

export class Account implements Impl<BugzillaAccount> {
  public constructor(
    private readonly context: PluginContext,
    private readonly record: BugzillaAccountRecord,
  ) {
  }

  public getAPI(): BugzillaAPI {
    if (!this.username) {
      return new BugzillaAPI(this.url);
    }

    if (!this.record.password) {
      return new BugzillaAPI(this.url, this.username);
    }

    return new BugzillaAPI(this.url, this.username, this.record.password);
  }

  public get id(): string {
    return this.record.id;
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

  public async getBugFromURL(url: URL): Promise<Bug | null> {
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
        let type = TaskType.Resolved;
        if (isDone(bugs[0].status)) {
          // It doesn't make much sense to be creating a complete task so assume this is not a task.
          type = TaskType.Manual;
        }

        return await Bug.create(this.context, this, bugs[0], type);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  public static async list(context: PluginContext, user: string): Promise<Account[]> {
    let records = await context.table<BugzillaAccountRecord>("Account").where("user", user);
    return records.map((record: BugzillaAccountRecord): Account => new Account(context, record));
  }

  public static async create(
    context: PluginContext,
    user: string,
    args: MutationCreateBugzillaAccountArgs,
  ): Promise<Account> {
    let record: BugzillaAccountRecord = {
      ...args,
      id: await context.id(),
      user,
      icon: null,
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

type BugzillaBugRecord = Pick<BugzillaBug, "summary"> & {
  accountId: string;
  bugId: number;
  itemId: string;
  taskType: TaskType;
};

export class Bug {
  public constructor(
    private readonly context: PluginContext,
    private readonly record: BugzillaBugRecord,
  ) {
  }

  public async account(): Promise<Account> {
    let account = await Account.get(this.context, this.record.accountId);
    if (!account) {
      throw new Error("Missing account record.");
    }

    return account;
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

  public async fields(): Promise<BugRecord> {
    let account = await this.account();
    let baseUrl = new URL(account.url);

    return {
      accountId: this.record.accountId,
      bugId: this.record.bugId,
      summary: this.record.summary,
      url: new URL(`/show_bug.cgi?id=${this.record.bugId}`, baseUrl).toString(),
      taskType: this.record.taskType,
    };
  }

  public async getItem(context: PluginContext): Promise<BasePluginItem> {
    let item = await context.getItem(this.itemId);
    if (!item) {
      throw new Error(`Missing item record for ${this.itemId}`);
    }

    return item;
  }

  public async editTaskInfo(
    context: PluginContext,
    newTaskInfo: PluginTaskInfo | null,
  ): Promise<void> {
    let { taskInfo: oldTaskInfo } = await this.getItem(context);

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

    await context.table("Bug").update(newRecord).where("itemId", this.itemId);
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
          done: null,
          due: null,
        };

        if (isDone(bug.status)) {
          // If it is done we need to find the last time the resolution was changed.
          let api = account.getAPI();
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
            taskInfo.done = change.when;
          }
        }
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
    return new Bug(context, record);
  }

  public static async getForItem(context: PluginContext, itemId: string): Promise<Bug | null> {
    let records = await context.table("Bug").where({ itemId }).select("*");
    if (records.length == 1) {
      return new Bug(context, records[0]);
    }
    return null;
  }

  public static async get(
    context: PluginContext,
    accountId: string,
    bugId: number,
  ): Promise<Bug | null> {
    let records = await context.table("Bug").where({
      accountId,
      bugId,
    }).select("*");

    if (records.length == 1) {
      return new Bug(context, records[0]);
    }

    return null;
  }
}
