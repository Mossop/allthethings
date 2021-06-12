import type { PluginContext, PluginItem } from "@allthethings/server";
import {
  BaseSearch,
  BaseAccount,
  ItemsTable,
} from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";
import type {
  Differential$Revision$Search$Constraints,
  Differential$Revision$Search$Params,
  Differential$Revision$Search$Result,
} from "conduit-api";
import conduit from "conduit-api";

import type { PhabricatorAccount, PhabricatorAccountParams } from "../schema";
import type { PhabricatorAccountRecord } from "./types";

export class Account extends BaseAccount implements GraphQLResolver<PhabricatorAccount> {
  public static readonly store = new ItemsTable(Account, "Account");

  public constructor(
    context: PluginContext,
    private readonly record: PhabricatorAccountRecord,
  ) {
    super(context);
  }

  public get id(): string {
    return this.record.id;
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
    };

    return Account.store.insert(context, record);
  }
}

interface QueryClass {
  new (account: Account, id: string): Query;

  readonly id: string;
  readonly description: string;
}

export abstract class Query extends BaseSearch<never> {
  public static queries: QueryClass[] = [];

  protected constructor(protected readonly account: Account) {
    super(account.context);
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

  protected async listItems(): Promise<PluginItem[]> {
    let api = conduit(this.account.url, this.account.apiKey);
    let revisions = await api.differential.revision.search(this.getParams());
    revisions = revisions.filter(
      (revision: Differential$Revision$Search$Result) => this.filterRevision(revision),
    );

    throw new Error("Method not implemented.");
  }
}

class MustReview extends Query {
  public static id = "mustreview";
  public static description = "Revisions that must be reviewed.";

  public readonly name = "Must Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class CanReview extends Query {
  public static id = "canreview";
  public static description = "Revisions that can be reviewed.";

  public readonly name = "Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Draft extends Query {
  public static id = "draft";
  public static description = "Draft revisions.";

  public readonly name = "Draft";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class NeedsRevision extends Query {
  public static id = "needsrevision";
  public static description = "Revisions that need changes.";

  public readonly name = "Needs Changes";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Waiting extends Query {
  public static id = "waiting";
  public static description = "Revisions waiting on reviewers.";

  public readonly name = "In Review";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

class Accepted extends Query {
  public static id = "accepted";
  public static description = "Revisions that are ready to land.";

  public readonly name = "Accepted";

  public constructor(account: Account, public readonly id: string) {
    super(account);
  }
}

Query.queries.push(
  MustReview,
  CanReview,
  Draft,
  NeedsRevision,
  Waiting,
  Accepted,
);
