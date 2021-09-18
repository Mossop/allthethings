import type Koa from "koa";
import koaMount from "koa-mount";
import { JsonDecoder } from "ts.data.json";

import { BaseService } from "#server/utils";
import type {
  ServiceExport,
  Server,
  Problem,
  ServiceTransaction,
  ServiceWebMiddleware,
  ServiceWebContext,
} from "#server/utils";

import { Account, IssueLike, Search } from "./implementations";
import Resolvers from "./resolvers";
import type { GithubServiceConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

export class GithubService extends BaseService {
  public readonly webMiddleware: ServiceWebMiddleware<ServiceTransaction>;

  private static _service: GithubService | null = null;

  protected readonly listProviders = [Search];

  protected readonly itemProviders = [IssueLike];

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
    private readonly server: Server,
    private readonly config: GithubServiceConfig,
  ) {
    super();

    GithubService._service = this;
    this.problems = new Map();

    let oauthMiddleware: ServiceWebMiddleware<ServiceTransaction> = async (
      ctx: ServiceWebContext,
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
      await this.server.withTransaction("update", (tx: ServiceTransaction) =>
        this.update(tx),
      );

      return UPDATE_DELAY;
    }, INITIAL_DELAY);
  }

  public override async update(tx: ServiceTransaction): Promise<void> {
    let accounts = await Account.store(tx).find();
    for (let account of accounts) {
      try {
        await account.updateAccount();
      } catch (e) {
        // Ignore account failure.
      }
    }
    await super.update(tx);
  }

  public get resolvers(): Record<string, unknown> {
    return Resolvers;
  }

  public buildTransaction(tx: ServiceTransaction): ServiceTransaction {
    return tx;
  }

  public async listProblems(
    tx: ServiceTransaction,
    userId: string | null,
  ): Promise<Problem[]> {
    if (!userId) {
      return [];
    }

    let accounts = await Account.store(tx).find({
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

const serviceExport: ServiceExport<GithubServiceConfig> = {
  id: "github",

  configDecoder: JsonDecoder.object<GithubServiceConfig>(
    {
      clientId: JsonDecoder.string,
      clientSecret: JsonDecoder.string,
    },
    "Github Service Config",
  ),

  init: (server: Server, config: GithubServiceConfig) =>
    new GithubService(server, config),
};

export default serviceExport;
