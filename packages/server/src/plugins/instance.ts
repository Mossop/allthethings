import type { URL } from "url";

import type Koa from "koa";

import type {
  PluginContext,
  GraphQLContext,
  ServerPluginExport,
  PluginItemFields,
  PluginServer,
  Resolver,
} from ".";
import { buildContext } from ".";
import type { Awaitable, MaybeCallable } from "../../../utils";
import { call, isCallable, waitFor } from "../../../utils";
import type { DatabaseConnection } from "../db/connection";
import { buildDataSources } from "../db/datasources";
import type { ServerPlugin } from "../types";
import type { PluginDbMigration } from "./db";

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
  public readonly id: string;
  private _plugin: ServerPlugin | null = null;
  private readonly pluginPromise: Promise<void>;

  public constructor(spec: string, private readonly db: DatabaseConnection, config: unknown) {
    this.id = spec.replace(/[^0-9a-zA-Z_]/g, "_");

    this.pluginPromise = loadPlugin(spec, this, config).then((plugin: ServerPlugin) => {
      this._plugin = plugin;
    });
  }

  public init(): Promise<void> {
    return this.pluginPromise;
  }

  public async withContext<T>(
    task: (context: PluginContext) => Promise<T>,
  ): Promise<T> {
    let cloned = this.db.clone();
    await cloned.startTransaction();

    let dataSources = buildDataSources(cloned);

    try {
      let result = await task(buildContext(this, cloned, dataSources));
      await cloned.commitTransaction();
      return result;
    } catch (e) {
      await cloned.rollbackTransaction();
      throw e;
    }
  }

  private get plugin(): ServerPlugin {
    if (!this._plugin) {
      throw new Error("Not yet initialized.");
    }

    return this._plugin;
  }

  public getItemFields(id: string): Promise<PluginItemFields> {
    return getField(this.plugin, this.plugin.getItemFields, {}, id);
  }

  public getClientScripts(ctx: Koa.Context): Promise<string[]> {
    return getField(this.plugin, this.plugin.clientScripts, [], ctx);
  }

  public getDbMigrations(): Promise<PluginDbMigration[]> {
    return getField(this.plugin, this.plugin.dbMigrations, []);
  }

  public getServerMiddleware(): Promise<Koa.Middleware | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getField(this.plugin, this.plugin.middleware, undefined);
  }

  public getSchema(): Promise<string | null> {
    return getField(this.plugin, this.plugin.schema, null);
  }

  public getResolvers(): Promise<Resolver<GraphQLContext> | null> {
    return getField(this.plugin, this.plugin.resolvers, null);
  }

  public startup(): Promise<void> {
    return getField(this.plugin, this.plugin.startup, undefined);
  }

  public handleURL(context: GraphQLContext, url: URL): Promise<string | null> {
    return getField(this.plugin, this.plugin.handleURL, null, context, url);
  }
}
