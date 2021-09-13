import type Koa from "koa";
import koaMount from "koa-mount";
import { JsonDecoder } from "ts.data.json";

import { BaseService } from "#server/utils";
import type {
  Problem,
  ServiceWebMiddleware,
  Server,
  ServiceWebContext,
  ServiceDbMigration,
  ServiceExport,
  ServiceTransaction,
} from "#server/utils";

import { Account, File, MailSearch, Thread } from "./implementations";
import buildMigrations from "./migrations";
import Resolvers from "./resolvers";
import type { GoogleTransaction } from "./stores";
import { buildTransaction } from "./stores";
import type { GoogleServiceConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

export class GoogleService extends BaseService<GoogleTransaction> {
  public readonly webMiddleware: ServiceWebMiddleware<GoogleTransaction>;

  private static _service: GoogleService | null = null;

  protected readonly listProviders = [MailSearch];

  protected readonly itemProviders = [File, Thread];

  public static get config(): GoogleServiceConfig {
    return GoogleService.service.config;
  }

  public static get service(): GoogleService {
    if (!GoogleService._service) {
      throw new Error("Not yet initialized.");
    }

    return GoogleService._service;
  }

  protected readonly problems: Map<string, string>;

  public setProblem(account: Account, problem: string): void {
    this.problems.set(account.id, problem);
  }

  public clearProblem(account: Account): void {
    this.problems.delete(account.id);
  }

  public constructor(
    private readonly server: Server<GoogleTransaction>,
    private readonly config: GoogleServiceConfig,
  ) {
    super();

    GoogleService._service = this;
    this.problems = new Map();

    let oauthMiddleware: ServiceWebMiddleware<GoogleTransaction> = async (
      ctx: ServiceWebContext<GoogleTransaction>,
      next: Koa.Next,
    ): Promise<any> => {
      let code = first(ctx.query.code);
      let userId = first(ctx.query.state);

      if (!code || userId != ctx.userId) {
        ctx.transaction.segment.error("Bad oauth", { code, userId });
        return next();
      }

      ctx.set("Cache-Control", "no-cache");

      let account = await Account.create(ctx.transaction, ctx.userId, code);
      ctx.redirect(ctx.transaction.settingsPageUrl(account.id).toString());
    };

    this.webMiddleware = koaMount("/oauth", oauthMiddleware);

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      await this.server.withTransaction("update", (tx: GoogleTransaction) =>
        this.update(tx),
      );

      return UPDATE_DELAY;
    }, INITIAL_DELAY);
  }

  public override async update(tx: GoogleTransaction): Promise<void> {
    let accounts = await tx.stores.accounts.list();
    for (let account of accounts) {
      try {
        await account.update();
      } catch (e) {
        // Ignore account failure.
      }
    }
    await super.update(tx);
  }

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): GoogleTransaction {
    return buildTransaction(tx);
  }

  public async listProblems(
    tx: GoogleTransaction,
    userId: string | null,
  ): Promise<Problem[]> {
    if (!userId) {
      return [];
    }

    let accounts = await tx.stores.accounts.list({
      userId,
    });

    let problems: Problem[] = [];
    for (let account of accounts) {
      let problem = this.problems.get(account.id);
      if (problem) {
        problems.push({
          url: tx.settingsPageUrl(account.id).toString(),
          description: `Issue with Google account ${account.email}: ${problem}`,
        });
      }
    }

    return problems;
  }
}

const serviceExport: ServiceExport<GoogleServiceConfig, GoogleTransaction> = {
  id: "google",

  get dbMigrations(): ServiceDbMigration[] {
    return buildMigrations();
  },

  configDecoder: JsonDecoder.object<GoogleServiceConfig>(
    {
      clientId: JsonDecoder.string,
      clientSecret: JsonDecoder.string,
    },
    "Google Service Config",
  ),

  init: (server: Server<GoogleTransaction>, config: GoogleServiceConfig) =>
    new GoogleService(server, config),
};

export default serviceExport;
