import { URL } from "url";

import type { gmail_v1 } from "googleapis";
import { DateTime } from "luxon";

import { In, Not, sql } from "#db";
import { TaskController } from "#schema";
import type {
  ResolverImpl,
  ServiceItem,
  ServiceTransaction,
} from "#server/utils";
import {
  EntityImpl,
  id,
  IdentifiedEntityImpl,
  ref,
  storeBuilder,
  BaseAccount,
  BaseItem,
  BaseList,
} from "#server/utils";
import type { FileFields, ThreadFields } from "#services/google/schema";
import type { DateTimeOffset } from "#utils";
import { offsetFromJson } from "#utils";

import { GoogleService } from ".";
import type { GoogleAPIFile, GoogleAPILabel } from "./api";
import { encodeWebId, getAccountInfo, decodeWebId, GoogleApi } from "./api";
import type {
  GoogleAccountEntity,
  GoogleFileEntity,
  GoogleLabelEntity,
  GoogleMailSearchEntity,
  GoogleThreadEntity,
  GoogleThreadLabelEntity,
} from "./entities";
import type {
  GoogleAccountResolvers,
  GoogleMailSearchResolvers,
} from "./schema";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export class Account
  extends BaseAccount<GoogleAccountEntity>
  implements ResolverImpl<GoogleAccountResolvers>
{
  public static readonly store = storeBuilder(Account, "google.Account");

  private client: GoogleApi | null = null;

  public get userId(): string {
    return this.entity.userId;
  }

  public get email(): string {
    return this.entity.email;
  }

  public get avatar(): string | null {
    return this.entity.avatar;
  }

  public get loginUrl(): string {
    return this.authClient.generateAuthUrl();
  }

  public async items(): Promise<(Thread | File)[]> {
    return [
      ...(await Thread.store(this.tx).find({ accountId: this.id })),
      ...(await File.store(this.tx).find({ accountId: this.id })),
    ];
  }

  public override lists(): Promise<MailSearch[]> {
    return this.mailSearches();
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return MailSearch.store(this.tx).find({ accountId: this.id });
  }

  public buildURL(target: URL): URL {
    let url = new URL("https://accounts.google.com/AccountChooser");
    url.searchParams.set("Email", this.email);
    url.searchParams.set("continue", target.toString());
    return url;
  }

  public async updateAccount(): Promise<void> {
    await this.updateLabels();

    let userInfo = await this.authClient.getAccountInfo();

    let avatar: string | null = null;
    let photos = userInfo.photos ?? [];
    for (let photo of photos) {
      if (photo.metadata?.primary && photo.url) {
        avatar = photo.url;
      }
    }

    await this.update({
      avatar,
    });
  }

  public async updateLabels(): Promise<void> {
    let labels = await this.authClient.getLabels();

    await Label.store(this.tx).upsert(
      labels.map((label: GoogleAPILabel) => ({
        accountId: this.id,
        id: label.id,
        name: label.name,
      })),
    );

    await Label.store(this.tx).delete({
      accountId: this.id,
      id: Not(In(labels.map((label: GoogleAPILabel): string => label.id))),
    });
  }

  public get authClient(): GoogleApi {
    if (this.client) {
      return this.client;
    }

    this.client = new GoogleApi(this, this.entity);
    return this.client;
  }

  public static async create(
    tx: ServiceTransaction,
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
      tx.segment.error("Bad credentials", { credentials });
      throw new Error(
        "Failed to authenticate correctly, missing access token.",
      );
    }

    if (!expiry) {
      tx.segment.error("Bad credentials", { credentials });
      throw new Error("Failed to authenticate correctly, missing expiry.");
    }

    client.setCredentials(credentials);

    let tokenInfo = await client.getTokenInfo(accessToken);
    if (!tokenInfo.email) {
      tx.segment.error("Bad token info", { tokenInfo });
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

    let existing = await Account.store(tx).findOne({
      userId: userId,
      email: tokenInfo.email,
    });

    if (!existing) {
      let record: GoogleAccountEntity = {
        id: await id(),
        userId: userId,
        email: tokenInfo.email,
        avatar,
        accessToken,
        refreshToken: refreshToken ?? null,
        expiry: Math.floor(expiry / 1000),
      };

      let account = await Account.store(tx).create(record);
      await account.updateLabels();

      return account;
    } else {
      if (refreshToken) {
        await existing.update({
          accessToken,
          refreshToken,
          expiry: Math.floor(expiry / 1000),
        });
      } else {
        await existing.update({
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
  extends BaseList<GoogleMailSearchEntity, gmail_v1.Schema$Thread[]>
  implements ResolverImpl<GoogleMailSearchResolvers>
{
  public static readonly store = storeBuilder(MailSearch, "google.MailSearch");

  public get name(): string {
    return this.entity.name;
  }

  public get query(): string {
    return this.entity.query;
  }

  public override get dueOffset(): DateTimeOffset | null {
    return this.entity.dueOffset
      ? offsetFromJson(JSON.parse(this.entity.dueOffset))
      : null;
  }

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public override async url(): Promise<string> {
    let account = await this.account();

    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${this.query}`;
    return account.buildURL(url).toString();
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

      let instance = await Thread.store(this.tx).findOne({
        accountId: this.entity.accountId,
        threadId: thread.id,
      });

      if (instance) {
        await instance.updateItem(thread);
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
    record: Omit<GoogleMailSearchEntity, "id" | "accountId">,
  ): Promise<MailSearch> {
    let threads = await account.authClient.listThreads(record.query);

    let id = await account.tx.addList({
      name: record.name,
      url: null,
    });

    let dbRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    let search = await MailSearch.store(account.tx).create(dbRecord);
    await search.updateList(threads);
    return search;
  }
}

export class Thread
  extends BaseItem<GoogleThreadEntity>
  implements ServiceItem<ThreadFields>
{
  public static readonly store = storeBuilder(Thread, "google.Thread");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get threadId(): string {
    return this.entity.threadId;
  }

  public override async url(): Promise<string> {
    let account = await this.account();

    let intId = BigInt(`0x${this.threadId}`);
    let encoded = encodeWebId(`f:${intId}`);
    let url = new URL(`https://mail.google.com/mail/#all/${encoded}`);
    return account.buildURL(url).toString();
  }

  public override async updateItem(
    thread?: gmail_v1.Schema$Thread,
  ): Promise<void> {
    let account = await this.account();

    if (!thread) {
      thread = (await account.authClient.getThread(this.threadId)) ?? undefined;
      if (!thread) {
        return this.tx.deleteItem(this.id);
      }
    }

    let { record, labels } = await Thread.recordFromThread(this.tx, thread);

    await this.update(record);

    await this.tx.setItemTaskDone(this.id, !record.unread);

    await ThreadLabel.setThreadLabels(this, labels);
  }

  public static async recordFromThread(
    tx: ServiceTransaction,
    data: gmail_v1.Schema$Thread,
  ): Promise<{
    record: Omit<GoogleThreadEntity, "id" | "accountId">;
    labels: Label[];
  }> {
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
      labels: await Label.store(tx).find({
        id: In([...labels]),
      }),
    };
  }

  public static async create(
    account: Account,
    data: gmail_v1.Schema$Thread,
    controller: TaskController | null,
  ): Promise<Thread> {
    let { record, labels } = await Thread.recordFromThread(account.tx, data);

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

    let thread = await Thread.store(account.tx).create({
      ...record,
      id,
      accountId: account.id,
    });

    await ThreadLabel.setThreadLabels(thread, labels);

    return thread;
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
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

    for (let account of await Account.store(tx).find({ userId: userId })) {
      let existing = await Thread.store(tx).findOne({
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
    let labels = await ThreadLabel.threadLabels(this);

    return {
      ...this.entity,
      labels: labels.map((label: Label): string => label.name),
      url: await this.url(),
      type: "thread",
    };
  }
}

export class File
  extends BaseItem<GoogleFileEntity>
  implements ServiceItem<FileFields>
{
  public static readonly store = storeBuilder(File, "google.File");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public override async url(): Promise<string | null> {
    return this.entity.url;
  }

  public get fileId(): string {
    return this.entity.fileId;
  }

  private static recordFromFile(
    file: GoogleAPIFile,
  ): Omit<GoogleFileEntity, "accountId" | "id" | "fileId"> {
    return {
      name: file.name,
      description: file.description ?? null,
      mimeType: file.mimeType,
      url: file.webViewLink ?? null,
    };
  }

  public override async updateItem(file?: GoogleAPIFile): Promise<void> {
    let account = await this.account();

    if (!file) {
      file = (await account.authClient.getFile(this.fileId)) ?? undefined;

      if (!file) {
        return this.tx.deleteItem(this.id);
      }
    }

    let record = File.recordFromFile(file);
    await this.update(record);
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
      id,
      accountId: account.id,
    };

    return File.store(account.tx).create(record);
  }

  public async fields(): Promise<FileFields> {
    return {
      ...this.entity,
      type: "file",
    };
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<File | null> {
    let matches = DRIVE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    let fileId = matches[1];

    for (let account of await Account.store(tx).find({ userId: userId })) {
      let existing = await File.store(tx).findOne({
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

class Label extends IdentifiedEntityImpl<GoogleLabelEntity> {
  public static readonly store = storeBuilder(Label, "google.Label", [
    "accountId",
    "id",
  ]);

  public get name(): string {
    return this.entity.name;
  }
}

class ThreadLabel extends EntityImpl<GoogleThreadLabelEntity> {
  public static readonly store = storeBuilder(
    ThreadLabel,
    "google.ThreadLabel",
    ["threadId", "labelId"],
  );

  public static async threadLabels(thread: Thread): Promise<Label[]> {
    return Label.store(thread.tx).list(sql`
      SELECT "Label".*
      FROM ${ref(Label)} AS "Label"
        JOIN ${ref(
          ThreadLabel,
        )} AS "ThreadLabel" ON "ThreadLabel"."labelId" = "Label"."id"
        WHERE "ThreadLabel"."threadId" = ${thread.id}
    `);
  }

  public static async setThreadLabels(
    thread: Thread,
    labels: Label[],
  ): Promise<void> {
    let store = ThreadLabel.store(thread.tx);
    await store.delete({
      threadId: thread.id,
      labelId: Not(In(labels.map((label: Label): string => label.id))),
    });

    await store.upsert(
      labels.map((label: Label) => ({
        accountId: thread.entity.accountId,
        threadId: thread.id,
        labelId: label.id,
      })),
    );
  }
}
