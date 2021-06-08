import { promises as fs } from "fs";
import path from "path";

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
} from "@allthethings/server";
import {
  BasePlugin,
} from "@allthethings/server";
import type Koa from "koa";
import koaCompose from "koa-compose";
import koaMount from "koa-mount";
import koaStatic from "koa-static";

import { Account, File, MailSearch, Thread } from "./db/implementations";
import buildMigrations from "./db/migrations";
import Resolvers from "./resolvers";
import type { GooglePluginConfig } from "./types";

export * from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

const UPDATE_DELAY = 60000;

export class GooglePlugin extends BasePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  private static _config: GooglePluginConfig | null = null;

  protected readonly searchProviders = [
    MailSearch,
  ];

  protected readonly itemProviders = [
    File,
    Thread,
  ];

  public static get config(): GooglePluginConfig {
    if (!GooglePlugin._config) {
      throw new Error("Not yet initialized.");
    }

    return GooglePlugin._config;
  }

  public constructor(
    private readonly server: PluginServer,
    private readonly config: GooglePluginConfig,
  ) {
    super();

    GooglePlugin._config = config;

    this.clientPath = path.dirname(require.resolve("@allthethings/google-client/dist/app.js"));

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

    let staticMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });

    this.middleware = koaCompose([
      koaMount("/oauth", oauthMiddleware),
      staticMiddleware,
    ]);

    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      try {
        await this.server.withContext((context: PluginContext) => this.update(context));
      } catch (e) {
        console.error(e);
      }
      return UPDATE_DELAY;
    }, UPDATE_DELAY);
  }

  public async update(context: PluginContext): Promise<void> {
    let accounts = await Account.store.list(context);
    for (let account of accounts) {
      await account.update();
    }
    await super.update(context);
  }

  public schema(): Promise<string> {
    let schemaFile = path.join(__dirname, "..", "..", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return Resolvers;
  }

  public clientScripts(): string[] {
    return ["/app.js"];
  }

  public dbMigrations(): PluginDbMigration[] {
    return buildMigrations();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugin: ServerPluginExport = (server: PluginServer, config: any) => {
  return new GooglePlugin(server, config);
};

export default plugin;
