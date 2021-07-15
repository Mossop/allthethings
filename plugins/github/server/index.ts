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

import { Account, IssueLike } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";
import type { GithubPluginConfig } from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

export class GitHubPlugin extends BasePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private static _plugin: GitHubPlugin | null = null;

  protected readonly listProviders = [
  ];

  protected readonly itemProviders = [
    IssueLike,
  ];

  public static get config(): GithubPluginConfig {
    return GitHubPlugin.plugin.config;
  }

  public static get plugin(): GitHubPlugin {
    if (!GitHubPlugin._plugin) {
      throw new Error("Not yet initialized.");
    }

    return GitHubPlugin._plugin;
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
    private readonly config: GithubPluginConfig,
  ) {
    super();

    GitHubPlugin._plugin = this;
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
          description: `Issue with Github account ${account.user}: ${problem}`,
        });
      }
    }

    return problems;
  }
}

const pluginExport: ServerPluginExport = {
  id: "github",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init: (server: PluginServer, config: any) => new GitHubPlugin(server, config),
};

export default pluginExport;
