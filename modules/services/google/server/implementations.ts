import { URL } from "url";

import { DateTime } from "luxon";

import { GoogleService } from ".";
import { In, Not, sql } from "../../../db";
import type {
  CoreItemParams,
  RemoteList,
  ServiceTransaction,
} from "../../../server/utils";
import {
  ItemUpdater,
  id,
  IdentifiedEntityImpl,
  storeBuilder,
  BaseAccount,
  BaseList,
} from "../../../server/utils";
import type { DateTimeOffset } from "../../../utils";
import {
  decodeRelativeDateTime,
  map,
  encodeRelativeDateTime,
  offsetFromJson,
} from "../../../utils";
import type { FileFields, ThreadFields } from "../schema";
import type { GoogleAPIFile, GoogleAPILabel, GoogleAPIThread } from "./api";
import { encodeWebId, getAccountInfo, decodeWebId, GoogleApi } from "./api";
import type {
  GoogleAccountEntity,
  GoogleFileEntity,
  GoogleLabelEntity,
  GoogleMailSearchEntity,
  GoogleThreadEntity,
} from "./entities";

const DRIVE_REGEX = /^https:\/\/[a-z]+.google.com\/[a-z]+\/d\/([^/]+)/;

export type GoogleAccountState = Omit<
  GoogleAccountEntity,
  "userId" | "accessToken" | "refreshToken" | "expiry"
> & {
  loginUrl: string;
  mailSearches: GoogleMailSearchState[];
};

export class Account extends BaseAccount<GoogleAccountEntity> {
  public static readonly store = storeBuilder(Account, "google.Account");

  private client: GoogleApi | null = null;

  public get userId(): string {
    return this.entity.userId;
  }

  public get email(): string {
    return this.entity.email;
  }

  public get loginUrl(): string {
    return this.authClient.generateAuthUrl();
  }

  public async state(): Promise<GoogleAccountState> {
    return {
      id: this.id,
      email: this.entity.email,
      avatar: this.entity.avatar,
      loginUrl: this.loginUrl,
      mailSearches: await map(
        this.mailSearches(),
        (search: MailSearch): Promise<GoogleMailSearchState> => search.state(),
      ),
    };
  }

  protected lists(): Promise<MailSearch[]> {
    return this.mailSearches();
  }

  protected async items(): Promise<string[]> {
    return [
      ...(await this.tx.db.pluck<string>(
        sql`SELECT "id" FROM "google"."File" WHERE "accountId" = ${this.id}`,
      )),
      ...(await this.tx.db.pluck<string>(
        sql`SELECT "id" FROM "google"."Thread" WHERE "accountId" = ${this.id}`,
      )),
    ];
  }

  public async mailSearches(): Promise<MailSearch[]> {
    return MailSearch.store(this.tx).find({ accountId: this.id });
  }

  public buildURL(target: URL): URL {
    let url = new URL("https://accounts.google.com/AccountChooser");
    url.searchParams.set("Email", this.entity.email);
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

export type GoogleMailSearchState = Omit<
  GoogleMailSearchEntity,
  "accountId"
> & {
  url: string;
};

export type GoogleMailSearchParams = Omit<
  GoogleMailSearchState,
  "id" | "url" | "accountId"
>;

export class MailSearch extends BaseList<GoogleMailSearchEntity, RemoteThread> {
  public static readonly store = storeBuilder(MailSearch, "google.MailSearch");

  public async userId(): Promise<string> {
    let account = await this.account();
    return account.entity.userId;
  }

  public get name(): string {
    return this.entity.name;
  }

  public override get dueOffset(): DateTimeOffset | null {
    return this.entity.dueOffset
      ? offsetFromJson(JSON.parse(this.entity.dueOffset))
      : null;
  }

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public async state(): Promise<GoogleMailSearchState> {
    return {
      id: this.id,
      url: await this.url(),
      name: this.name,
      query: this.entity.query,
      dueOffset: this.dueOffset ? encodeRelativeDateTime(this.dueOffset) : null,
    };
  }

  public override async url(): Promise<string> {
    let account = await this.account();

    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${this.entity.query}`;
    return account.buildURL(url).toString();
  }

  public async listItems(): Promise<RemoteThread[]> {
    let account = await this.account();
    let threadList = await account.authClient.listThreads(this.entity.query);

    let instances: RemoteThread[] = [];

    for (let thread of threadList) {
      if (!thread.id) {
        continue;
      }

      instances.push({
        accountId: this.entity.accountId,
        thread,
      });
    }

    return instances;
  }

  public static async create(
    account: Account,
    record: GoogleMailSearchParams,
  ): Promise<MailSearch> {
    let threads = await account.authClient.listThreads(record.query);
    let updater = new ThreadUpdater(account.tx);

    let url = new URL("https://mail.google.com/mail/");
    url.hash = `search/${record.query}`;

    let id = await updater.addList({
      userId: account.userId,
      name: record.name,
      url: account.buildURL(url).toString(),
      due: decodeRelativeDateTime(record.dueOffset),
      remotes: threads.map(
        (thread: GoogleAPIThread): RemoteThread => ({
          accountId: account.id,
          thread,
        }),
      ),
    });

    let dbRecord = {
      ...record,
      id,
      accountId: account.id,
    };

    return MailSearch.store(account.tx).create(dbRecord);
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

interface RemoteFile {
  accountId: string;
  file: GoogleAPIFile;
}

export class FileUpdater extends ItemUpdater<GoogleFileEntity, RemoteFile> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "google.File", "fileId");
  }

  private accounts: Map<string, Account> = new Map();

  protected override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
    }
  }

  protected async entityForRemote({
    accountId,
    file,
  }: RemoteFile): Promise<GoogleFileEntity> {
    return {
      accountId,
      fileId: file.id,
    };
  }

  protected paramsForRemote({ accountId, file }: RemoteFile): CoreItemParams {
    let fields: FileFields = {
      type: "file",
      accountId,
      name: file.name,
      description: file.description ?? null,
      mimeType: file.mimeType,
      url: file.webViewLink ?? null,
    };

    return {
      summary: file.name,
      fields,
      done: undefined,
      due: undefined,
    };
  }

  protected async updateEntities(
    entities: GoogleFileEntity[],
  ): Promise<RemoteFile[]> {
    let files: RemoteFile[] = [];

    for (let { accountId, fileId } of entities) {
      let account = this.accounts.get(accountId)!;
      let file = await account.authClient.getFile(fileId);
      if (file) {
        files.push({
          accountId,
          file,
        });
      }
    }

    return files;
  }

  protected async getLists(): Promise<RemoteList<RemoteFile>[]> {
    return [];
  }

  protected async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteFile | null> {
    let matches = DRIVE_REGEX.exec(url.toString());
    if (!matches) {
      return null;
    }

    for (let account of this.accounts.values()) {
      if (account.userId != userId) {
        continue;
      }

      let file = await account.authClient.getFile(matches[1]);
      if (file) {
        return {
          accountId: account.id,
          file,
        };
      }
    }

    return null;
  }
}

interface RemoteThread {
  accountId: string;
  thread: GoogleAPIThread;
}

export class ThreadUpdater extends ItemUpdater<
  GoogleThreadEntity,
  RemoteThread
> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "google.Thread", "threadId");
  }

  private accounts: Map<string, Account> = new Map();
  private labels: Map<string, Map<string, Label>> = new Map();

  protected override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
      this.labels.set(account.id, new Map());
    }

    for (let label of await Label.store(this.tx).find()) {
      let labelMap = this.labels.get(label.entity.accountId)!;
      labelMap.set(label.id, label);
    }
  }

  protected async entityForRemote({
    accountId,
    thread,
  }: RemoteThread): Promise<GoogleThreadEntity> {
    let isDone = (): boolean => {
      for (let message of thread.messages ?? []) {
        if (message.labelIds?.includes("UNREAD")) {
          return false;
        }
      }

      return true;
    };

    let previous = this.previousEntity(this.entityKey({ threadId: thread.id }));

    let done: DateTime | null = null;
    if (isDone()) {
      done = previous?.done ?? DateTime.now();
    }

    return {
      accountId,
      threadId: thread.id,
      done,
    };
  }

  protected paramsForRemote(
    { accountId, thread }: RemoteThread,
    entity: GoogleThreadEntity,
  ): CoreItemParams {
    let labelMap = this.labels.get(accountId)!;

    let subject: string | null = null;
    let unread = false;
    let starred = false;
    let labels: Set<string> = new Set();

    for (let message of thread.messages ?? []) {
      for (let label of message.labelIds ?? []) {
        if (labelMap.has(label)) {
          labels.add(labelMap.get(label)!.name);
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

    let account = this.accounts.get(accountId)!;

    let intId = BigInt(`0x${thread.id}`);
    let encoded = encodeWebId(`f:${intId}`);
    let url = new URL(`https://mail.google.com/mail/#all/${encoded}`);

    let fields: ThreadFields = {
      type: "thread",
      accountId,
      subject,
      unread,
      starred,
      url: account.buildURL(url).toString(),
      labels: [...labels],
    };

    return {
      summary: subject,
      fields,
      done: entity.done,
      due: undefined,
    };
  }

  protected async updateEntities(
    entities: GoogleThreadEntity[],
  ): Promise<RemoteThread[]> {
    let threads: RemoteThread[] = [];

    for (let { accountId, threadId } of entities) {
      let account = this.accounts.get(accountId)!;
      let thread = await account.authClient.getThread(threadId);
      if (thread) {
        threads.push({
          accountId,
          thread,
        });
      }
    }

    return threads;
  }

  protected getLists(): Promise<RemoteList<RemoteThread>[]> {
    return MailSearch.store(this.tx).find();
  }

  protected async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteThread | null> {
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

    for (let account of this.accounts.values()) {
      if (account.entity.userId != userId) {
        continue;
      }

      let thread = await account.authClient.getThread(threadId);
      if (thread) {
        return {
          accountId: account.id,
          thread,
        };
      }
    }

    return null;
  }
}
