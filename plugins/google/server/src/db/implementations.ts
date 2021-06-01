import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import { people as gPeople } from "@googleapis/people";
import type { Credentials, OAuth2Client } from "google-auth-library";

import { createAuthClient } from "../auth";
import type {
  GoogleAccount,
} from "../schema";
import type { GooglePluginConfig } from "../types";
import type { GoogleAccountRecord } from "./types";

export class Account implements GraphQLResolver<GoogleAccount> {
  public constructor(
    public readonly config: GooglePluginConfig,
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
    private client?: OAuth2Client,
  ) {
    this.watchTokens();
  }

  private watchTokens(): void {
    if (this.client) {
      this.client.on("tokens", (credentials: Credentials): void => {
        let {
          access_token: accessToken,
          expiry_date: expiry,
          refresh_token: refreshToken,
        } = credentials;

        if (!accessToken || !refreshToken || !expiry) {
          return;
        }

        void this.context.table<GoogleAccountRecord>("Account").where("id", this.id).update({
          accessToken,
          refreshToken,
          expiry: Math.floor(expiry / 1000),
        });
      });
    }
  }

  public get authClient(): OAuth2Client {
    if (this.client) {
      return this.client;
    }

    this.client = createAuthClient(this.config, this.context.pluginUrl, this.record);
    this.watchTokens();
    return this.client;
  }

  public get id(): string {
    return this.record.id;
  }

  public get email(): string {
    return this.record.email;
  }

  public get avatar(): string | null {
    return this.record.avatar;
  }

  public static async list(
    config: GooglePluginConfig,
    context: PluginContext,
    userId: string,
  ): Promise<Account[]> {
    let records = await context.table<GoogleAccountRecord>("Account")
      .where("user", userId)
      .select("*");

    return records.map((record: GoogleAccountRecord): Account => {
      return new Account(config, context, record);
    });
  }

  public static async create(
    config: GooglePluginConfig,
    context: AuthedPluginContext,
    code: string,
  ): Promise<Account> {
    let client = createAuthClient(config, context.pluginUrl);
    let { tokens: credentials } = await client.getToken(code);

    let {
      access_token: accessToken,
      expiry_date: expiry,
      refresh_token: refreshToken,
    } = credentials;

    if (!accessToken || !refreshToken || !expiry) {
      throw new Error("Failed to authenticate correctly.");
    }

    client.setCredentials(credentials);

    let tokenInfo = await client.getTokenInfo(accessToken);
    if (!tokenInfo.email) {
      throw new Error("Failed to authenticate correctly.");
    }

    let people = gPeople({
      version: "v1",
      auth: client,
    });

    let userInfo = await people.people.get({
      resourceName: "people/me",
      personFields: "photos",
    });

    let avatar: string | null = null;
    let photos = userInfo.data.photos ?? [];
    for (let photo of photos) {
      if (photo.metadata?.primary && photo.url) {
        avatar = photo.url;
      }
    }

    let record: GoogleAccountRecord = {
      id: await context.id(),
      user: context.userId,
      email: tokenInfo.email,
      avatar,
      accessToken,
      refreshToken,
      expiry: Math.floor(expiry / 1000),
    };

    await context.table<GoogleAccountRecord>("Account").insert(record);

    return new Account(config, context, record, client);
  }
}
