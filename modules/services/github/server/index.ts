import type Koa from "koa";
import koaMount from "koa-mount";
import { JsonDecoder } from "ts.data.json";

import { BaseService } from "#server/utils";
import type {
  ServiceDbMigration,
  ServiceExport,
  Server,
  Problem,
  ServiceTransaction,
  ServiceWebMiddleware,
  ServiceWebContext,
} from "#server/utils";

import { Account, IssueLike, Search } from "./implementations";
import buildMigrations from "./migrations";
import Resolvers from "./resolvers";
import type { GithubTransaction } from "./stores";
import { buildTransaction } from "./stores";
import type { GithubServiceConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

export class GithubService extends BaseService<GithubTransaction> {
  public readonly webMiddleware: ServiceWebMiddleware<GithubTransaction>;

  private static _service: GithubService | null = null;

  protected readonly listProviders = [
    Search,
  ];

  protected readonly itemProviders = [
    IssueLike,
  ];

  public static get config(): GithubServiceConfig {
    return GithubService.service.config;
  }

  public static get service(): GithubService {
    if (!GithubService._service) {
      throw new Error("Not yet initialized.");
    }

    return GithubService._service;
  }

  protected readonly problems: Map<string, string>;

  public setProblem(account: Account, problem: string): void {
    this.problems.set(account.id, problem);
  }

  public clearProblem(account: Account): void {
    this.problems.delete(account.id);
  }

  public constructor(
    private readonly server: Server<GithubTransaction>,
    private readonly config: GithubServiceConfig,
  ) {
    super();

    GithubService._service = this;
    this.problems = new Map();

    let oauthMiddleware: ServiceWebMiddleware<GithubTransaction> = async (
      ctx: ServiceWebContext<GithubTransaction>,
      next: Koa.Next,
    ) => {
      let code = first(ctx.query.code);
      let userId = first(ctx.query.state);

      if (!code || userId != ctx.userId) {
        console.error("Bad oauth", code, userId);
        return next();
      }

      ctx.set("Cache-Control", "no-cache");

      let account = await Account.create(ctx.transaction, ctx.userId, code);
      try {
        ctx.transaction.settingsPageUrl(account.id);
      } catch (e) {
        console.error(e);
      }
      ctx.redirect(ctx.transaction.settingsPageUrl(account.id).toString());
    };

    this.webMiddleware = koaMount("/oauth", oauthMiddleware);

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withTransaction((tx: GithubTransaction) => this.update(tx));
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, INITIAL_DELAY);
  }

  public override async update(tx: GithubTransaction): Promise<void> {
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

  public buildTransaction(tx: ServiceTransaction): GithubTransaction {
    return buildTransaction(tx);
  }

  public async listProblems(tx: GithubTransaction, userId: string | null): Promise<Problem[]> {
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
          description: `Issue with Github account ${account.user}: ${problem}`,
        });
      }
    }

    return problems;
  }
}

const serviceExport: ServiceExport<GithubServiceConfig, GithubTransaction> = {
  id: "github",

  get dbMigrations(): ServiceDbMigration[] {
    return buildMigrations();
  },

  configDecoder: JsonDecoder.object<GithubServiceConfig>({
    clientId: JsonDecoder.string,
    clientSecret: JsonDecoder.string,
  }, "Github Service Config"),

  init: (
    server: Server<GithubTransaction>,
    config: GithubServiceConfig,
  ) => new GithubService(server, config),
};

export default serviceExport;
