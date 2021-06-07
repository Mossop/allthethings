import type { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import type { gmail_v1 } from "@googleapis/gmail";
import type { Credentials, OAuth2Client } from "google-auth-library";

import type { GoogleAPIFile } from "../api";
import {
  listThreads,
  getAccountInfo,
  createAuthClient,
  decodeWebId,
  getFile,
  getLabels,
  getThread,
} from "../api";
import type { GoogleAccount, GoogleMailSearch } from "../schema";
import type { FileFields, ThreadFields } from "../types";
import { ItemsTable, OwnedItemsTable } from "./table";
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleMailSearchRecord,
  GoogleThreadLabelRecord,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account implements GraphQLResolver<GoogleAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  private client: OAuth2Client | null;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
  ) {
    this.client = null;
  }

  public get id(): string {
    return this.record.id;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get email(): string {
    return this.record.email;
  }

  public get avatar(): string | null {
    return this.record.avatar;
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return MailSearch.store.list(this.context, { ownerId: this.id });
  }

  public async update(): Promise<void> {
    return this.updateLabels();
  }

  public async updateLabels(): Promise<void> {
    let labels = await getLabels(this.authClient);

    let labelIds = await this.context.table<GoogleLabelRecord>("Label")
      .where("ownerId", this.id)
      .pluck("id");

    let newRecords: GoogleLabelRecord[] = [];
    let foundIds: string[] = [];

    for (let label of labels) {
      foundIds.push(label.id);

      if (!labelIds.includes(label.id)) {
        newRecords.push({
          ownerId: this.id,
          id: label.id,
          name: label.name,
        });
      } else {
        await this.context.table<GoogleLabelRecord>("Label")
          .where("id", label.id)
          .update({
            name: label.name,
          });
      }
    }

    await this.context.table<GoogleLabelRecord>("Label")
      .where("ownerId", this.id)
      .whereNotIn("id", foundIds)
      .delete();

    if (newRecords.length) {
      await this.context.table<GoogleLabelRecord>("Label")
        .insert(newRecords);
    }
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

        void Account.store.update(this.context, {
          id: this.id,
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

    this.client = createAuthClient(this.context.pluginUrl, this.record);
    this.watchTokens();
    return this.client;
  }

  public static async create(
    context: AuthedPluginContext,
    code: string,
  ): Promise<Account> {
    let client = createAuthClient(context.pluginUrl);
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

    let userInfo = await getAccountInfo(client);

    let avatar: string | null = null;
    let photos = userInfo.photos ?? [];
    for (let photo of photos) {
      if (photo.metadata?.primary && photo.url) {
        avatar = photo.url;
      }
    }

    let record: GoogleAccountRecord = {
      id: await context.id(),
      userId: context.userId,
      email: tokenInfo.email,
      avatar,
      accessToken,
      refreshToken,
      expiry: Math.floor(expiry / 1000),
    };

    let account = await Account.store.insert(context, record);
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
}

export class MailSearch implements GraphQLResolver<GoogleMailSearch> {
  public static readonly store = new OwnedItemsTable(Account.store, MailSearch, "MailSearch");

  public constructor(
    private readonly account: Account,
    private readonly record: GoogleMailSearchRecord,
  ) {
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get name(): string {
    return this.record.name;
  }

  public get query(): string {
    return this.record.query;
  }

  public get url(): string {
    return "";
  }

  public async update(threadList?: gmail_v1.Schema$Thread[]): Promise<void> {
    if (!threadList) {
      threadList = await listThreads(this.account.authClient, this.query);
    }

    let instances: Thread[] = [];

    for (let thread of threadList) {
      if (!thread.id) {
        return;
      }

      let instance = await Thread.store.get(this.account.context, thread.id);

      if (!instance) {
        instance = await Thread.create(this.account, thread, TaskController.PluginList);
      }

      instances.push(instance);
    }

    await this.account.context.updateList(this.id, {
      items: instances.map((thread: Thread): string => thread.itemId),
    });
  }

  public static async create(
    context: PluginContext,
    account: Account,
    record: Omit<GoogleMailSearchRecord, "id" | "ownerId">,
  ): Promise<MailSearch> {
    let threads = await listThreads(account.authClient, record.query);

    let id = await context.addList({
      name: record.name,
      url: "",
    });

    let dbRecord: GoogleMailSearchRecord = {
      ...record,
      id,
      ownerId: account.id,
    };

    let search = await MailSearch.store.insert(account, dbRecord);
    await search.update(threads);
    return search;
  }
}

interface GoogleItem {
  itemId: string;
}

export class Thread implements GoogleItem {
  public static readonly store = new OwnedItemsTable(Account.store, Thread, "Thread");

  public constructor(
    private readonly account: Account,
    private readonly record: GoogleThreadRecord,
  ) {
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  public static async create(
    account: Account,
    data: gmail_v1.Schema$Thread,
    controller: TaskController | null,
  ): Promise<Thread> {
    if (!data.id) {
      throw new Error("No ID.");
    }

    let subject: string | null = null;
    let unread = false;
    let starred = false;
    let labels: Set<string> = new Set();

    for (let message of data.messages ?? []) {
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
      throw new Error("Missing subject");
    }

    let item = await account.context.createItem(account.userId, {
      summary: subject,
      archived: null,
      snoozed: null,
      done: undefined,
      controller,
    });

    let record: GoogleThreadRecord = {
      ownerId: account.id,
      id: data.id,
      itemId: item.id,
      subject,
      unread,
      url: "",
      starred,
    };

    let thread = await Thread.store.insert(account, record);

    let labelRecords = Array.from(labels, (label: string): GoogleThreadLabelRecord => ({
      ownerId: account.id,
      labelId: label,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      threadId: data.id!,
    }));

    if (labelRecords.length) {
      await account.context.table<GoogleThreadLabelRecord>("ThreadLabel")
        .insert(labelRecords);
    }

    return thread;
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

    let existing = await Thread.store.get(account.context, threadId);
    if (existing) {
      return existing;
    }

    let apiThread = await getThread(account.authClient, threadId);
    if (!apiThread) {
      return null;
    }

    await account.updateLabels();
    return Thread.create(account, apiThread, isTask ? TaskController.Manual : null);
  }

  public async fields(): Promise<ThreadFields> {
    let context = this.account.context;

    let labels: string[] = await context.table<GoogleLabelRecord>("Label")
      .join(context.tableRef("ThreadLabel"), "Label.id", "ThreadLabel.labelId")
      .where("ThreadLabel.threadId", this.id)
      .pluck("Label.name");

    return {
      ...this.record,
      labels,
      type: "thread",
    };
  }
}

export class File implements GoogleItem {
  public static readonly store = new OwnedItemsTable(Account.store, File, "File");

  public constructor(private readonly account: Account, private readonly record: GoogleFileRecord) {
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get itemId(): string {
    return this.record.itemId;
  }

  private static recordFromFile(
    file: GoogleAPIFile,
  ): Omit<GoogleFileRecord, "ownerId" | "id" | "itemId"> {
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
    let item = await account.context.createItem(account.userId, {
      summary: file.name,
      archived: null,
      snoozed: null,
      done: undefined,
      controller: isTask ? TaskController.Manual : null,
    });

    let record: GoogleFileRecord = {
      ownerId: account.id,
      id: file.id,
      itemId: item.id,
      ...File.recordFromFile(file),
    };

    return File.store.insert(account, record);
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.record,
      type: "file",
    };
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

    let fileId = matches[1];
    let existing = await File.store.get(account.context, fileId);
    if (existing) {
      return existing;
    }

    let file = await getFile(account.authClient, matches[1]);
    if (!file) {
      return null;
    }

    return File.create(account, {
      webViewLink: url.toString(),
      ...file,
    }, isTask);
  }
}
