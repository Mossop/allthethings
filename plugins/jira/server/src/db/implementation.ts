import type { PluginContext } from "@allthethings/server";
import {
  BaseAccount,
  ItemsTable,
} from "@allthethings/server";
import { classBuilder } from "@allthethings/server/dist/plugins/tables";
import type { GraphQLResolver } from "@allthethings/utils";
import { Version3Client } from "jira.js";

import type {
  JiraAccount,
  JiraAccountParams,
} from "../schema";
import type { JiraAccountRecord } from "./types";

export class Account extends BaseAccount implements GraphQLResolver<JiraAccount> {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  public constructor(
    context: PluginContext,
    private record: JiraAccountRecord,
  ) {
    super(context);
  }

  public async onRecordUpdate(record: JiraAccountRecord): Promise<void> {
    this.record = record;
  }

  public get id(): string {
    return this.record.id;
  }

  public get serverName(): string {
    return this.record.serverName;
  }

  public get userName(): string {
    return this.record.userName;
  }

  public get url(): string {
    return this.record.url;
  }

  public get email(): string {
    return this.record.email;
  }

  public get apiToken(): string {
    return this.record.apiToken;
  }

  public async items(): Promise<[]> {
    return [];
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
  }

  public get apiClient(): Version3Client {
    return new Version3Client({
      host: this.url,
      authentication: {
        basic: {
          email: this.email,
          apiToken: this.apiToken,
        },
      },
      telemetry: false,
    });
  }

  public async update(): Promise<void> {
    let client = this.apiClient;

    let serverInfo = await client.serverInfo.getServerInfo();
    let userInfo = await client.myself.getCurrentUser();

    await Account.store.update(this.context, {
      id: this.id,
      serverName: serverInfo.serverTitle ?? this.url,
      userName: userInfo.displayName ?? userInfo.name ?? this.email,
    });
  }

  public static async create(
    context: PluginContext,
    userId: string,
    args: JiraAccountParams,
  ): Promise<Account> {
    let client = new Version3Client({
      host: args.url,
      authentication: {
        basic: {
          email: args.email,
          apiToken: args.apiToken,
        },
      },
      telemetry: false,
    });

    let serverInfo = await client.serverInfo.getServerInfo();
    let userInfo = await client.myself.getCurrentUser();

    let record: JiraAccountRecord = {
      ...args,
      userId,
      serverName: serverInfo.serverTitle ?? args.url,
      userName: userInfo.displayName ?? userInfo.name ?? args.email,
      id: await context.id(),
    };

    return Account.store.insert(context, record);
  }
}
