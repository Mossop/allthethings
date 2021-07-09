import type { URL } from "url";

import type Koa from "koa";

import type {
  PluginDbMigration,
  ServerPlugin,
  PluginContext,
  AuthedPluginContext,
  ServerPluginExport,
  PluginItem,
  PluginServer,
  Resolver,
  Problem,
} from "#server-utils";
import type { Awaitable, MaybeCallable } from "#utils";
import { isCallable, waitFor } from "#utils";

import { buildAuthedPluginContext, buildPluginContext } from ".";
import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";
import { AppDataSources } from "../db/datasources";
import type { TaskManager } from "../utils/tasks";
import taskManager from "../utils/tasks";
import type { WebServerContext } from "../webserver/context";

function getField<R, D, A extends unknown[]>(
  plugin: ServerPlugin,
  field: MaybeCallable<Awaitable<R>, A> | undefined,
  def: D,
  ...args: A
): Promise<R | D> {
  if (field === undefined) {
    return Promise.resolve(def);
  }

  let result: Awaitable<R>;
  if (isCallable(field)) {
    result = field.apply(plugin, args);
  } else {
    result = field;
  }

  return waitFor(result);
}

export default class PluginInstance implements PluginServer {
  private _plugin: ServerPlugin | null = null;
  private readonly pluginPromise: Promise<void>;
  public readonly id: string;

  public constructor(
    private readonly db: DatabaseConnection,
    public readonly serverConfig: ServerConfig,
    public readonly pluginExport: ServerPluginExport,
  ) {
    this.id = pluginExport.id;

    this.pluginPromise = waitFor(
      pluginExport.init(this, serverConfig.plugins[pluginExport.id]),
    ).then((plugin: ServerPlugin) => {
      this._plugin = plugin;
    });
  }

  public init(): Promise<void> {
    return this.pluginPromise;
  }

  public get taskManager(): TaskManager {
    return taskManager;
  }

  public async withContext<T>(
    task: (context: PluginContext) => Promise<T>,
  ): Promise<T> {
    let cloned = this.db.clone();
    await cloned.startTransaction();

    let dataSources = new AppDataSources(cloned);

    try {
      let result = await task(buildPluginContext(this, dataSources));

      await dataSources.ensureSanity();
      await cloned.commitTransaction();
      return result;
    } catch (e) {
      await cloned.rollbackTransaction(e);
      throw e;
    }
  }

  public get schema(): string {
    return this.id.replace(/[^0-9a-zA-Z_]/g, "_");
  }

  private get plugin(): ServerPlugin {
    if (!this._plugin) {
      throw new Error("Not yet initialized.");
    }

    return this._plugin;
  }

  public async getPluginItem(context: PluginContext, id: string): Promise<PluginItem> {
    let item = await getField(this.plugin, this.plugin.getPluginItem, null, context, id);
    if (!item) {
      throw new Error(`Missing plugin item (${id}`);
    }
    return item;
  }

  public deleteItem(context: PluginContext, id: string): Promise<void> {
    return getField(this.plugin, this.plugin.deleteItem, undefined, context, id);
  }

  public getClientScripts(ctx: Koa.Context): Promise<string[]> {
    return getField(this.plugin, this.plugin.clientScripts, [], ctx);
  }

  public getDbMigrations(): Promise<PluginDbMigration[]> {
    return getField(this.plugin, this.plugin.dbMigrations, []);
  }

  public async webMiddleware(
    ctx: Koa.ParameterizedContext<Koa.DefaultState, WebServerContext>,
    next: Koa.Next,
  ): Promise<unknown> {
    let user = ctx.session?.userId ?? null;
    if (!user) {
      return next();
    }

    if (!this.plugin.middleware) {
      return;
    }

    let { db } = ctx;

    if (!db.isInTransaction) {
      await db.startTransaction();
    }

    try {
      let dataSources = new AppDataSources(db);
      let pluginContext = buildAuthedPluginContext(this, dataSources, user);

      await this.plugin.middleware(Object.create(ctx, {
        pluginContext: {
          enumerable: true,
          configurable: false,
          writable: false,
          value: pluginContext,
        },
      }), next);

      await dataSources.ensureSanity();
      await db.commitTransaction();
    } catch (e) {
      await db.rollbackTransaction(e);
      throw e;
    }
  }

  public getResolvers(): Promise<Resolver<AuthedPluginContext> | null> {
    return getField(this.plugin, this.plugin.resolvers, null);
  }

  public startup(): Promise<void> {
    return getField(this.plugin, this.plugin.startup, undefined);
  }

  public createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    return getField(this.plugin, this.plugin.createItemFromURL, null, context, url, isTask);
  }

  public listProblems(context: PluginContext, userId: string | null): Promise<Problem[]> {
    return getField(this.plugin, this.plugin.listProblems, [], context, userId);
  }
}
