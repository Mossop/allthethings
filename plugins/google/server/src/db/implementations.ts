import type { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import { ItemCache } from "@allthethings/utils";
import type { drive_v3 } from "@googleapis/drive";
import { drive } from "@googleapis/drive";
import { gmail } from "@googleapis/gmail";
import { people as gPeople } from "@googleapis/people";
import type { Credentials, OAuth2Client } from "google-auth-library";

import { createAuthClient } from "../auth";
import type {
  GoogleAccount,
} from "../schema";
import type { FileFields, GooglePluginConfig } from "../types";
import type { GoogleAccountRecord, GoogleFileRecord } from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account implements GraphQLResolver<GoogleAccount> {
  public readonly fileCache: ItemCache<string, File>;

  public constructor(
    public readonly config: GooglePluginConfig,
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
    private client?: OAuth2Client,
  ) {
    this.fileCache = new ItemCache(async (id: string): Promise<File | null> => {
      let records = await this.context.table<GoogleFileRecord>("File").where({
        accountId: this.id,
        fileId: id,
      }).select("*");

      if (records.length == 1) {
        return new File(this, records[0]);
      }

      return null;
    });

    this.watchTokens();
  }

  public get user(): string {
    return this.record.user;
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

  public async getItemFromURL(url: URL, isTask: boolean): Promise<GoogleItem | null> {
    let item = await Mail.getItemFromURL(this, url, isTask);
    if (item) {
      return item;
    }

    return File.getItemFromURL(this, url, isTask);
  }

  public static async get(
    config: GooglePluginConfig,
    context: PluginContext,
    id: string,
  ): Promise<Account | null> {
    let records = await context.table("Account").where("id", id).select("*");
    if (records.length == 1) {
      return new Account(config, context, records[0]);
    }
    return null;
  }
}

interface GoogleItem {
  itemId: string;
}

export class Mail implements GoogleItem {
  public static async getItemFromURL(
    account: Account,
    url: URL,
    isTask: boolean,
  ): Promise<Mail | null> {
    if (url.hostname != "mail.google.com" || url.hash.length == 0) {
      return null;
    }

    let mailId = url.hash.substring(1);
    let idPos = mailId.lastIndexOf("/");
    if (idPos >= 0) {
      mailId = mailId.substring(idPos + 1);
    }

    return null;
  }

  public get itemId(): string {
    return "";
  }
}

type Present<T, F extends keyof T> = Omit<T, F> & {
  [K in F]-?: NonNullable<T[K]>;
};

type GoogleAPIFile = Present<Pick<drive_v3.Schema$File,
  "id" |
  "name" |
  "mimeType" |
  "description" |
  "iconLink" |
  "webViewLink"
>, "id" | "name" | "mimeType">;

export class File implements GoogleItem {
  public constructor(private readonly account: Account, private readonly record: GoogleFileRecord) {
  }

  private static fileFields: (keyof GoogleAPIFile | "trashed")[] = [
    "id",
    "name",
    "mimeType",
    "description",
    "iconLink",
    "webViewLink",
    "trashed",
  ];

  private static async getAPIFile(account: Account, fileId: string): Promise<GoogleAPIFile | null> {
    let api = drive({
      version: "v3",
      auth: account.authClient,
    });

    try {
      let { data } = await api.files.get({
        fileId,
        supportsAllDrives: true,
        fields: File.fileFields.join(", "),
      });

      if (data.trashed) {
        return null;
      }

      if (!data.id || !data.name || !data.mimeType) {
        return null;
      }

      // @ts-ignore
      return data;
    } catch (e) {
      return null;
    }
  }

  private static recordFromFile(
    file: GoogleAPIFile,
  ): Omit<GoogleFileRecord, "accountId" | "fileId" | "itemId"> {
    return {
      name: file.name,
      description: file.description ?? null,
      mimeType: file.mimeType,
      url: file.webViewLink ?? null,
    };
  }

  public static async create(
    account: Account,
    file: GoogleAPIFile,
    isTask: boolean,
  ): Promise<File> {
    let item = await account.context.createItem(account.user, {
      summary: file.name,
      archived: null,
      snoozed: null,
      done: undefined,
      controller: isTask ? TaskController.Manual : null,
    });

    let record: GoogleFileRecord = {
      accountId: account.id,
      fileId: file.id,
      itemId: item.id,
      ...File.recordFromFile(file),
    };

    await account.context.table<GoogleFileRecord>("File").insert(record);
    let instance = new File(account, record);
    account.fileCache.addItem(instance);
    return instance;
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.record,
      type: "file",
    };
  }

  public static async getForItem(
    config: GooglePluginConfig,
    context: PluginContext,
    itemId: string,
  ): Promise<File | null> {
    let records = await context.table<GoogleFileRecord>("File").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(config, context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return account.fileCache.upsertItem(records[0].fileId, () => new File(account!, records[0]));
    }

    return null;
  }

  public static async getItemFromURL(
    account: Account,
    url: URL,
    isTask: boolean,
  ): Promise<File | null> {
    let matches = DRIVE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let file = await File.getAPIFile(account, matches[1]);
    if (!file) {
      return null;
    }

    return File.create(account, {
      webViewLink: url.toString(),
      ...file,
    }, isTask);
  }

  public get id(): string {
    return this.record.fileId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }
}
