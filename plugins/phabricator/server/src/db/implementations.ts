import { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { AuthedPluginContext, PluginContext } from "@allthethings/server";
import {
  bestIcon, loadPageInfo,
  BaseItem, OwnedItemsTable,
  BaseList,
  BaseAccount,
  ItemsTable,
} from "@allthethings/server";
import { classBuilder } from "@allthethings/server/dist/plugins/tables";
import type { GraphQLResolver } from "@allthethings/utils";
import type {
  Conduit,
  Differential$Revision$Search$Constraints,
  Differential$Revision$Search$Params,
  Differential$Revision$Search$Result,
} from "conduit-api";
import conduit, {
  RevisionStatus,

  requestAll,
} from "conduit-api";
import { DateTime } from "luxon";

import type { PhabricatorAccount, CreatePhabricatorAccountParams } from "../schema";
import type { RevisionFields } from "../types";
import type {
  PhabricatorAccountRecord,
  PhabricatorQueryRecord,
  PhabricatorRevisionRecord,
} from "./types";

export class Account extends BaseAccount implements GraphQLResolver<PhabricatorAccount> {
  public static readonly store = new ItemsTable(classBuilder(Account), "Account");

  public constructor(
    context: PluginContext,
    private record: PhabricatorAccountRecord,
  ) {
    super(context);
  }

  public async onRecordUpdate(record: PhabricatorAccountRecord): Promise<void> {
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
    let queries = await Query.store.list(this.context, {
      ownerId: this.id,
    });

    return queries.map((query: Query): string => query.queryId);
  }

  public async items(): Promise<Revision[]> {
    return Revision.store.list(this.context, {
      ownerId: this.id,
    });
  }

  public async lists(): Promise<Query[]> {
    return Query.store.list(this.context, {
      ownerId: this.id,
    });
  }

  public async delete(): Promise<void> {
    await super.delete();
    await Account.store.delete(this.context, this.id);
  }

  public static async create(
    context: PluginContext,
    userId: string,
    { url, apiKey, queries }: CreatePhabricatorAccountParams,
  ): Promise<Account> {
    let api = conduit(url, apiKey);
    let user = await api.user.whoami();

    let info = await loadPageInfo(new URL(url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    let record: PhabricatorAccountRecord = {
      id: await context.id(),
      userId,
      url,
      apiKey,
      icon,
      userIcon: user.image,
      email: user.primaryEmail,
      phid: user.phid,
    };

    let account = await Account.store.insert(context, record);
    await Query.ensureQueries(account, queries);
    return account;
  }
}

interface QueryClass {
  new (account: Account, record: PhabricatorQueryRecord): Query;

  readonly queryId: string;
  readonly description: string;
}

export abstract class Query extends BaseList<never> {
  public static store = new OwnedItemsTable(
    Account.store,
    (owner: Account, record: PhabricatorQueryRecord): Query => {
      let cls = Query.queries[record.queryId];
      return new cls(owner, record);
    },
    "Query",
  );

  public static queries: Record<string, QueryClass> = {};

  public static addQuery(query: QueryClass): void {
    Query.queries[query.queryId] = query;
  }

  public static async ensureQueries(account: Account, queryIds: readonly string[]): Promise<void> {
    let queriesToCreate = new Set(queryIds);

    let existingQueries = await Query.store.list(account.context, {
      ownerId: account.id,
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

      let id = await account.context.addList({
        name: "temp",
        url: null,
      });

      let query = await Query.store.insert(account.context, {
        id,
        queryId,
        ownerId: account.id,
      });

      await query.update();
    }
  }

  public constructor(
    protected readonly account: Account,
    protected record: PhabricatorQueryRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: PhabricatorQueryRecord): Promise<void> {
    this.record = record;
  }

  public get owner(): Account {
    return this.account;
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

  public async delete(): Promise<void> {
    await super.delete();
    await Query.store.delete(this.context, this.id);
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
      queryKey: "active",
      constraints: this.getConstraints(),
      attachments: {
        "reviewers": true,
        "reviewers-extra": true,
      },
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

enum ReviewState {
  Reviewed,
  Blocking,
  Reviewable,
}

abstract class ReviewQuery extends Query {
  protected getReviewState(revision: Differential$Revision$Search$Result): ReviewState {
    let reviewers = revision.attachments.reviewers?.reviewers ?? [];

    let reviewer = reviewers.find(
      // eslint-disable-next-line @typescript-eslint/typedef
      (reviewer): boolean => reviewer.reviewerPHID == this.account.phid,
    );

    // Should never happen
    if (!reviewer) {
      console.warn(`Missing reviewer for revision ${revision.id}`);
      return ReviewState.Reviewed;
    }

    let extras = revision.attachments["reviewers-extra"]?.["reviewers-extra"] ?? [];

    let reviewerExta = extras.find(
      // eslint-disable-next-line @typescript-eslint/typedef
      (reviewer): boolean => reviewer.reviewerPHID == this.account.phid,
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

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {
      reviewerPHIDs: [this.account.phid],
    };
  }
}

class MustReview extends ReviewQuery {
  public static queryId = "mustreview";
  public static description = "Revisions that must be reviewed.";

  public readonly name: string = "Must Review";

  protected filterRevision(revision: Differential$Revision$Search$Result): boolean {
    return this.getReviewState(revision) == ReviewState.Blocking;
  }
}

class CanReview extends ReviewQuery {
  public static queryId = "canreview";
  public static description = "Revisions that can be reviewed.";

  public readonly name: string = "Review";

  protected filterRevision(revision: Differential$Revision$Search$Result): boolean {
    return this.getReviewState(revision) == ReviewState.Reviewable;
  }
}

class Draft extends Query {
  public static queryId = "draft";
  public static description = "Draft revisions.";

  public readonly name = "Draft";

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.Draft],
    };
  }
}

class NeedsRevision extends Query {
  public static queryId = "needsrevision";
  public static description = "Revisions that need changes.";

  public readonly name = "Needs Changes";

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.NeedsRevision, RevisionStatus.ChangesPlanned],
    };
  }
}

class Waiting extends Query {
  public static queryId = "waiting";
  public static description = "Revisions waiting on reviewers.";

  public readonly name = "In Review";

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.NeedsReview],
    };
  }
}

class Accepted extends Query {
  public static queryId = "accepted";
  public static description = "Revisions that are ready to land.";

  public readonly name = "Accepted";

  protected getConstraints(): Differential$Revision$Search$Constraints {
    return {
      authorPHIDs: [this.account.phid],
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

export class Revision extends BaseItem {
  public static readonly store = new OwnedItemsTable(
    Account.store,
    classBuilder(Revision),
    "Revision",
  );

  public constructor(
    private readonly account: Account,
    private record: PhabricatorRevisionRecord,
  ) {
    super(account.context);
  }

  public async onRecordUpdate(record: PhabricatorRevisionRecord): Promise<void> {
    this.record = record;
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
      status: this.record.status,
      icon: this.account.revisionIcon,
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
        return this.context.deleteItem(this.id);
      }

      [revision] = revisions.data;
    }

    await this.context.setItemTaskDone(this.id, revision.fields.status.closed);

    await Revision.store.update(this.context, {
      id: this.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
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
        let [revision] = revisions.data;
        let controller = isTask ? TaskController.Plugin : null;
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
      status: revision.fields.status.value,
    };

    return Revision.store.insert(account.context, record);
  }
}
