import type { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import { relatedCache } from "@allthethings/utils";
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
import type {
  GoogleAccountRecord,
  GoogleFileRecord,
  GoogleLabelRecord,
  GoogleMailSearchRecord,
  GoogleThreadLabelRecord,
  GoogleThreadRecord,
} from "./types";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

const accounts = relatedCache(
  async (context: PluginContext, id: string): Promise<Account | null> => {
    let records = await context.table<GoogleAccountRecord>("Account")
      .where("id", id)
      .select("*");

    if (records.length == 1) {
      return new Account(context, records[0]);
    }

    return null;
  },
);

const files = relatedCache(
  async (account: Account, id: string): Promise<File | null> => {
    let records = await account.context.table<GoogleFileRecord>("File")
      .where({
        accountId: account.id,
        fileId: id,
      })
      .select("*");

    if (records.length == 1) {
      return new File(account, records[0]);
    }

    return null;
  },
);

const threads = relatedCache(
  async (account: Account, id: string): Promise<Thread | null> => {
    let records = await account.context.table<GoogleThreadRecord>("Thread")
      .where({
        accountId: account.id,
        threadId: id,
      })
      .select("*");

    if (records.length == 1) {
      return new Thread(account, records[0]);
    }

    return null;
  },
);

const searches = relatedCache(
  async (account: Account, id: string): Promise<MailSearch | null> => {
    let records = await account.context.table<GoogleMailSearchRecord>("MailSearch")
      .where({
        accountId: account.id,
        id,
      })
      .select("*");

    if (records.length == 1) {
      return new MailSearch(account, records[0]);
    }

    return null;
  },
);

export class Account implements GraphQLResolver<GoogleAccount> {
  public constructor(
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
    private client?: OAuth2Client,
  ) {
    this.watchTokens();
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return MailSearch.list(this.context, this);
  }

  public async update(): Promise<void> {
    return this.updateLabels();
  }

  public async updateLabels(): Promise<void> {
    let labels = await getLabels(this.authClient);

    let labelIds = await this.context.table<GoogleLabelRecord>("Label")
      .where("accountId", this.id)
      .pluck("labelId");

    let newRecords: GoogleLabelRecord[] = [];
    let foundIds: string[] = [];

    for (let label of labels) {
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

    if (newRecords.length) {
      await this.context.table<GoogleLabelRecord>("Label")
        .insert(newRecords);
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

    this.client = createAuthClient(this.context.pluginUrl, this.record);
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
    context: PluginContext,
    userId?: string,
  ): Promise<Account[]> {
    let query = context.table<GoogleAccountRecord>("Account");
    if (userId) {
      query = query.where("user", userId);
    }

    let records = await query;

    return records.map((record: GoogleAccountRecord): Account => {
      return accounts(context).upsertItem(record.id, () => new Account(context, record));
    });
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
      user: context.userId,
      email: tokenInfo.email,
      avatar,
      accessToken,
      refreshToken,
      expiry: Math.floor(expiry / 1000),
    };

    await context.table<GoogleAccountRecord>("Account").insert(record);

    let account = new Account(context, record, client);
    await account.updateLabels();
    return accounts(context).addItem(account);
  }

  public async getItemFromURL(url: URL, isTask: boolean): Promise<GoogleItem | null> {
    let item = await Thread.getItemFromURL(this, url, isTask);
    if (item) {
      return item;
    }

    return File.getItemFromURL(this, url, isTask);
  }

  public static async get(
    context: PluginContext,
    id: string,
  ): Promise<Account | null> {
    return accounts(context).getItem(id);
  }
}

export class MailSearch implements GraphQLResolver<GoogleMailSearch> {
  public constructor(
    private readonly account: Account,
    private readonly record: GoogleMailSearchRecord,
  ) {
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

      let instance = await threads(this.account).getItem(thread.id);

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
    record: Omit<GoogleMailSearchRecord, "id" | "accountId">,
  ): Promise<MailSearch> {
    let threads = await listThreads(account.authClient, record.query);

    let id = await context.addList({
      name: record.name,
      url: "",
    });

    let dbRecord: GoogleMailSearchRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    await context.table<GoogleMailSearchRecord>("MailSearch").insert(dbRecord);
    let search = searches(account).upsertItem(id, () => new MailSearch(account, dbRecord));
    await search.update(threads);

    return search;
  }

  public static async list(context: PluginContext, account: Account): Promise<MailSearch[]> {
    let records = await context.table<GoogleMailSearchRecord>("MailSearch")
      .where("accountId", account.id);

    return records.map((record: GoogleMailSearchRecord): MailSearch => {
      return searches(account).upsertItem(record.id, () => new MailSearch(account, record));
    });
  }

  public static async get(context: PluginContext, id: string): Promise<MailSearch | null> {
    let record = await context.table<GoogleMailSearchRecord>("MailSearch")
      .where("id", id)
      .first();

    if (!record) {
      return null;
    }

    let account = await Account.get(context, record.accountId);
    if (!account) {
      throw new Error("Unexpected.");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return searches(account).upsertItem(id, () => new MailSearch(account!, record!));
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

    let item = await account.context.createItem(account.user, {
      summary: subject,
      archived: null,
      snoozed: null,
      done: undefined,
      controller,
    });

    let record: GoogleThreadRecord = {
      accountId: account.id,
      threadId: data.id,
      itemId: item.id,
      subject,
      unread,
      url: "",
      starred,
    };

    await account.context.table<GoogleThreadRecord>("Thread")
      .insert(record);

    let labelRecords = Array.from(labels, (label: string): GoogleThreadLabelRecord => ({
      accountId: account.id,
      labelId: label,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      threadId: data.id!,
    }));

    if (labelRecords.length) {
      await account.context.table<GoogleThreadLabelRecord>("ThreadLabel")
        .insert(labelRecords);
    }

    return threads(account).addItem(new Thread(account, record));
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

    let existing = await threads(account).getItem(threadId);
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
    context: PluginContext,
    itemId: string,
  ): Promise<Thread | null> {
    let records = await context.table<GoogleThreadRecord>("Thread").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      return threads(account).upsertItem(
        records[0].threadId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        () => new Thread(account!, records[0]),
      );
    }

    return null;
  }
}

export class File implements GoogleItem {
  public constructor(private readonly account: Account, private readonly record: GoogleFileRecord) {
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
    return files(account).addItem(instance);
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.record,
      type: "file",
    };
  }

  public static async getForItem(
    context: PluginContext,
    itemId: string,
  ): Promise<File | null> {
    let records = await context.table<GoogleFileRecord>("File").where({ itemId }).select("*");
    if (records.length == 1) {
      let account = await Account.get(context, records[0].accountId);

      if (!account) {
        throw new Error("Missing account");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return files(account).upsertItem(records[0].fileId, () => new File(account!, records[0]));
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

    let fileId = matches[1];
    let existing = await files(account).getItem(fileId);
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

  public get id(): string {
    return this.record.fileId;
  }

  public get itemId(): string {
    return this.record.itemId;
  }
}
