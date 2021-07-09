import type Koa from "koa";
import koaMount from "koa-mount";

import {
  BasePlugin,
} from "#server-utils";
import type {
  PluginDbMigration,
  ServerPlugin,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  PluginWebMiddleware,
  PluginWebContext,
  Problem,
} from "#server-utils";

import { Account, File, MailSearch, Thread } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";
import type { GooglePluginConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

export class GooglePlugin extends BasePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private static _plugin: GooglePlugin | null = null;

  protected readonly listProviders = [
    MailSearch,
  ];

  protected readonly itemProviders = [
    File,
    Thread,
  ];

  public static get config(): GooglePluginConfig {
    return GooglePlugin.plugin.config;
  }

  public static get plugin(): GooglePlugin {
    if (!GooglePlugin._plugin) {
      throw new Error("Not yet initialized.");
    }

    return GooglePlugin._plugin;
  }

  protected readonly problems: Map<string, string>;

  public setProblem(account: Account, problem: string): void {
    this.problems.set(account.id, problem);
  }

  public clearProblem(account: Account): void {
    this.problems.delete(account.id);
  }

  public constructor(
    private readonly server: PluginServer,
    private readonly config: GooglePluginConfig,
  ) {
    super();

    GooglePlugin._plugin = this;
    this.problems = new Map();

    let oauthMiddleware: PluginWebMiddleware = async (ctx: PluginWebContext, next: Koa.Next) => {
      let code = first(ctx.query.code);
      let userId = first(ctx.query.state);

      if (!code || userId != ctx.pluginContext.userId) {
        console.error("Bad oauth", code, userId);
        return next();
      }

      ctx.set("Cache-Control", "no-cache");

      let account = await Account.create(ctx.pluginContext, code);
      ctx.redirect(ctx.pluginContext.settingsPageUrl(account.id).toString());
    };

    this.middleware = koaMount("/oauth", oauthMiddleware);

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withContext((context: PluginContext) => this.update(context));
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, INITIAL_DELAY);
  }

  public override async update(context: PluginContext): Promise<void> {
    let accounts = await Account.store.list(context);
    for (let account of accounts) {
      try {
        await account.update();
      } catch (e) {
        // Ignore account failure.
      }
    }
    await super.update(context);
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }

  public async listProblems(context: PluginContext, userId: string | null): Promise<Problem[]> {
    if (!userId) {
      return [];
    }

    let accounts = await Account.store.list(context, {
      userId,
    });

    let problems: Problem[] = [];
    for (let account of accounts) {
      let problem = this.problems.get(account.id);
      if (problem) {
        problems.push({
          url: context.settingsPageUrl(account.id).toString(),
          description: `Issue with Google account ${account.email}: ${problem}`,
        });
      }
    }

    return problems;
  }
}

const pluginExport: ServerPluginExport = {
  id: "google",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init: (server: PluginServer, config: any) => new GooglePlugin(server, config),
};

export default pluginExport;
