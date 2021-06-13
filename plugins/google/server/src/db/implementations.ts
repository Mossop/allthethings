import { URL } from "url";

import { TaskController } from "@allthethings/schema";
import {
  BaseAccount,
  BaseItem,
  BaseList,
  ItemsTable,
  OwnedItemsTable,
} from "@allthethings/server";
import type {
  AuthedPluginContext,
  PluginContext,
} from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import type { gmail_v1, Auth } from "googleapis";
import { DateTime } from "luxon";

import type { GoogleAPIFile } from "../api";
import {
  encodeWebId,
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
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleMailSearchRecord,
  GoogleThreadLabelRecord,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account extends BaseAccount implements GraphQLResolver<GoogleAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  private client: Auth.OAuth2Client | null;

  public constructor(
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
  ) {
    super(context);
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

  public async items(): Promise<BaseItem[]> {
    return [
      ...await Thread.store.list(this.context, { ownerId: this.id }),
      ...await File.store.list(this.context, { ownerId: this.id }),
    ];
  }

  public lists(): Promise<MailSearch[]> {
    return this.mailSearches();
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return MailSearch.store.list(this.context, { ownerId: this.id });
  }

  public buildURL(target: URL): URL {
    let url = new URL("https://accounts.google.com/AccountChooser");
    url.searchParams.set("Email", this.email);
    url.searchParams.set("continue", target.toString());
    return url;
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
      this.client.on("tokens", (credentials: Auth.Credentials): void => {
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

  public get authClient(): Auth.OAuth2Client {
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
}

export class MailSearch extends BaseList<gmail_v1.Schema$Thread[]>
  implements GraphQLResolver<GoogleMailSearch> {
  public static readonly store = new OwnedItemsTable(Account.store, MailSearch, "MailSearch");

  public constructor(
    private readonly account: Account,
    private readonly record: GoogleMailSearchRecord,
  ) {
    super(account.context);
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
    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${this.query}`;
    return this.account.buildURL(url).toString();
  }

  public async listItems(threadList?: gmail_v1.Schema$Thread[]): Promise<Thread[]> {
    if (!threadList) {
      threadList = await listThreads(this.account.authClient, this.query);
    }

    let instances: Thread[] = [];

    for (let thread of threadList) {
      if (!thread.id) {
        continue;
      }

      let instance = await Thread.store.first(this.account.context, {
        ownerId: this.account.id,
        threadId: thread.id,
      });

      if (instance) {
        await instance.update(thread);
      } else {
        instance = await Thread.create(this.account, thread, TaskController.PluginList);
      }

      instances.push(instance);
    }

    return instances;
  }

  public static async create(
    context: PluginContext,
    account: Account,
    record: Omit<GoogleMailSearchRecord, "id" | "ownerId">,
  ): Promise<MailSearch> {
    let threads = await listThreads(account.authClient, record.query);

    let id = await context.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      ownerId: account.id,
      id,
    };

    let search = await MailSearch.store.insert(account.context, dbRecord);
    await search.update(threads);
    return search;
  }
}

export class Thread extends BaseItem {
  public static readonly store = new OwnedItemsTable(Account.store, Thread, "Thread");

  public constructor(
    private readonly account: Account,
    private readonly record: GoogleThreadRecord,
  ) {
    super(account.context);
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get threadId(): string {
    return this.record.threadId;
  }

  public get url(): string {
    let intId = BigInt(`0x${this.threadId}`);
    let encoded = encodeWebId(`f:${intId}`);
    let url = new URL(`https://mail.google.com/mail/#all/${encoded}`);
    return this.account.buildURL(url).toString();
  }

  public async update(thread?: gmail_v1.Schema$Thread): Promise<void> {
    if (!thread) {
      thread = await getThread(this.account.authClient, this.threadId) ?? undefined;
      if (!thread) {
        return this.context.deleteItem(this.id);
      }
    }

    let { record, labels } = Thread.recordFromThread(thread);

    await Thread.store.update(this.context, {
      id: this.id,
      ...record,
    });

    await this.context.setItemTaskDone(this.id, !record.unread);

    await this.context.table<GoogleThreadLabelRecord>("ThreadLabel")
      .where("threadId", this.threadId)
      .whereNotIn("labelId", labels)
      .delete();

    let existingLabels = new Set(
      await this.context.table<GoogleThreadLabelRecord>("ThreadLabel")
        .where("threadId", this.threadId)
        .pluck("labelId"),
    );

    let newLabels = labels.filter((label: string): boolean => !existingLabels.has(label));

    let labelRecords = newLabels.map((label: string): GoogleThreadLabelRecord => ({
      ownerId: this.account.id,
      labelId: label,
      threadId: this.threadId,
    }));

    if (labelRecords.length) {
      await this.context.table<GoogleThreadLabelRecord>("ThreadLabel")
        .insert(labelRecords);
    }
  }

  public static recordFromThread(
    data: gmail_v1.Schema$Thread,
  ): { record: Omit<GoogleThreadRecord, "id" | "ownerId">, labels: string[] } {
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

    return {
      record: {
        threadId: data.id,
        subject,
        unread,
        starred,
      },
      labels: [...labels],
    };
  }

  public static async create(
    account: Account,
    data: gmail_v1.Schema$Thread,
    controller: TaskController | null,
  ): Promise<Thread> {
    let { record, labels } = Thread.recordFromThread(data);

    // Probably didn't want to create an already complete task.
    if (!record.unread && controller == TaskController.Plugin) {
      controller = TaskController.Manual;
    }

    let id = await account.context.createItem(account.userId, {
      summary: record.subject,
      archived: null,
      snoozed: null,
      done: record.unread ? null : DateTime.now(),
      controller,
    });

    let thread = await Thread.store.insert(account.context, {
      ...record,
      id,
      ownerId: account.id,
    });

    let labelRecords = Array.from(labels, (label: string): GoogleThreadLabelRecord => ({
      ownerId: account.id,
      labelId: label,
      threadId: record.threadId,
    }));

    if (labelRecords.length) {
      await account.context.table<GoogleThreadLabelRecord>("ThreadLabel")
        .insert(labelRecords);
    }

    return thread;
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<Thread | null> {
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

    for (let account of await Account.store.list(context, { userId: context.userId })) {
      let existing = await Thread.store.first(account.context, { ownerId: account.id, threadId });
      if (existing) {
        return existing;
      }

      let apiThread = await getThread(account.authClient, threadId);
      if (!apiThread) {
        continue;
      }

      await account.updateLabels();
      return Thread.create(account, apiThread, isTask ? TaskController.Plugin : null);
    }

    return null;
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
      url: this.url,
      type: "thread",
    };
  }
}

export class File extends BaseItem {
  public static readonly store = new OwnedItemsTable(Account.store, File, "File");

  public constructor(private readonly account: Account, private readonly record: GoogleFileRecord) {
    super(account.context);
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get url(): string | null {
    return this.record.url;
  }

  public get fileId(): string {
    return this.record.fileId;
  }

  private static recordFromFile(
    file: GoogleAPIFile,
  ): Omit<GoogleFileRecord, "ownerId" | "id" | "fileId"> {
    return {
      name: file.name,
      description: file.description ?? null,
      mimeType: file.mimeType,
      url: file.webViewLink ?? null,
    };
  }

  public async update(file?: GoogleAPIFile): Promise<void> {
    if (!file) {
      file = await getFile(this.account.authClient, this.fileId) ?? undefined;

      if (!file) {
        return this.context.deleteItem(this.id);
      }
    }

    let record = File.recordFromFile(file);
    await File.store.update(this.context, {
      id: this.id,
      ...record,
    });
  }

  public static async create(
    account: Account,
    file: GoogleAPIFile,
    isTask: boolean,
  ): Promise<File> {
    let id = await account.context.createItem(account.userId, {
      summary: file.name,
      archived: null,
      snoozed: null,
      done: undefined,
      controller: isTask ? TaskController.Manual : null,
    });

    let record = {
      id,
      fileId: file.id,
      ...File.recordFromFile(file),
      ownerId: account.id,
    };

    return File.store.insert(account.context, record);
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.record,
      type: "file",
    };
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<File | null> {
    let matches = DRIVE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let fileId = matches[1];

    for (let account of await Account.store.list(context, { userId: context.userId })) {
      let existing = await File.store.first(context, { ownerId: account.id, fileId });
      if (existing) {
        return existing;
      }

      let file = await getFile(account.authClient, matches[1]);
      if (file) {
        return File.create(account, {
          webViewLink: url.toString(),
          ...file,
        }, isTask);
      }
    }

    return null;
  }
}
