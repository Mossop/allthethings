import type { PluginContext } from "@allthethings/server";

import type { BugzillaAccount, MutationCreateBugzillaAccountArgs } from "../schema";

type Impl<T> = Omit<T, "__typename">;

export class Account implements Impl<BugzillaAccount> {
  public constructor(private readonly record: Impl<BugzillaAccount>) {
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

  public get username(): string | null {
    return this.record.username;
  }

  public static async list(context: PluginContext, user: string): Promise<Account[]> {
    let records = await context.table<Impl<BugzillaAccount>>("Account").where("user", user);
    return records.map((record: Impl<BugzillaAccount>): Account => new Account(record));
  }

  public static async create(
    context: PluginContext,
    user: string,
    args: MutationCreateBugzillaAccountArgs,
  ): Promise<Account> {
    let record = {
      ...args,
      id: await context.id(),
      user,
      icon: null,
    };

    await context.table("Account").insert(record);
    return new Account(record);
  }

  public static async get(context: PluginContext, id: string): Promise<Account | null> {
    let records = await context.table("Account").where("id", id).select("*");
    if (records.length == 1) {
      return new Account(records[0]);
    }
    return null;
  }
}
