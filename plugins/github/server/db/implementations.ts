import {
  BaseAccount,
  ItemsTable,
  classBuilder,
} from "#server-utils";
import type {
  PluginContext,
  BaseItem,

  AuthedPluginContext,
} from "#server-utils";

import { GitHubApi, UserInfo } from "../api";
import type { GithubAccountResolvers } from "../schema";
import type { GithubAccountRecord } from "./types";

export class Account extends BaseAccount implements GithubAccountResolvers {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  private client: GitHubApi | null;

  public constructor(
    public override readonly context: PluginContext,
    private record: GithubAccountRecord,
  ) {
    super(context);
    this.client = null;
  }

  public get api(): GitHubApi {
    if (!this.client) {
      this.client = new GitHubApi(this);
    }

    return this.client;
  }

  public async onRecordUpdate(record: GithubAccountRecord): Promise<void> {
    this.record = record;
  }

  public get token(): string {
    return this.record.token;
  }

  public get id(): string {
    return this.record.id;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get user(): string {
    return this.record.user;
  }

  public get avatar(): string {
    return this.record.avatar;
  }

  public get loginUrl(): string {
    return this.api.generateLoginUrl();
  }

  public async items(): Promise<BaseItem[]> {
    return [];
  }

  public async update(): Promise<void> {
    // TODO
  }

  public static async create(context: AuthedPluginContext, code: string): Promise<Account> {
    let token = await GitHubApi.getToken(code);
    let kit = GitHubApi.getKit(token);
    let userInfo = await UserInfo(kit);

    let existing = await Account.store.first(context, {
      userId: context.userId,
      user: userInfo.viewer.login,
    });

    if (!existing) {
      let record: GithubAccountRecord = {
        id: await context.id(),
        userId: context.userId,
        user: userInfo.viewer.login,
        avatar: userInfo.viewer.avatarUrl,
        token,
      };

      return Account.store.insert(context, record);
    } else {
      await Account.store.update(context, {
        id: existing.id,
        token,
      });

      return existing;
    }
  }
}
