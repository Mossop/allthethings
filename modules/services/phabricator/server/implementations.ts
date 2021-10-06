import { URL } from "url";

import type {
  Conduit,
  Differential$Revision$Search$Constraints,
  Differential$Revision$Search$Params,
  Differential$Revision$Search$Result,
  Project$Search$Result,
} from "conduit-api";
import conduit, { RevisionStatus, requestAll } from "conduit-api";
import { DateTime } from "luxon";

import type { ServiceItem, ServiceTransaction } from "../../../server/utils";
import {
  TaskController,
  id,
  storeBuilder,
  storeImplBuilder,
  bestIcon,
  loadPageInfo,
  BaseItem,
  BaseList,
  BaseAccount,
} from "../../../server/utils";
import type { RevisionFields } from "../schema";
import type {
  PhabricatorAccountEntity,
  PhabricatorQueryEntity,
  PhabricatorRevisionEntity,
} from "./entities";

export type PhabricatorAccountParams = Pick<
  PhabricatorAccountEntity,
  "url" | "apiKey"
> & {
  queries: string[];
};

export type PhabricatorAccountState = Pick<
  PhabricatorAccountEntity,
  "id" | "email" | "url" | "apiKey"
> & {
  icon: string;
  enabledQueries: string[];
};

export class Account extends BaseAccount<PhabricatorAccountEntity> {
  public static readonly store = storeBuilder(Account, "phabricator.Account");

  private _projectPHIDs: string[] | null = null;

  public async getProjectPHIDs(): Promise<string[]> {
    return this.tx.segment.inSegment("Project API Request", async () => {
      if (this._projectPHIDs === null) {
        let projects = await requestAll(this.conduit.project.search, {
          constraints: {
            members: [this.phid],
          },
        });

        this._projectPHIDs = projects.map(
          (project: Project$Search$Result): string => project.phid,
        );
      }

      return this._projectPHIDs;
    });
  }

  public get conduit(): Conduit {
    return conduit(this.url, this.entity.apiKey);
  }

  public get phid(): string {
    return this.entity.phid;
  }

  public get icon(): string {
    return this.entity.icon ?? this.entity.userIcon;
  }

  public get revisionIcon(): string | null {
    return this.entity.icon;
  }

  public get url(): string {
    return this.entity.url;
  }

  public get userId(): string {
    return this.entity.userId;
  }

  public async enabledQueries(): Promise<string[]> {
    let queries = await Query.store(this.tx).find({
      accountId: this.id,
    });

    return queries.map((query: Query): string => query.queryId);
  }

  public async state(): Promise<PhabricatorAccountState> {
    return {
      id: this.id,
      email: this.entity.email,
      apiKey: this.entity.apiKey,
      icon: this.icon,
      url: this.entity.url,
      enabledQueries: await this.enabledQueries(),
    };
  }

  public async items(): Promise<Revision[]> {
    return Revision.store(this.tx).find({
      accountId: this.id,
    });
  }

  public override async lists(): Promise<Query[]> {
    return Query.store(this.tx).find({
      accountId: this.id,
    });
  }

  public async updateAccount(): Promise<void> {
    let info = await loadPageInfo(this.tx.segment, new URL(this.url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    if (icon != this.icon) {
      await super.update({
        icon,
      });
    }
  }

  public override async update({
    queries,
    ...params
  }: Partial<PhabricatorAccountParams>): Promise<void> {
    await super.update(params);
    if (queries !== undefined) {
      await Query.ensureQueries(this, queries);
    }
  }

  public static async create(
    tx: ServiceTransaction,
    userId: string,
    { url, apiKey, queries }: PhabricatorAccountParams,
  ): Promise<Account> {
    let api = conduit(url, apiKey);
    let user = await api.user.whoami();

    let info = await loadPageInfo(tx.segment, new URL(url));
    let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

    let record: PhabricatorAccountEntity = {
      id: await id(),
      userId,
      url,
      apiKey,
      icon,
      userIcon: user.image,
      email: user.primaryEmail,
      phid: user.phid,
    };

    let account = await Account.store(tx).create(record);
    await Query.ensureQueries(account, queries);
    return account;
  }
}

export interface QueryClass {
  new (tx: ServiceTransaction, record: PhabricatorQueryEntity): Query;

  readonly queryId: string;
  readonly queryName: string;
  readonly description: string;
}

export type PhabricatorQueryState = Pick<PhabricatorQueryEntity, "queryId"> & {
  name: string;
  description: string;
};

export abstract class Query extends BaseList<PhabricatorQueryEntity, never> {
  public static readonly store = storeImplBuilder(
    Query.buildQuery,
    "phabricator.Query",
  );

  public static queries: Record<string, QueryClass> = {};

  public static addQuery(query: QueryClass): void {
    Query.queries[query.queryId] = query;
  }

  public static buildQuery(
    tx: ServiceTransaction,
    record: PhabricatorQueryEntity,
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

    let existingQueries = await Query.store(account.tx).find({
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

      let query = await Query.store(account.tx).create({
        id,
        queryId,
        accountId: account.id,
      });

      await query.updateList();
    }
  }

  public async account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get queryId(): string {
    return this.entity.queryId;
  }

  public get name(): string {
    return this.class.name;
  }

  public get description(): string {
    return this.class.description;
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
    _projectPHIDs: string[],
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
    let revisions = await this.tx.segment.inSegment(
      "Query API Request",
      async () =>
        requestAll(api.differential.revision.search, await this.getParams()),
    );
    let projectPHIDs = await account.getProjectPHIDs();

    revisions = revisions.filter(
      (revision: Differential$Revision$Search$Result) =>
        this.filterRevision(account, projectPHIDs, revision),
    );

    let results: Revision[] = [];
    for (let revision of revisions) {
      let item = await Revision.store(this.tx).findOne({
        revisionId: revision.id,
      });

      if (item) {
        await item.updateItem(revision);
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

type ArrayType<T> = T extends (infer R)[] ? R : never;

abstract class ReviewQuery extends Query {
  protected getReviewState(
    account: Account,
    projectPHIDs: string[],
    revision: Differential$Revision$Search$Result,
  ): ReviewState {
    let reviewers = revision.attachments.reviewers?.reviewers ?? [];
    type Reviewer = ArrayType<typeof reviewers>;
    let reviewerMap = new Map<string, Reviewer>(
      reviewers.map((reviewer: Reviewer): [string, Reviewer] => [
        reviewer.reviewerPHID,
        reviewer,
      ]),
    );

    let extras =
      revision.attachments["reviewers-extra"]?.["reviewers-extra"] ?? [];

    for (let extra of extras) {
      if (extra.voidedPHID) {
        let reviewer = reviewerMap.get(extra.reviewerPHID);
        if (reviewer) {
          reviewer.status = reviewer.isBlocking ? "blocking" : "added";
        }
      }
    }

    let reviewer = reviewerMap.get(account.phid);
    if (reviewer) {
      if (reviewer.status == "accepted") {
        return ReviewState.Reviewed;
      }

      // If you're the only reviewer then you are essentially blocking.
      if (reviewer.isBlocking || reviewerMap.size == 1) {
        return ReviewState.Blocking;
      }

      return ReviewState.Reviewable;
    }

    // Must be a project review.
    for (let project of projectPHIDs) {
      let reviewer = reviewerMap.get(project);
      if (reviewer && reviewer.status != "accepted") {
        // This review is awaiting review from a project we are a member of.
        // We ignore blocking state for projects, many people could complete the review.
        return ReviewState.Reviewable;
      }
    }

    return ReviewState.Reviewed;
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
  public static queryName = "Must Review";

  protected override filterRevision(
    account: Account,
    projectPHIDs: string[],
    revision: Differential$Revision$Search$Result,
  ): boolean {
    return (
      this.getReviewState(account, projectPHIDs, revision) ==
      ReviewState.Blocking
    );
  }
}

class CanReview extends ReviewQuery {
  public static queryId = "canreview";
  public static description = "Revisions that can be reviewed.";
  public static queryName = "Review";

  protected override filterRevision(
    account: Account,
    projectPHIDs: string[],
    revision: Differential$Revision$Search$Result,
  ): boolean {
    return (
      this.getReviewState(account, projectPHIDs, revision) ==
      ReviewState.Reviewable
    );
  }
}

class Draft extends Query {
  public static queryId = "draft";
  public static description = "Draft revisions.";
  public static queryName = "Draft";

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
  public static queryName = "Needs Changes";

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
  public static queryName = "In Review";

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
  public static queryName = "Accepted";

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
  extends BaseItem<PhabricatorRevisionEntity>
  implements ServiceItem<RevisionFields>
{
  public static readonly store = storeBuilder(Revision, "phabricator.Revision");

  public async account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public get title(): string {
    return this.entity.title;
  }

  public override async url(): Promise<string> {
    return this.entity.uri;
  }

  public async fields(): Promise<RevisionFields> {
    let account = await this.account();
    return {
      accountId: this.entity.accountId,
      revisionId: this.entity.revisionId,
      title: this.title,
      uri: await this.url(),
      status: this.entity.status,
      icon: account.revisionIcon,
    };
  }

  public override async updateItem(
    revision?: Differential$Revision$Search$Result,
  ): Promise<void> {
    let account = await this.account();

    if (!revision) {
      let revisions = await account.tx.segment.inSegment(
        "Revision API Search",
        () =>
          account.conduit.differential.revision.search({
            constraints: {
              ids: [this.entity.revisionId],
            },
          }),
      );

      if (revisions.data.length < 1) {
        return this.tx.deleteItem(this.id);
      }

      [revision] = revisions.data;
    }

    await this.tx.setItemTaskDone(this.id, revision.fields.status.closed);

    await this.update({
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
    });
  }

  public static async createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<Revision | null> {
    let matches = /\/D(\d+)$/.exec(url.toString());
    if (!matches) {
      return null;
    }

    let id = parseInt(matches[1]);

    for (let account of await Account.store(tx).find({ userId })) {
      let accountUrl = new URL(account.url);
      if (accountUrl.origin != url.origin) {
        continue;
      }

      let revisions = await account.tx.segment.inSegment(
        "Revision API Search",
        () =>
          account.conduit.differential.revision.search({
            constraints: {
              ids: [id],
            },
          }),
      );

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
      id,
      accountId: account.id,
      revisionId: revision.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
    };

    return Revision.store(account.tx).create(record);
  }
}
