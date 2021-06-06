import type { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import { ItemCache } from "@allthethings/utils";
import type { drive_v3 } from "@googleapis/drive";
import { drive } from "@googleapis/drive";
import type { gmail_v1 } from "@googleapis/gmail";
import { gmail } from "@googleapis/gmail";
import { people as gPeople } from "@googleapis/people";
import type { Credentials, OAuth2Client } from "google-auth-library";

import { createAuthClient, decodeWebId } from "../auth";
import type {
  GoogleAccount,
} from "../schema";
import type { FileFields, GooglePluginConfig, ThreadFields } from "../types";
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleThreadLabel,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account implements GraphQLResolver<GoogleAccount> {
  public readonly fileCache: ItemCache<string, File>;
  public readonly threadCache: ItemCache<string, Thread>;

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

    this.threadCache = new ItemCache(async (id: string): Promise<Thread | null> => {
      let records = await this.context.table<GoogleThreadRecord>("Thread").where({
        accountId: this.id,
        threadId: id,
      }).select("*");

      if (records.length == 1) {
        return new Thread(this, records[0]);
      }

      return null;
    });

    this.watchTokens();
  }

  public async updateLabels(): Promise<void> {
    let api = gmail({
      version: "v1",
      auth: this.authClient,
    });

    try {
      let { data: { labels } } = await api.users.labels.list({
        userId: "me",
      });

      if (!labels) {
        return;
      }

      let labelIds = await this.context.table<GoogleLabelRecord>("Label")
        .where("accountId", this.id)
        .pluck("labelId");

      let newRecords: GoogleLabelRecord[] = [];
      let foundIds: string[] = [];

      for (let label of labels) {
        if (!label.id || !label.name || label.type !== "user") {
          continue;
        }

        foundIds.push(label.id);

        if (!labelIds.includes(label.id)) {
          newRecords.push({
            accountId: this.id,
            labelId: label.id,
            name: label.name,
          });
        } else {
          await this.context.table<GoogleLabelRecord>("Label")
            .where("labelId", label.id)
            .update({
              name: label.name,
            });
        }
      }

      await this.context.table<GoogleLabelRecord>("Label")
        .where("accountId", this.id)
        .whereNotIn("labelId", foundIds)
        .delete();

      await this.context.table<GoogleLabelRecord>("Label")
        .insert(newRecords);
    } catch (e) {
      console.warn(e);
    }
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

    let account = new Account(config, context, record, client);
    await account.updateLabels();
    return account;
  }

  public async getItemFromURL(url: URL, isTask: boolean): Promise<GoogleItem | null> {
    let item = await Thread.getItemFromURL(this, url, isTask);
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

export class Thread implements GoogleItem {
  public constructor(
    private readonly account: Account,
    private readonly record: GoogleThreadRecord,
  ) {
  }

  public get id(): string {
    return this.record.threadId;
  }

  public static async getItemFromURL(
    account: Account,
    url: URL,
    isTask: boolean,
  ): Promise<Thread | null> {
    console.log("getItemFromURL", url.toString());
    if (url.hostname != "mail.google.com" || url.hash.length == 0) {
      return null;
    }

    let mailId = url.hash.substring(1);
    let idPos = mailId.lastIndexOf("/");
    if (idPos >= 0) {
      mailId = mailId.substring(idPos + 1);
    }

    let decoded = decodeWebId(mailId);
    let pos = decoded.lastIndexOf(":");
    if (pos >= 0) {
      decoded = decoded.substring(pos + 1);
    }

    let threadId = BigInt(decoded).toString(16);
    let thread = await Thread.getAPIThread(account, threadId);
    if (!thread) {
      return null;
    }

    await account.updateLabels();

    let subject: string | null = null;
    let unread = false;
    let starred = false;
    let labels: Set<string> = new Set();

    for (let message of thread.messages ?? []) {
      for (let label of message.labelIds ?? []) {
        if (label.startsWith("Label_")) {
          labels.add(label);
        } else if (label == "UNREAD") {
          unread = true;
        } else if (label == "STARRED") {
          starred = true;
        }
      }

      if (!subject && message.payload?.headers) {
        for (let header of message.payload.headers) {
          if (header.name == "Subject" && header.value) {
            subject = header.value;
            break;
          }
        }
      }
    }

    if (!subject) {
      return null;
    }

    let item = await account.context.createItem(account.user, {
      summary: subject,
      archived: null,
      snoozed: null,
      done: undefined,
      controller: isTask ? TaskController.Manual : null,
    });

    let record: GoogleThreadRecord = {
      accountId: account.id,
      threadId,
      itemId: item.id,
      subject,
      unread,
      url: "",
      starred,
    };

    await account.context.table<GoogleThreadRecord>("Thread")
      .insert(record);

    let labelRecords = Array.from(labels, (label: string): GoogleThreadLabel => ({
      accountId: account.id,
      labelId: label,
      threadId: threadId,
    }));

    await account.context.table<GoogleThreadLabel>("ThreadLabel")
      .insert(labelRecords);

    return new Thread(account, record);
  }

  private static async getAPIThread(
    account: Account,
    threadId: string,
  ): Promise<gmail_v1.Schema$Thread | null> {
    let api = gmail({
      version: "v1",
      auth: account.authClient,
    });

    try {
      let { data: thread } = await api.users.threads.get({
        userId: "me",
        id: threadId,
      });

      return thread;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public async fields(): Promise<ThreadFields> {
    let context = this.account.context;

    let labels: string[] = await context.table<GoogleLabelRecord>("Label")
      .join(context.tableRef("ThreadLabel"), "Label.labelId", "ThreadLabel.labelId")
      .where("ThreadLabel.threadId", this.id)
      .pluck("Label.name");

    return {
      ...this.record,
      labels,
      type: "thread",
    };
  }

  public static async getForItem(
    config: GooglePluginConfig,
    context: PluginContext,
    itemId: string,
  ): Promise<Thread | null> {
    let records = await context.table<GoogleThreadRecord>("Thread").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(config, context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      return account.threadCache.upsertItem(
        records[0].threadId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        () => new Thread(account!, records[0]),
      );
    }

    return null;
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
