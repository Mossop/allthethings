import { URL } from "url";

import type {
  Conduit,
  Differential$Revision$Search$Constraints,
  Differential$Revision$Search$Params,
  Differential$Revision$Search$Result,
} from "conduit-api";
import conduit, { RevisionStatus, requestAll } from "conduit-api";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type { CreatePhabricatorAccountParams } from "#schema";
import type {
  ItemStore,
  Listable,
  ResolverImpl,
  ServiceItem,
} from "#server/utils";
import {
  bestIcon,
  loadPageInfo,
  BaseItem,
  BaseList,
  BaseAccount,
} from "#server/utils";
import type { RevisionFields } from "#services/phabricator/schema";
import { assert } from "#utils";

import type { PhabricatorAccountResolvers } from "./schema";
import type { PhabricatorTransaction } from "./stores";
import type {
  PhabricatorAccountRecord,
  PhabricatorQueryRecord,
  PhabricatorRevisionRecord,
} from "./types";

export class Account
  extends BaseAccount<PhabricatorTransaction>
  implements ResolverImpl<PhabricatorAccountResolvers>
{
  public constructor(
    tx: PhabricatorTransaction,
    private record: PhabricatorAccountRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: PhabricatorAccountRecord): Promise<void> {
    this.record = record;
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
    return this.record.icon ?? this.record.userIcon;
  }

  public get revisionIcon(): string | null {
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

  public async enabledQueries(): Promise<string[]> {
    let queries = await this.tx.stores.queries.list({
      accountId: this.id,
    });

    return queries.map((query: Query): string => query.queryId);
  }

  public async items(): Promise<Revision[]> {
    return this.tx.stores.revisions.list({
      accountId: this.id,
    });
  }

  public override async lists(): Promise<Query[]> {
    return this.tx.stores.queries.list({
      accountId: this.id,
    });
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.accounts.deleteOne(this.id);
  }

  public async update(): Promise<void> {
    let info = await loadPageInfo(new URL(this.url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    if (icon != this.icon) {
      await this.tx.stores.accounts.updateOne(this.id, {
        icon,
      });
    }
  }

  public static async create(
    tx: PhabricatorTransaction,
    userId: string,
    { url, apiKey, queries }: CreatePhabricatorAccountParams,
  ): Promise<Account> {
    let api = conduit(url, apiKey);
    let user = await api.user.whoami();

    let info = await loadPageInfo(new URL(url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    let record: Omit<PhabricatorAccountRecord, "id"> = {
      userId,
      url,
      apiKey,
      icon,
      userIcon: user.image,
      email: user.primaryEmail,
      phid: user.phid,
    };

    let account = await tx.stores.accounts.insertOne(record);
    await Query.ensureQueries(account, queries);
    return account;
  }
}

export interface QueryClass {
  new (tx: PhabricatorTransaction, record: PhabricatorQueryRecord): Query;

  readonly queryId: string;
  readonly description: string;
}

export abstract class Query extends BaseList<never, PhabricatorTransaction> {
  public static getStore(tx: PhabricatorTransaction): Listable<Query> {
    return tx.stores.queries;
  }

  public static queries: Record<string, QueryClass> = {};

  public static addQuery(query: QueryClass): void {
    Query.queries[query.queryId] = query;
  }

  public static buildQuery(
    tx: PhabricatorTransaction,
    record: PhabricatorQueryRecord,
  ): Query {
    let queryClass = Query.queries[record.queryId];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!queryClass) {
      throw new Error(`Unknown query ${record.id}`);
    }

    return new queryClass(tx, record);
  }

  public static async ensureQueries(
    account: Account,
    queryIds: readonly string[],
  ): Promise<void> {
    let queriesToCreate = new Set(queryIds);

    let existingQueries = await account.tx.stores.queries.list({
      accountId: account.id,
    });

    for (let query of existingQueries) {
      if (queriesToCreate.has(query.queryId)) {
        queriesToCreate.delete(query.queryId);
      } else {
        await query.delete();
      }
    }

    for (let queryId of queriesToCreate) {
      if (!(queryId in Query.queries)) {
        throw new Error(`Unknown query type: ${queryId}`);
      }

      let id = await account.tx.addList({
        name: "temp",
        url: null,
      });

      let query = await account.tx.stores.queries.insertOne(
        {
          queryId,
          accountId: account.id,
        },
        id,
      );

      await query.update();
    }
  }

  public constructor(
    tx: PhabricatorTransaction,
    protected record: PhabricatorQueryRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: PhabricatorQueryRecord): Promise<void> {
    this.record = record;
  }

  public async account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public get id(): string {
    return this.record.id;
  }

  public get queryId(): string {
    return this.record.queryId;
  }

  public get description(): string {
    return this.class.description;
  }

  public override async delete(): Promise<void> {
    await super.delete();
    await this.tx.stores.queries.deleteOne(this.id);
  }

  protected get class(): QueryClass {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.getPrototypeOf(this);
  }

  protected async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {};
  }

  protected filterRevision(
    _account: Account,
    _revision: Differential$Revision$Search$Result,
  ): boolean {
    return true;
  }

  protected async getParams(): Promise<Differential$Revision$Search$Params> {
    return {
      queryKey: "active",
      constraints: await this.getConstraints(),
      attachments: {
        reviewers: true,
        "reviewers-extra": true,
      },
    };
  }

  protected async listItems(): Promise<Revision[]> {
    let account = await this.account();

    let api = account.conduit;
    let revisions = await requestAll(
      api.differential.revision.search,
      await this.getParams(),
    );
    revisions = revisions.filter(
      (revision: Differential$Revision$Search$Result) =>
        this.filterRevision(account, revision),
    );

    let results: Revision[] = [];
    for (let revision of revisions) {
      let item = await this.tx.stores.revisions.first({
        revisionId: revision.id,
      });

      if (item) {
        await item.update(revision);
      } else {
        item = await Revision.create(
          account,
          revision,
          TaskController.ServiceList,
        );
      }

      results.push(item);
    }

    return results;
  }
}

enum ReviewState {
  Reviewed,
  Blocking,
  Reviewable,
}

abstract class ReviewQuery extends Query {
  protected getReviewState(
    account: Account,
    revision: Differential$Revision$Search$Result,
  ): ReviewState {
    let reviewers = revision.attachments.reviewers?.reviewers ?? [];

    let reviewer = reviewers.find(
      // eslint-disable-next-line @typescript-eslint/typedef
      (reviewer): boolean => reviewer.reviewerPHID == account.phid,
    );

    // Should never happen
    if (!reviewer) {
      console.warn(`Missing reviewer for revision ${revision.id}`);
      return ReviewState.Reviewed;
    }

    let extras =
      revision.attachments["reviewers-extra"]?.["reviewers-extra"] ?? [];

    let reviewerExta = extras.find(
      // eslint-disable-next-line @typescript-eslint/typedef
      (reviewer): boolean => reviewer.reviewerPHID == account.phid,
    );

    if (reviewer.status == "accepted" && !reviewerExta?.voidedPHID) {
      return ReviewState.Reviewed;
    }

    // If you're the only reviewer then you are essentially blocking.
    if (reviewer.isBlocking || reviewers.length == 1) {
      return ReviewState.Blocking;
    }

    return ReviewState.Reviewable;
  }

  protected override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = await this.account();
    return {
      reviewerPHIDs: [account.phid],
      statuses: [RevisionStatus.NeedsReview],
    };
  }
}

class MustReview extends ReviewQuery {
  public static queryId = "mustreview";
  public static description = "Revisions that must be reviewed.";

  public readonly name: string = "Must Review";

  protected override filterRevision(
    account: Account,
    revision: Differential$Revision$Search$Result,
  ): boolean {
    return this.getReviewState(account, revision) == ReviewState.Blocking;
  }
}

class CanReview extends ReviewQuery {
  public static queryId = "canreview";
  public static description = "Revisions that can be reviewed.";

  public readonly name: string = "Review";

  protected override filterRevision(
    account: Account,
    revision: Differential$Revision$Search$Result,
  ): boolean {
    return this.getReviewState(account, revision) == ReviewState.Reviewable;
  }
}

class Draft extends Query {
  public static queryId = "draft";
  public static description = "Draft revisions.";

  public readonly name = "Draft";

  protected override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = await this.account();
    return {
      authorPHIDs: [account.phid],
      statuses: [RevisionStatus.Draft],
    };
  }
}

class NeedsRevision extends Query {
  public static queryId = "needsrevision";
  public static description = "Revisions that need changes.";

  public readonly name = "Needs Changes";

  protected override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = await this.account();
    return {
      authorPHIDs: [account.phid],
      statuses: [RevisionStatus.NeedsRevision, RevisionStatus.ChangesPlanned],
    };
  }
}

class Waiting extends Query {
  public static queryId = "waiting";
  public static description = "Revisions waiting on reviewers.";

  public readonly name = "In Review";

  protected override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = await this.account();
    return {
      authorPHIDs: [account.phid],
      statuses: [RevisionStatus.NeedsReview],
    };
  }
}

class Accepted extends Query {
  public static queryId = "accepted";
  public static description = "Revisions that are ready to land.";

  public readonly name = "Accepted";

  protected override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = await this.account();
    return {
      authorPHIDs: [account.phid],
      statuses: [RevisionStatus.Accepted],
    };
  }
}

Query.addQuery(MustReview);
Query.addQuery(CanReview);
Query.addQuery(Draft);
Query.addQuery(NeedsRevision);
Query.addQuery(Waiting);
Query.addQuery(Accepted);

export class Revision
  extends BaseItem<PhabricatorTransaction>
  implements ServiceItem<RevisionFields>
{
  public static getStore(tx: PhabricatorTransaction): ItemStore<Revision> {
    return tx.stores.revisions;
  }

  public constructor(
    tx: PhabricatorTransaction,
    private record: PhabricatorRevisionRecord,
  ) {
    super(tx);
  }

  public async updateRecord(record: PhabricatorRevisionRecord): Promise<void> {
    this.record = record;
  }

  public async account(): Promise<Account> {
    return assert(this.tx.stores.accounts.get(this.record.accountId));
  }

  public get id(): string {
    return this.record.id;
  }

  public get title(): string {
    return this.record.title;
  }

  public override async url(): Promise<string> {
    return this.record.uri;
  }

  public async fields(): Promise<RevisionFields> {
    let account = await this.account();
    return {
      accountId: this.record.accountId,
      revisionId: this.record.revisionId,
      title: this.title,
      uri: await this.url(),
      status: this.record.status,
      icon: account.revisionIcon,
    };
  }

  public override async update(
    revision?: Differential$Revision$Search$Result,
  ): Promise<void> {
    let account = await this.account();

    if (!revision) {
      let revisions = await account.conduit.differential.revision.search({
        constraints: {
          ids: [this.record.revisionId],
        },
      });

      if (revisions.data.length < 1) {
        return this.tx.deleteItem(this.id);
      }

      [revision] = revisions.data;
    }

    await this.tx.setItemTaskDone(this.id, revision.fields.status.closed);

    await this.tx.stores.revisions.updateOne(this.id, {
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
    });
  }

  public static async createItemFromURL(
    tx: PhabricatorTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Revision | null> {
    let matches = /\/D(\d+)$/.exec(url.toString());
    if (!matches) {
      return null;
    }

    let id = parseInt(matches[1]);

    for (let account of await tx.stores.accounts.list({ userId })) {
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
        let [revision] = revisions.data;
        let controller = isTask ? TaskController.Service : null;
        if (isTask && revision.fields.status.closed) {
          controller = TaskController.Manual;
        }
        return Revision.create(account, revision, controller);
      }
    }

    return null;
  }

  public static async create(
    account: Account,
    revision: Differential$Revision$Search$Result,
    controller: TaskController | null,
  ): Promise<Revision> {
    let id = await account.tx.createItem(account.userId, {
      summary: revision.fields.title,
      archived: null,
      snoozed: null,
      done: revision.fields.status.closed ? DateTime.now() : null,
      controller,
    });

    let record = {
      accountId: account.id,
      revisionId: revision.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
    };

    return account.tx.stores.revisions.insertOne(record, id);
  }
}
