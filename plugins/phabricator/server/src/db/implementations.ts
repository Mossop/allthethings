import type { PluginContext } from "@allthethings/server";
import {
  BaseAccount,
  ItemsTable,
} from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import conduit from "conduit-api";

import type { PhabricatorAccount, PhabricatorAccountParams } from "../schema";
import type { PhabricatorAccountRecord } from "./types";

export class Account extends BaseAccount implements GraphQLResolver<PhabricatorAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  public constructor(
    context: PluginContext,
    private readonly record: PhabricatorAccountRecord,
  ) {
    super(context);
  }

  public get id(): string {
    return this.record.id;
  }

  public get icon(): string {
    return this.record.icon;
  }

  public get url(): string {
    return this.record.url;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get email(): string {
    return this.record.email;
  }

  public get apiKey(): string {
    return this.record.apiKey;
  }

  public async items(): Promise<[]> {
    return [];
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
  }

  public static async create(
    context: PluginContext,
    userId: string,
    { url, apiKey }: PhabricatorAccountParams,
  ): Promise<Account> {
    let api = conduit(url, apiKey);
    let user = await api.user.whoami();

    let record: PhabricatorAccountRecord = {
      id: await context.id(),
      userId,
      url,
      apiKey,
      icon: user.image,
      email: user.primaryEmail,
    };

    return Account.store.insert(context, record);
  }
}
