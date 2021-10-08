import { URL, URLSearchParams } from "url";

import type { Bug as BugzillaAPIBug, History } from "bugzilla";
import BugzillaAPI from "bugzilla";
import type { DateTime } from "luxon";

import { sql } from "../../../db";
import type { CoreItemParams, ServiceTransaction } from "../../../server/utils";
import {
  id,
  ItemUpdater,
  storeBuilder,
  BaseAccount,
  BaseList,
} from "../../../server/utils";
import type { DateTimeOffset } from "../../../utils";
import { decodeRelativeDateTime, map, offsetFromJson } from "../../../utils";
import { SearchType } from "../schema";
import type { BugFields } from "../schema";
import type {
  BugzillaAccountEntity,
  BugzillaBugEntity,
  BugzillaSearchEntity,
} from "./entities";

function isDone(status: string): boolean {
  switch (status) {
    case "RESOLVED":
    case "VERIFIED":
    case "CLOSED":
      return true;
    default:
      return false;
  }
}

export type BugzillaAccountParams = Omit<
  BugzillaAccountEntity,
  "id" | "userId" | "icon"
>;
export type BugzillaAccountState = Pick<
  BugzillaAccountEntity,
  "id" | "name" | "icon" | "url"
> & {
  searches: BugzillaSearchState[];
};

export class Account extends BaseAccount<BugzillaAccountEntity> {
  public static readonly store = storeBuilder(Account, "bugzilla.Account");

  private api: BugzillaAPI | null = null;

  public async items(): Promise<string[]> {
    return this.db.pluck<string>(
      sql`SELECT "id" FROM "bugzilla"."Bug" WHERE "accountId" = ${this.id}`,
    );
  }

  public override lists(): Promise<Search[]> {
    return this.searches();
  }

  public async searches(): Promise<Search[]> {
    return Search.store(this.tx).find({ accountId: this.id });
  }

  public async state(): Promise<BugzillaAccountState> {
    return {
      id: this.entity.id,
      name: this.entity.name,
      url: this.entity.url,
      icon: this.entity.icon,
      searches: await map(
        this.searches(),
        (search: Search): Promise<BugzillaSearchState> => search.state(),
      ),
    };
  }

  public normalizeQuery(
    query: string,
  ): Pick<BugzillaSearchEntity, "query" | "type"> {
    if (!query.startsWith("https://") && !query.startsWith("http://")) {
      return {
        query,
        type: SearchType.Quicksearch,
      };
    }

    let queryUrl = new URL(query);
    let ourUrl = new URL(this.entity.url);

    if (queryUrl.origin != ourUrl.origin) {
      throw new Error("Query is for a different bugzilla installation.");
    }

    if (!queryUrl.pathname.endsWith("/buglist.cgi")) {
      throw new Error("Query doesn't appear to be correct.");
    }

    let params = queryUrl.searchParams;

    params.delete("list_id");
    params.delete("known_name");
    params.delete("query_based_on");

    let entries = [...params.entries()];
    if (entries.length == 1 && entries[0][0] == "quicksearch") {
      return {
        query: entries[0][1],
        type: SearchType.Quicksearch,
      };
    }

    return {
      query: params.toString(),
      type: SearchType.Advanced,
    };
  }

  public static buildAPI(
    record: Pick<BugzillaAccountEntity, "url" | "username" | "password">,
  ): BugzillaAPI {
    if (!record.username) {
      return new BugzillaAPI(record.url);
    } else if (!record.password) {
      return new BugzillaAPI(record.url, record.username);
    } else {
      return new BugzillaAPI(record.url, record.username, record.password);
    }
  }

  public getAPI(): BugzillaAPI {
    if (!this.api) {
      this.api = Account.buildAPI(this.entity);
    }

    return this.api;
  }

  public async doneForStatus(bug: BugzillaAPIBug): Promise<DateTime | null> {
    if (!isDone(bug.status)) {
      return null;
    }

    // If it is done we need to find the last time the resolution was changed.
    let api = this.getAPI();
    let history = await this.tx.segment.inSegment(
      "History API Lookup",
      async () => api.bugHistory(bug.id),
    );

    // Work newest to oldest.
    history.reverse();

    // Find the first item where the status changed from a not done state.
    let change = history.find((history: History): boolean => {
      for (let change of history.changes) {
        if (change.field_name != "status") {
          continue;
        }

        if (!isDone(change.removed)) {
          return true;
        }
      }

      return false;
    });

    if (change) {
      return change.when;
    }

    return null;
  }

  public static async create(
    tx: ServiceTransaction,
    userId: string,
    args: BugzillaAccountParams & Pick<BugzillaAccountEntity, "icon">,
  ): Promise<Account> {
    let record: BugzillaAccountEntity = {
      id: await id(),
      userId,
      ...args,
    };

    return Account.store(tx).create(record);
  }
}

export type BugzillaSearchParams = Omit<
  BugzillaSearchEntity,
  "id" | "accountId" | "type"
>;
export type BugzillaSearchState = Omit<BugzillaSearchEntity, "accountId"> & {
  url: string;
};

export class Search extends BaseList<BugzillaSearchEntity, RemoteBug> {
  public static readonly store = storeBuilder(Search, "bugzilla.Search");

  public account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

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

  public static url(account: Account, query: string, type: SearchType): string {
    if (type == SearchType.Quicksearch) {
      let params = new URLSearchParams();
      params.set("quicksearch", query);
      query = params.toString();
    }

    let url = new URL("buglist.cgi", account.entity.url);
    url.search = query;

    return url.toString();
  }

  public override async url(): Promise<string> {
    let account = await this.account();
    return Search.url(account, this.entity.query, this.entity.type);
  }

  public async state(): Promise<BugzillaSearchState> {
    return {
      id: this.entity.id,
      name: this.entity.name,
      query: this.entity.query,
      type: this.entity.type,
      url: await this.url(),
      dueOffset: this.entity.dueOffset,
    };
  }

  public async listItems(): Promise<RemoteBug[]> {
    let account = await this.account();
    return map(
      Search.getBugRecords(account.tx, account.getAPI(), this.entity),
      (bug: BugzillaAPIBug): RemoteBug => ({
        accountId: this.entity.accountId,
        bug,
      }),
    );
  }

  public static async getBugRecords(
    tx: ServiceTransaction,
    api: BugzillaAPI,
    record: Pick<BugzillaSearchEntity, "type" | "query">,
  ): Promise<BugzillaAPIBug[]> {
    return tx.segment.inSegment("Bug API search", async () => {
      if (record.type == SearchType.Quicksearch) {
        return api.quicksearch(record.query);
      } else {
        return api.advancedSearch(record.query);
      }
    });
  }

  public static async create(
    account: Account,
    params: BugzillaSearchParams,
  ): Promise<Search> {
    let query = account.normalizeQuery(params.query);

    let bugs = await Search.getBugRecords(account.tx, account.getAPI(), query);

    let updater = new BugUpdater(account.tx);
    let id = await updater.addList({
      userId: account.entity.userId,
      name: params.name,
      url: Search.url(account, query.query, query.type),
      due: decodeRelativeDateTime(params.dueOffset),
      remotes: bugs.map(
        (bug: BugzillaAPIBug): RemoteBug => ({
          bug,
          accountId: account.id,
        }),
      ),
    });

    let search = await Search.store(account.tx).create({
      ...params,
      ...query,
      id,
      accountId: account.id,
    });

    return search;
  }
}

interface RemoteBug {
  accountId: string;
  bug: BugzillaAPIBug;
}

export class BugUpdater extends ItemUpdater<BugzillaBugEntity, RemoteBug> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "bugzilla.Bug", "accountId", "bugId");
  }

  private accounts: Map<string, Account> = new Map();

  public override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
    }
  }

  protected async entityForRemote({
    accountId,
    bug,
  }: RemoteBug): Promise<BugzillaBugEntity> {
    let account = this.accounts.get(accountId)!;

    let previous = this.previousEntity(
      this.entityKey({
        accountId,
        bugId: bug.id,
      }),
    );

    let done: DateTime | null = null;
    if (isDone(bug.status)) {
      done = previous?.done ?? (await account.doneForStatus(bug));
    }

    return {
      accountId,
      bugId: bug.id,
      done,
    };
  }

  protected paramsForRemote(
    { accountId, bug }: RemoteBug,
    entity: BugzillaBugEntity,
  ): CoreItemParams {
    let account = this.accounts.get(accountId)!;
    let baseUrl = new URL(account.entity.url);

    let fields: BugFields = {
      accountId: accountId,
      bugId: bug.id,
      summary: bug.summary,
      url: new URL(`show_bug.cgi?id=${bug.id}`, baseUrl).toString(),
      icon: account.entity.icon,
      status: bug.status,
      resolution: bug.resolution,
    };

    return {
      summary: bug.summary,
      fields,
      due: null,
      done: entity.done,
    };
  }

  protected async updateEntities(
    entities: BugzillaBugEntity[],
  ): Promise<RemoteBug[]> {
    let allBugs: RemoteBug[] = [];

    for (let account of this.accounts.values()) {
      let bugMap = new Map(
        entities
          .filter(
            (entity: BugzillaBugEntity): boolean =>
              entity.accountId == account.id,
          )
          .map((entity: BugzillaBugEntity): [number, BugzillaBugEntity] => [
            entity.bugId,
            entity,
          ]),
      );

      let api = account.getAPI();
      let bugs: BugzillaAPIBug[];
      try {
        bugs = await this.tx.segment.inSegment("Bug API Request", async () =>
          api.getBugs([...bugMap.keys()]),
        );
      } catch (e) {
        continue;
      }

      for (let bug of bugs) {
        allBugs.push({
          accountId: account.id,
          bug,
        });
      }
    }

    return allBugs;
  }

  protected async getLists(): Promise<Search[]> {
    return Search.store(this.tx).find();
  }

  public override async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteBug | null> {
    for (let account of this.accounts.values()) {
      if (account.entity.userId != userId) {
        continue;
      }

      let baseUrl = new URL("show_bug.cgi", account.entity.url);
      if (baseUrl.origin != url.origin || baseUrl.pathname != url.pathname) {
        return null;
      }

      let id = url.searchParams.get("id");
      if (!id) {
        return null;
      }

      let api = account.getAPI();
      let bugs: BugzillaAPIBug[];
      try {
        bugs = await this.tx.segment.inSegment("Bug API Request", async () =>
          api.getBugs([id!]),
        );
      } catch (e) {
        return null;
      }

      if (bugs.length) {
        return {
          accountId: account.id,
          bug: bugs[0],
        };
      }
    }

    return null;
  }
}
