import { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import {
  BaseItem, OwnedItemsTable,
  BaseList,
  BaseAccount,
  ItemsTable,
} from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import type {
  Conduit,
  Differential$Revision$Search$Constraints,
  Differential$Revision$Search$Params,
  Differential$Revision$Search$Result,
} from "conduit-api";
import conduit, {
  requestAll,
} from "conduit-api";
import { DateTime } from "luxon";

import type { PhabricatorAccount, PhabricatorAccountParams } from "../schema";
import type { RevisionFields } from "../types";
import type { PhabricatorAccountRecord, PhabricatorRevisionRecord } from "./types";

export class Account extends BaseAccount implements GraphQLResolver<PhabricatorAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  public constructor(
    context: PluginContext,
    private readonly record: PhabricatorAccountRecord,
  ) {
    super(context);
  }

  public get conduit(): Conduit {
    return conduit(this.url, this.apiKey);
  }

  public get id(): string {
    return this.record.id;
  }

  public get phid(): string {
    return this.record.phid;
  }

  public get icon(): string {
    return this.record.icon;
  }

  public get url(): string {
    return this.record.url;
  }

  public get userId(): string {
    return this.record.userId;
  }

  public get email(): string {
    return this.record.email;
  }

  public get apiKey(): string {
    return this.record.apiKey;
  }

  public get enabledQueries(): string[] {
    return [];
  }

  public async items(): Promise<[]> {
    return [];
  }

  public async lists(): Promise<[]> {
    return [];
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
  }

  public static async create(
    context: PluginContext,
    userId: string,
    { url, apiKey }: PhabricatorAccountParams,
  ): Promise<Account> {
    let api = conduit(url, apiKey);
    let user = await api.user.whoami();

    let record: PhabricatorAccountRecord = {
      id: await context.id(),
      userId,
      url,
      apiKey,
      icon: user.image,
      email: user.primaryEmail,
      phid: user.phid,
    };

    return Account.store.insert(context, record);
  }
}

interface QueryClass {
  new (account: Account, id: string): Query;

  readonly queryId: string;
  readonly description: string;
}

export abstract class Query extends BaseList<never> {
  public static queries: Record<string, QueryClass> = {};

  public static addQuery(query: QueryClass): void {
    Query.queries[query.queryId] = query;
  }

  protected constructor(protected readonly account: Account) {
    super(account.context);
  }

  public get queryId(): string {
    return this.class.queryId;
  }

  public get description(): string {
    return this.class.description;
  }

  protected get class(): QueryClass {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.getPrototypeOf(this);
  }

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {};
  }

  protected filterRevision(_revision: Differential$Revision$Search$Result): boolean {
    return true;
  }

  protected getParams(): Differential$Revision$Search$Params {
    return {
      constraints: this.getConstraints(),
    };
  }

  protected async listItems(): Promise<Revision[]> {
    let api = this.account.conduit;
    let revisions = await requestAll(api.differential.revision.search, this.getParams());
    revisions = revisions.filter(
      (revision: Differential$Revision$Search$Result) => this.filterRevision(revision),
    );

    let results: Revision[] = [];
    for (let revision of revisions) {
      let item = await Revision.store.first(this.context, {
        revisionId: revision.id,
      });

      if (item) {
        await item.update(revision);
      } else {
        item = await Revision.create(this.account, revision, TaskController.PluginList);
      }

      results.push(item);
    }

    return results;
  }
}

class MustReview extends Query {
  public static queryId = "mustreview";
  public static description = "Revisions that must be reviewed.";

  public readonly name = "Must Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class CanReview extends Query {
  public static queryId = "canreview";
  public static description = "Revisions that can be reviewed.";

  public readonly name = "Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Draft extends Query {
  public static queryId = "draft";
  public static description = "Draft revisions.";

  public readonly name = "Draft";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class NeedsRevision extends Query {
  public static queryId = "needsrevision";
  public static description = "Revisions that need changes.";

  public readonly name = "Needs Changes";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Waiting extends Query {
  public static queryId = "waiting";
  public static description = "Revisions waiting on reviewers.";

  public readonly name = "In Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Accepted extends Query {
  public static queryId = "accepted";
  public static description = "Revisions that are ready to land.";

  public readonly name = "Accepted";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

Query.addQuery(MustReview);
Query.addQuery(CanReview);
Query.addQuery(Draft);
Query.addQuery(NeedsRevision);
Query.addQuery(Waiting);
Query.addQuery(Accepted);

export class Revision extends BaseItem {
  public static readonly store = new OwnedItemsTable(Account.store, Revision, "Revision");

  public constructor(
    private readonly account: Account,
    private record: PhabricatorRevisionRecord,
  ) {
    super(account.context);
  }

  public get owner(): Account {
    return this.account;
  }

  public get id(): string {
    return this.record.id;
  }

  public get title(): string {
    return this.record.title;
  }

  public get url(): string {
    return this.record.uri;
  }

  public fields(): RevisionFields {
    return {
      accountId: this.account.id,
      revisionId: this.record.revisionId,
      title: this.title,
      uri: this.url,
    };
  }

  public async update(revision?: Differential$Revision$Search$Result): Promise<void> {
    if (!revision) {
      let revisions = await this.account.conduit.differential.revision.search({
        constraints: {
          ids: [this.record.revisionId],
        },
      });

      if (revisions.data.length < 1) {
        // TODO actually delete the item.
        await this.delete();
        return;
      }

      [revision] = revisions.data;
    }

    // TODO update done state.
    await Revision.store.update(this.context, {
      id: this.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
    });
  }

  public static async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<Revision | null> {
    let matches = /\/D(\d+)$/.exec(url.toString());
    if (!matches) {
      return null;
    }

    let id = parseInt(matches[1]);

    for (let account of await Account.store.list(context, { userId: context.userId })) {
      let accountUrl = new URL(account.url);
      if (accountUrl.origin != url.origin) {
        continue;
      }

      let revisions = await account.conduit.differential.revision.search({
        constraints: {
          ids: [id],
        },
      });

      if (revisions.data.length == 1) {
        let controller = isTask ? TaskController.Plugin : null;
        if (isTask && revisions[0].fields.status.closed) {
          controller = TaskController.Manual;
        }
        return Revision.create(account, revisions[0], controller);
      }
    }

    return null;
  }

  public static async create(
    account: Account,
    revision: Differential$Revision$Search$Result,
    controller: TaskController | null,
  ): Promise<Revision> {
    let id = await account.context.createItem(account.userId, {
      summary: revision.fields.title,
      archived: null,
      snoozed: null,
      done: revision.fields.status.closed ? DateTime.now() : null,
      controller,
    });

    let record = {
      id,
      ownerId: account.id,
      revisionId: revision.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
    };

    return Revision.store.insert(account.context, record);
  }
}
