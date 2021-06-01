import type { URL } from "url";

import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import { call, isCallable, waitFor } from "@allthethings/utils";
import type Koa from "koa";

import { buildAuthedPluginContext, buildPluginContext } from ".";
import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";
import { buildDataSources } from "../db/datasources";
import type { TaskManager } from "../utils/tasks";
import taskManager from "../utils/tasks";
import type { WebServerContext } from "../webserver/context";
import type { PluginDbMigration } from "./db";
import type {
  ServerPlugin,
  PluginContext,
  AuthedPluginContext,
  ServerPluginExport,
  PluginItemFields,
  PluginServer,
  Resolver,
  BasePluginItem,
  PluginTaskInfo,
} from "./types";

async function loadPlugin(
  spec: string,
  server: PluginServer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
): Promise<ServerPlugin> {
  let { default: module } = await import(spec) as { default: ServerPluginExport };
  return waitFor(call(module, server, config));
}

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
  public readonly schema: string;
  private _plugin: ServerPlugin | null = null;
  private readonly pluginPromise: Promise<void>;

  public constructor(
    public readonly id: string,
    private readonly db: DatabaseConnection,
    public readonly serverConfig: ServerConfig,
  ) {
    this.schema = this.id.replace(/[^0-9a-zA-Z_]/g, "_");

    this.pluginPromise = loadPlugin(
      this.id,
      this,
      serverConfig.plugins[this.id],
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

    let dataSources = buildDataSources(cloned);

    try {
      let result = await task(buildPluginContext(this, dataSources));

      await dataSources.items.deleteCompleteInboxTasks();
      await cloned.commitTransaction();
      return result;
    } catch (e) {
      await cloned.rollbackTransaction(e);
      throw e;
    }
  }

  private get plugin(): ServerPlugin {
    if (!this._plugin) {
      throw new Error("Not yet initialized.");
    }

    return this._plugin;
  }

  public getItemFields(context: PluginContext, item: BasePluginItem): Promise<PluginItemFields> {
    return getField(this.plugin, this.plugin.getItemFields, {}, context, item);
  }

  public deleteItem(context: PluginContext, item: BasePluginItem): Promise<void> {
    return getField(this.plugin, this.plugin.deleteItem, undefined, context, item);
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
      let dataSources = buildDataSources(db);
      let pluginContext = buildAuthedPluginContext(this, dataSources, user);

      await this.plugin.middleware(Object.create(ctx, {
        pluginContext: {
          enumerable: true,
          configurable: false,
          writable: false,
          value: pluginContext,
        },
      }), next);

      await dataSources.items.deleteCompleteInboxTasks();
      await db.commitTransaction();
    } catch (e) {
      await db.rollbackTransaction(e);
      throw e;
    }
  }

  public getSchema(): Promise<string | null> {
    return getField(this.plugin, this.plugin.schema, null);
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

  public editItem(
    context: PluginContext,
    item: BasePluginItem,
    newItem: Omit<BasePluginItem, "id" | "taskInfo">,
  ): Promise<void> {
    return getField(this.plugin, this.plugin.editItem, undefined, context, item, newItem);
  }

  public editTaskInfo(
    context: PluginContext,
    item: BasePluginItem,
    taskInfo: PluginTaskInfo | null,
  ): Promise<void> {
    return getField(this.plugin, this.plugin.editTaskInfo, undefined, context, item, taskInfo);
  }
}
