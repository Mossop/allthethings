import { URL } from "url";

import type { gmail_v1 } from "googleapis";
import { DateTime } from "luxon";

import type { FileFields, ThreadFields } from "#plugins/google/schema";
import { TaskController } from "#schema";
import {
  BaseAccount,
  BaseItem,
  BaseList,
  ItemsTable,
  OwnedItemsTable,
  classBuilder,
} from "#server-utils";
import type {
  AuthedPluginContext,
  PluginContext,
} from "#server-utils";

import { GooglePlugin } from "..";
import type { GoogleAPIFile } from "../api";
import {
  encodeWebId,
  getAccountInfo,
  decodeWebId,
  GoogleApi,
} from "../api";
import type { GoogleAccountResolvers, GoogleMailSearchResolvers } from "../schema";
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleMailSearchRecord,
  GoogleThreadLabelRecord,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account extends BaseAccount implements GoogleAccountResolvers {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  private client: GoogleApi | null;

  public constructor(
    public override readonly context: PluginContext,
    private record: GoogleAccountRecord,
  ) {
    super(context);
    this.client = null;
  }

  public async onRecordUpdate(record: GoogleAccountRecord): Promise<void> {
    this.record = record;
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

  public get loginUrl(): string {
    return this.authClient.generateAuthUrl();
  }

  public async items(): Promise<BaseItem[]> {
    return [
      ...await Thread.store.list(this.context, { ownerId: this.id }),
      ...await File.store.list(this.context, { ownerId: this.id }),
    ];
  }

  public override lists(): Promise<MailSearch[]> {
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
    await this.updateLabels();

    let userInfo = await this.authClient.getAccountInfo();

    let avatar: string | null = null;
    let photos = userInfo.photos ?? [];
    for (let photo of photos) {
      if (photo.metadata?.primary && photo.url) {
        avatar = photo.url;
      }
    }

    await Account.store.update(this.context, {
      id: this.id,
      avatar,
    });
  }

  public async updateLabels(): Promise<void> {
    let labels = await this.authClient.getLabels();

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

  public get authClient(): GoogleApi {
    if (this.client) {
      return this.client;
    }

    this.client = new GoogleApi(this, this.record);
    return this.client;
  }

  public static async create(
    context: AuthedPluginContext,
    code: string,
  ): Promise<Account> {
    let client = GoogleApi.createAuthClient(context.pluginUrl);
    let { tokens: credentials } = await client.getToken(code);

    let {
      access_token: accessToken,
      expiry_date: expiry,
      refresh_token: refreshToken,
    } = credentials;

    if (!accessToken) {
      console.error("Bad credentials", credentials);
      throw new Error("Failed to authenticate correctly, missing access token.");
    }

    if (!expiry) {
      console.error("Bad credentials", credentials);
      throw new Error("Failed to authenticate correctly, missing expiry.");
    }

    client.setCredentials(credentials);

    let tokenInfo = await client.getTokenInfo(accessToken);
    if (!tokenInfo.email) {
      console.error("Bad token info", tokenInfo);
      throw new Error("Failed to authenticate correctly, bad token info.");
    }

    let userInfo = await getAccountInfo(client);

    let avatar: string | null = null;
    let photos = userInfo.photos ?? [];
    for (let photo of photos) {
      if (photo.metadata?.primary && photo.url) {
        avatar = photo.url;
      }
    }

    let existing = await Account.store.first(context, {
      userId: context.userId,
      email: tokenInfo.email,
    });

    if (!existing) {
      let record: GoogleAccountRecord = {
        id: await context.id(),
        userId: context.userId,
        email: tokenInfo.email,
        avatar,
        accessToken,
        refreshToken: refreshToken ?? null,
        expiry: Math.floor(expiry / 1000),
      };

      let account = await Account.store.insert(context, record);
      await account.updateLabels();

      return account;
    } else {
      if (refreshToken) {
        await Account.store.update(context, {
          id: existing.id,
          accessToken,
          refreshToken,
          expiry: Math.floor(expiry / 1000),
        });
      } else {
        await Account.store.update(context, {
          id: existing.id,
          accessToken,
          expiry: Math.floor(expiry / 1000),
        });
      }

      GooglePlugin.plugin.clearProblem(existing);

      return existing;
    }
  }
}

export class MailSearch extends BaseList<gmail_v1.Schema$Thread[]>
  implements GoogleMailSearchResolvers {
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(MailSearch),
    "MailSearch",
  );

  public constructor(
    private readonly account: Account,
    private record: GoogleMailSearchRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: GoogleMailSearchRecord): Promise<void> {
    this.record = record;
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

  public override get url(): string {
    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${this.query}`;
    return this.account.buildURL(url).toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await MailSearch.store.delete(this.context, this.id);
  }

  public async listItems(threadList?: gmail_v1.Schema$Thread[]): Promise<Thread[]> {
    if (!threadList) {
      threadList = await this.account.authClient.listThreads(this.query);
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
    let threads = await account.authClient.listThreads(record.query);

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
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(Thread),
    "Thread",
  );

  public constructor(
    private readonly account: Account,
    private record: GoogleThreadRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: GoogleThreadRecord): Promise<void> {
    this.record = record;
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

  public override get url(): string {
    let intId = BigInt(`0x${this.threadId}`);
    let encoded = encodeWebId(`f:${intId}`);
    let url = new URL(`https://mail.google.com/mail/#all/${encoded}`);
    return this.account.buildURL(url).toString();
  }

  public override async update(thread?: gmail_v1.Schema$Thread): Promise<void> {
    if (!thread) {
      thread = await this.account.authClient.getThread(this.threadId) ?? undefined;
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

      let apiThread = await account.authClient.getThread(threadId);
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
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(File),
    "File",
  );

  public constructor(private readonly account: Account, private record: GoogleFileRecord) {
    super(account.context);
  }

  public async onRecordUpdate(record: GoogleFileRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public override get url(): string | null {
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

  public override async update(file?: GoogleAPIFile): Promise<void> {
    if (!file) {
      file = await this.account.authClient.getFile(this.fileId) ?? undefined;

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

      let file = await account.authClient.getFile(matches[1]);
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
