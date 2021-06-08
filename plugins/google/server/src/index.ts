import { promises as fs } from "fs";
import path from "path";
import type { URL } from "url";

import type {
  PluginDbMigration,
  ServerPlugin,
  PluginItemFields,
  AuthedPluginContext,
  Resolver,
  ServerPluginExport,
  PluginServer,
  PluginContext,
  BasePluginItem,
  PluginWebMiddleware,
  PluginWebContext,
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

export class GooglePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  private static _config: GooglePluginConfig | null = null;

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
    for (let account of await Account.store.list(context)) {
      await account.update();

      for (let search of await MailSearch.store.list(context, { ownerId: account.id })) {
        await search.update();
      }
    }
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

  public async getItemFields(
    context: PluginContext,
    item: BasePluginItem,
  ): Promise<PluginItemFields> {
    let file = await File.store.get(context, item.id);
    if (file) {
      return file.fields();
    }

    let thread = await Thread.store.get(context, item.id);
    if (thread) {
      return thread.fields();
    }

    throw new Error("Unknown item.");
  }

  public async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    if (!context.userId) {
      return null;
    }

    let accounts = await Account.store.list(context, { userId: context.userId });
    for (let account of accounts) {
      let item = await account.getItemFromURL(url, isTask);
      if (item) {
        return item.id;
      }
    }

    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugin: ServerPluginExport = (server: PluginServer, config: any) => {
  return new GooglePlugin(server, config);
};

export default plugin;
