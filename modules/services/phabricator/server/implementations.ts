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

import { sql } from "../../../db";
import type {
  CoreItemParams,
  RemoteList,
  ServiceTransaction,
} from "../../../server/utils";
import {
  ItemUpdater,
  id,
  storeBuilder,
  bestIcon,
  loadPageInfo,
  BaseList,
  BaseAccount,
} from "../../../server/utils";
import { upsert } from "../../../utils";
import type { RevisionFields } from "../schema";
import type {
  PhabricatorAccountEntity,
  PhabricatorQueryEntity,
  PhabricatorRevisionEntity,
} from "./entities";

type ApiRevision = Differential$Revision$Search$Result;

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

  public async items(): Promise<string[]> {
    return this.tx.db.pluck<string>(
      sql`SEELCT "id" FROM "phabricator"."Revision" WHERE "accountId" = ${this.id}`,
    );
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
      await this.update({
        icon,
      });
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

export type PhabricatorQueryState = Pick<PhabricatorQueryEntity, "queryId"> & {
  name: string;
  description: string;
};

export interface QueryType {
  name: string;
  description: string;
  builder: new (account: Account) => QueryBuilder;
}

abstract class QueryBuilder {
  public constructor(protected readonly account: Account) {}

  public async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {};
  }

  public filterRevision(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    account: Account,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectPHIDs: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    revision: Differential$Revision$Search$Result,
  ): boolean {
    return true;
  }

  public async getParams(): Promise<Differential$Revision$Search$Params> {
    return {
      queryKey: "active",
      constraints: await this.getConstraints(),
      attachments: {
        reviewers: true,
        "reviewers-extra": true,
      },
    };
  }

  public async listItems(): Promise<RemoteRevision[]> {
    let api = this.account.conduit;
    let revisions = await this.account.tx.segment.inSegment(
      "Query API Request",
      async () =>
        requestAll(api.differential.revision.search, await this.getParams()),
    );
    let projectPHIDs = await this.account.getProjectPHIDs();

    revisions = revisions.filter(
      (revision: Differential$Revision$Search$Result) =>
        this.filterRevision(this.account, projectPHIDs, revision),
    );

    return revisions.map(
      (revision: ApiRevision): RemoteRevision => ({
        accountId: this.account.id,
        revision,
      }),
    );
  }
}

export class Query extends BaseList<PhabricatorQueryEntity, RemoteRevision> {
  public static readonly store = storeBuilder(Query, "phabricator.Query");

  public static queries: Record<string, QueryType> = {};

  public static addQuery(id: string, query: QueryType): void {
    Query.queries[id] = query;
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

      let builder = new Query.queries[queryId].builder(account);
      let updater = new RevisionUpdater(account.tx);

      let id = await updater.addList({
        userId: account.userId,
        name: Query.queries[queryId].name,
        url: null,
        due: null,
        remotes: await builder.listItems(),
      });

      await Query.store(account.tx).create({
        id,
        queryId,
        accountId: account.id,
      });
    }
  }

  public async userId(): Promise<string> {
    let account = await this.account();
    return account.userId;
  }

  public async account(): Promise<Account> {
    return Account.store(this.tx).get(this.entity.accountId);
  }

  public async builder(): Promise<QueryBuilder> {
    let account = await this.account();
    return new this.behaviour.builder(account);
  }

  public get queryId(): string {
    return this.entity.queryId;
  }

  public get name(): string {
    return this.behaviour.name;
  }

  public get description(): string {
    return this.behaviour.description;
  }

  protected get behaviour(): QueryType {
    return Query.queries[this.entity.queryId];
  }

  public async listItems(): Promise<RemoteRevision[]> {
    let builder = await this.builder();
    return builder.listItems();
  }
}

enum ReviewState {
  Reviewed,
  Blocking,
  Reviewable,
}

type ArrayType<T> = T extends (infer R)[] ? R : never;

abstract class ReviewQuery extends QueryBuilder {
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

  public override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    let account = this.account;
    return {
      reviewerPHIDs: [account.phid],
      statuses: [RevisionStatus.NeedsReview],
    };
  }
}

class MustReview extends ReviewQuery {
  public override filterRevision(
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
  public override filterRevision(
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

class Draft extends QueryBuilder {
  public override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.Draft],
    };
  }
}

class NeedsRevision extends QueryBuilder {
  public override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.NeedsRevision, RevisionStatus.ChangesPlanned],
    };
  }
}

class Waiting extends QueryBuilder {
  public override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.NeedsReview],
    };
  }
}

class Accepted extends QueryBuilder {
  public override async getConstraints(): Promise<Differential$Revision$Search$Constraints> {
    return {
      authorPHIDs: [this.account.phid],
      statuses: [RevisionStatus.Accepted],
    };
  }
}

Query.addQuery("mustreview", {
  name: "Must Review",
  description: "Revisions that must be reviewed.",
  builder: MustReview,
});
Query.addQuery("canreview", {
  name: "Review",
  description: "Revisions that can be reviewed.",
  builder: CanReview,
});
Query.addQuery("draft", {
  name: "Draft",
  description: "Draft revisions.",
  builder: Draft,
});
Query.addQuery("needsrevision", {
  name: "Needs Changes",
  description: "Revisions that need changes.",
  builder: NeedsRevision,
});
Query.addQuery("waiting", {
  name: "In Review",
  description: "Revisions waiting on reviewers.",
  builder: Waiting,
});
Query.addQuery("accepted", {
  name: "Accepted",
  description: "Revisions that are ready to land.",
  builder: Accepted,
});

interface RemoteRevision {
  accountId: string;
  revision: ApiRevision;
}

export class RevisionUpdater extends ItemUpdater<
  PhabricatorRevisionEntity,
  RemoteRevision
> {
  public constructor(tx: ServiceTransaction) {
    super(tx, "phabricator.Revision", "accountId", "revisionId");
  }

  private accounts: Map<string, Account> = new Map();

  protected override async init(): Promise<void> {
    for (let account of await Account.store(this.tx).find()) {
      this.accounts.set(account.id, account);
    }
  }

  protected async entityForRemote({
    accountId,
    revision,
  }: RemoteRevision): Promise<PhabricatorRevisionEntity> {
    let done: DateTime | null = null;
    if (revision.fields.status.closed) {
      let previous = this.previousEntity(
        this.entityKey({ accountId, revisionId: revision.id }),
      );

      done = previous?.done ?? DateTime.now();
    }

    return {
      accountId,
      revisionId: revision.id,
      done,
    };
  }

  protected paramsForRemote(
    { accountId, revision }: RemoteRevision,
    entity: PhabricatorRevisionEntity,
  ): CoreItemParams {
    let account = this.accounts.get(accountId)!;

    let fields: RevisionFields = {
      accountId,
      revisionId: revision.id,
      title: revision.fields.title,
      uri: revision.fields.uri,
      status: revision.fields.status.value,
      icon: account.revisionIcon,
    };

    return {
      summary: revision.fields.title,
      fields,
      due: null,
      done: entity.done,
    };
  }

  protected async updateEntities(
    entities: PhabricatorRevisionEntity[],
  ): Promise<RemoteRevision[]> {
    let accountIds = new Map<Account, number[]>();
    let results: RemoteRevision[] = [];

    for (let entity of entities) {
      let account = this.accounts.get(entity.accountId)!;
      let ids = upsert(accountIds, account, () => []);
      ids.push(entity.revisionId);
    }

    for (let [account, ids] of accountIds) {
      let { data: revisions } = await account.tx.segment.inSegment(
        "Revision API Search",
        () =>
          account.conduit.differential.revision.search({
            constraints: {
              ids,
            },
          }),
      );

      results.push(
        ...revisions.map(
          (revision: ApiRevision): RemoteRevision => ({
            accountId: account.id,
            revision,
          }),
        ),
      );
    }

    return results;
  }

  protected getLists(): Promise<RemoteList<RemoteRevision>[]> {
    return Query.store(this.tx).find();
  }

  protected async getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteRevision | null> {
    let matches = /\/D(\d+)$/.exec(url.toString());
    if (!matches) {
      return null;
    }

    let id = parseInt(matches[1]);

    for (let account of this.accounts.values()) {
      let accountUrl = new URL(account.url);
      if (accountUrl.origin != url.origin) {
        continue;
      }

      let { data: revisions } = await account.tx.segment.inSegment(
        "Revision API Search",
        () =>
          account.conduit.differential.revision.search({
            constraints: {
              ids: [id],
            },
          }),
      );

      if (revisions.length == 1) {
        return {
          accountId: account.id,
          revision: revisions[0],
        };
      }
    }

    return null;
  }
}
