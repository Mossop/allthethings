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

import { Account, File, Thread } from "./db/implementations";
import buildMigrations from "./db/migrations";
import buildResolvers from "./resolvers";
import type { GooglePluginConfig } from "./types";

export * from "./types";

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

class GooglePlugin implements ServerPlugin {
  public readonly middleware: PluginWebMiddleware;

  private readonly clientPath: string;

  public constructor(
    private readonly server: PluginServer,
    private readonly config: GooglePluginConfig,
  ) {
    this.clientPath = path.dirname(require.resolve("@allthethings/google-client/dist/app.js"));

    let oauthMiddleware: PluginWebMiddleware = async (ctx: PluginWebContext, next: Koa.Next) => {
      let code = first(ctx.query.code);
      let userId = first(ctx.query.state);

      if (!code || userId != ctx.pluginContext.userId) {
        console.error("Bad oauth", code, userId);
        return next();
      }

      ctx.set("Cache-Control", "no-cache");

      let account = await Account.create(this.config, ctx.pluginContext, code);
      ctx.redirect(ctx.pluginContext.settingsPageUrl(account.id).toString());
    };

    let staticMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });

    this.middleware = koaCompose([
      koaMount("/oauth", oauthMiddleware),
      staticMiddleware,
    ]);
  }

  public schema(): Promise<string> {
    let schemaFile = path.join(__dirname, "..", "..", "schema.graphql");
    return fs.readFile(schemaFile, {
      encoding: "utf8",
    });
  }

  public resolvers(): Resolver<AuthedPluginContext> {
    return buildResolvers(this.config);
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
    let file = await File.getForItem(this.config, context, item.id);
    if (file) {
      return file.fields();
    }

    let thread = await Thread.getForItem(this.config, context, item.id);
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

    let accounts = await Account.list(this.config, context, context.userId);
    for (let account of accounts) {
      let item = await account.getItemFromURL(url, isTask);
      if (item) {
        return item.itemId;
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
