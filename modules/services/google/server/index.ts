import type * as KoaRouter from "@koa/router";
import type Koa from "koa";
import { JsonDecoder } from "ts.data.json";

import { BaseService } from "../../../server/utils";
import type {
  Problem,
  Server,
  ServiceExport,
  ServiceTransaction,
  ServiceMiddlewareContext,
} from "../../../server/utils";
import { Account, FileUpdater, ThreadUpdater } from "./implementations";
import { RegisterRoutes } from "./routes";
import type { GoogleServiceConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

export class GoogleService extends BaseService {
  private static _service: GoogleService | null = null;

  protected readonly itemUpdaters = [FileUpdater, ThreadUpdater];

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
    server: Server,
    private readonly config: GoogleServiceConfig,
  ) {
    super(server);

    GoogleService._service = this;
    this.problems = new Map();
  }

  public addWebRoutes(router: KoaRouter): void {
    router.get(
      "/oauth",
      async (ctx: ServiceMiddlewareContext, next: Koa.Next) => {
        let code = first(ctx.query.code);
        let userId = first(ctx.query.state);

        if (!code || userId != ctx.userId) {
          ctx.segment.error("Bad oauth", { code, userId });
          return next();
        }

        ctx.set("Cache-Control", "no-cache");

        let tx = await ctx.startTransaction(true);
        let account = await Account.create(tx, ctx.userId, code);
        ctx.redirect(ctx.settingsPageUrl(account.id).toString());
      },
    );

    RegisterRoutes(router);
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
          description: `Issue with Google account ${account.email}: ${problem}`,
        });
      }
    }

    return problems;
  }
}

const serviceExport: ServiceExport<GoogleServiceConfig> = {
  id: "google",

  configDecoder: JsonDecoder.object<GoogleServiceConfig>(
    {
      clientId: JsonDecoder.string,
      clientSecret: JsonDecoder.string,
    },
    "Google Service Config",
  ),

  init: (server: Server, config: GoogleServiceConfig) =>
    new GoogleService(server, config),
};

export default serviceExport;
