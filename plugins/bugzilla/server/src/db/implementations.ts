import { URL } from "url";

import type { PluginContext, PluginItemFields } from "@allthethings/server";
import type { Bug as BugzillaBug } from "bugzilla";
import BugzillaAPI from "bugzilla";

import type { BugzillaAccount, MutationCreateBugzillaAccountArgs } from "../schema";

type Impl<T> = Omit<T, "__typename">;

type BugzillaAccountRecord = Impl<BugzillaAccount> & {
  user: string;
  password: string | null;
};

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
        return await Bug.create(this.context, this, bugs[0]);
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
};

export class Bug {
  public constructor(
    private readonly context: PluginContext,
    private readonly record: BugzillaBugRecord,
  ) {
  }

  public get bugId(): number {
    return this.record.bugId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public get fields(): PluginItemFields {
    return {
      accountId: this.record.accountId,
      bugId: this.record.bugId,
      summary: this.record.summary,
    };
  }

  public static async create(
    context: PluginContext,
    account: Account,
    bug: BugzillaBug,
  ): Promise<Bug> {
    let itemId = await context.createItem(account.user, {
      summary: bug.summary,
      archived: null,
      snoozed: null,
    });

    let record: BugzillaBugRecord = {
      accountId: account.id,
      bugId: bug.id,
      itemId,
      summary: bug.summary,
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
