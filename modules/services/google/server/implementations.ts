import { URL } from "url";

import type { gmail_v1 } from "googleapis";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type {
  ItemStore,
  Listable,
  ResolverImpl,
  ServiceItem,
} from "#server/utils";
import { BaseAccount, BaseItem, BaseList } from "#server/utils";
import type { FileFields, ThreadFields } from "#services/google/schema";
import { assert } from "#utils";

import { GoogleService } from ".";
import type { GoogleAPIFile } from "./api";
import { encodeWebId, getAccountInfo, decodeWebId, GoogleApi } from "./api";
import type {
  GoogleAccountResolvers,
  GoogleMailSearchResolvers,
} from "./schema";
import type { GoogleTransaction } from "./stores";
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleMailSearchRecord,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account
  extends BaseAccount<GoogleTransaction>
  implements ResolverImpl<GoogleAccountResolvers>
{
  private client: GoogleApi | null;

  public constructor(
    tx: GoogleTransaction,
    private record: GoogleAccountRecord,
  ) {
    super(tx);
    this.client = null;
  }

  public async updateRecord(record: GoogleAccountRecord): Promise<void> {
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
      ...(await this.tx.stores.threads.list({ accountId: this.id })),
      ...(await this.tx.stores.files.list({ accountId: this.id })),
    ];
  }

  public override lists(): Promise<MailSearch[]> {
    return this.mailSearches();
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return this.tx.stores.mailSearches.list({ accountId: this.id });
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

    await this.tx.stores.accounts.updateOne(this.id, {
      avatar,
    });
  }

  public async updateLabels(): Promise<void> {
    let labels = await this.authClient.getLabels();

    let labelIds = await this.tx
      .knex<GoogleLabelRecord>(this.tx.tableRef("Label"))
      .where("accountId", this.id)
      .pluck("id");

    let newRecords: GoogleLabelRecord[] = [];
    let foundIds: string[] = [];

    for (let label of labels) {
      foundIds.push(label.id);

      if (!labelIds.includes(label.id)) {
        newRecords.push({
          accountId: this.id,
          id: label.id,
          name: label.name,
        });
      } else {
        await this.tx
          .knex<GoogleLabelRecord>(this.tx.tableRef("Label"))
          .where("id", label.id)
          .update({
            name: label.name,
          });
      }
    }

    await this.tx
      .knex<GoogleLabelRecord>(this.tx.tableRef("Label"))
      .where("accountId", this.id)
      .whereNotIn("id", foundIds)
      .delete();

    if (newRecords.length) {
      await this.tx
        .knex<GoogleLabelRecord>(this.tx.tableRef("Label"))
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
    tx: GoogleTransaction,
    userId: string,
    code: string,
  ): Promise<Account> {
    let client = GoogleApi.createAuthClient(tx.serviceUrl);
    let { tokens: credentials } = await client.getToken(code);

    let {
      access_token: accessToken,
      expiry_date: expiry,
      refresh_token: refreshToken,
    } = credentials;

    if (!accessToken) {
      console.error("Bad credentials", credentials);
      throw new Error(
        "Failed to authenticate correctly, missing access token.",
      );
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

    let existing = await tx.stores.accounts.first({
      userId: userId,
      email: tokenInfo.email,
    });

    if (!existing) {
      let record: Omit<GoogleAccountRecord, "id"> = {
        userId: userId,
        email: tokenInfo.email,
        avatar,
        accessToken,
        refreshToken: refreshToken ?? null,
        expiry: Math.floor(expiry / 1000),
      };

      let account = await tx.stores.accounts.insertOne(record);
      await account.updateLabels();

      return account;
    } else {
      if (refreshToken) {
        await tx.stores.accounts.updateOne(existing.id, {
          accessToken,
          refreshToken,
          expiry: Math.floor(expiry / 1000),
        });
      } else {
        await tx.stores.accounts.updateOne(existing.id, {
          accessToken,
          expiry: Math.floor(expiry / 1000),
        });
      }

      GoogleService.service.clearProblem(existing);

      return existing;
    }
  }
}

export class MailSearch
  extends BaseList<gmail_v1.Schema$Thread[], GoogleTransaction>
  implements ResolverImpl<GoogleMailSearchResolvers>
{
  public static getStore(tx: GoogleTransaction): Listable<MailSearch> {
    return tx.stores.mailSearches;
  }

  public constructor(
    tx: GoogleTransaction,
    private record: GoogleMailSearchRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: GoogleMailSearchRecord): Promise<void> {
    this.record = record;
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

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public override async url(): Promise<string> {
    let account = await this.account();

    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${this.query}`;
    return account.buildURL(url).toString();
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.mailSearches.deleteOne(this.id);
  }

  public async listItems(
    threadList?: gmail_v1.Schema$Thread[],
  ): Promise<Thread[]> {
    let account = await this.account();

    if (!threadList) {
      threadList = await account.authClient.listThreads(this.query);
    }

    let instances: Thread[] = [];

    for (let thread of threadList) {
      if (!thread.id) {
        continue;
      }

      let instance = await this.tx.stores.threads.first({
        accountId: this.record.accountId,
        threadId: thread.id,
      });

      if (instance) {
        await instance.update(thread);
      } else {
        instance = await Thread.create(
          account,
          thread,
          TaskController.ServiceList,
        );
      }

      instances.push(instance);
    }

    return instances;
  }

  public static async create(
    account: Account,
    record: Omit<GoogleMailSearchRecord, "id" | "accountId">,
  ): Promise<MailSearch> {
    let threads = await account.authClient.listThreads(record.query);

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      accountId: account.id,
    };

    let search = await account.tx.stores.mailSearches.insertOne(dbRecord, id);
    await search.update(threads);
    return search;
  }
}

export class Thread
  extends BaseItem<GoogleTransaction>
  implements ServiceItem<ThreadFields>
{
  public static getStore(tx: GoogleTransaction): ItemStore<Thread> {
    return tx.stores.threads;
  }

  public constructor(
    tx: GoogleTransaction,
    private record: GoogleThreadRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: GoogleThreadRecord): Promise<void> {
    this.record = record;
  }

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public get id(): string {
    return this.record.id;
  }

  public get threadId(): string {
    return this.record.threadId;
  }

  public override async url(): Promise<string> {
    let account = await this.account();

    let intId = BigInt(`0x${this.threadId}`);
    let encoded = encodeWebId(`f:${intId}`);
    let url = new URL(`https://mail.google.com/mail/#all/${encoded}`);
    return account.buildURL(url).toString();
  }

  public override async update(thread?: gmail_v1.Schema$Thread): Promise<void> {
    let account = await this.account();

    if (!thread) {
      thread = (await account.authClient.getThread(this.threadId)) ?? undefined;
      if (!thread) {
        return this.tx.deleteItem(this.id);
      }
    }

    let { record, labels } = Thread.recordFromThread(thread);

    await this.tx.stores.threads.updateOne(this.id, record);

    await this.tx.setItemTaskDone(this.id, !record.unread);

    await this.tx.stores.threadLabels.setItems(this.threadId, labels, {
      accountId: account.id,
    });
  }

  public static recordFromThread(data: gmail_v1.Schema$Thread): {
    record: Omit<GoogleThreadRecord, "id" | "accountId">;
    labels: string[];
  } {
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
    if (!record.unread && controller == TaskController.Service) {
      controller = TaskController.Manual;
    }

    let id = await account.tx.createItem(account.userId, {
      summary: record.subject,
      archived: null,
      snoozed: null,
      done: record.unread ? null : DateTime.now(),
      controller,
    });

    let thread = await account.tx.stores.threads.insertOne(
      {
        ...record,
        accountId: account.id,
      },
      id,
    );

    await account.tx.stores.threadLabels.setItems(thread.id, labels, {
      accountId: account.id,
    });

    return thread;
  }

  public static async createItemFromURL(
    tx: GoogleTransaction,
    userId: string,
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

    for (let account of await tx.stores.accounts.list({ userId: userId })) {
      let existing = await tx.stores.threads.first({
        accountId: account.id,
        threadId,
      });
      if (existing) {
        return existing;
      }

      let apiThread = await account.authClient.getThread(threadId);
      if (!apiThread) {
        continue;
      }

      await account.updateLabels();
      return Thread.create(
        account,
        apiThread,
        isTask ? TaskController.Service : null,
      );
    }

    return null;
  }

  public async fields(): Promise<ThreadFields> {
    let labels: string[] = await this.tx
      .knex<GoogleLabelRecord>(this.tx.tableRef("Label"))
      .join(this.tx.tableRef("ThreadLabel"), "Label.id", "ThreadLabel.labelId")
      .where("ThreadLabel.threadId", this.id)
      .pluck("Label.name");

    return {
      ...this.record,
      labels,
      url: await this.url(),
      type: "thread",
    };
  }
}

export class File
  extends BaseItem<GoogleTransaction>
  implements ServiceItem<FileFields>
{
  public static getStore(tx: GoogleTransaction): ItemStore<File> {
    return tx.stores.files;
  }

  public constructor(tx: GoogleTransaction, private record: GoogleFileRecord) {
    super(tx);
  }

  public async updateRecord(record: GoogleFileRecord): Promise<void> {
    this.record = record;
  }

  public account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public get id(): string {
    return this.record.id;
  }

  public override async url(): Promise<string | null> {
    return this.record.url;
  }

  public get fileId(): string {
    return this.record.fileId;
  }

  private static recordFromFile(
    file: GoogleAPIFile,
  ): Omit<GoogleFileRecord, "accountId" | "id" | "fileId"> {
    return {
      name: file.name,
      description: file.description ?? null,
      mimeType: file.mimeType,
      url: file.webViewLink ?? null,
    };
  }

  public override async update(file?: GoogleAPIFile): Promise<void> {
    let account = await this.account();

    if (!file) {
      file = (await account.authClient.getFile(this.fileId)) ?? undefined;

      if (!file) {
        return this.tx.deleteItem(this.id);
      }
    }

    let record = File.recordFromFile(file);
    await this.tx.stores.files.updateOne(this.id, record);
  }

  public static async create(
    account: Account,
    file: GoogleAPIFile,
    isTask: boolean,
  ): Promise<File> {
    let id = await account.tx.createItem(account.userId, {
      summary: file.name,
      archived: null,
      snoozed: null,
      done: undefined,
      controller: isTask ? TaskController.Manual : null,
    });

    let record = {
      fileId: file.id,
      ...File.recordFromFile(file),
      accountId: account.id,
    };

    return account.tx.stores.files.insertOne(record, id);
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.record,
      type: "file",
    };
  }

  public static async createItemFromURL(
    tx: GoogleTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<File | null> {
    let matches = DRIVE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let fileId = matches[1];

    for (let account of await tx.stores.accounts.list({ userId: userId })) {
      let existing = await tx.stores.files.first({
        accountId: account.id,
        fileId,
      });
      if (existing) {
        return existing;
      }

      let file = await account.authClient.getFile(matches[1]);
      if (file) {
        return File.create(
          account,
          {
            webViewLink: url.toString(),
            ...file,
          },
          isTask,
        );
      }
    }

    return null;
  }
}
