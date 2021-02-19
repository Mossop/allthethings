/* eslint-disable @typescript-eslint/no-explicit-any */
import type Koa from "koa";

export type MaybeCallable<T, C> = T | ((config: C) => T);
export type Awaitable<T> = T | Promise<T>;

export interface ServerPlugin {
  readonly id: string;

  readonly serverMiddleware?: Koa.Middleware;
  readonly getClientScripts?: (ctx: Koa.Context) => string[];
}

export interface ClientPlugin {
  readonly id: string;
}

export type ServerPluginExport = MaybeCallable<Awaitable<ServerPlugin>, any>;
export type ClientPluginExport = MaybeCallable<Awaitable<ClientPlugin>, any>;

export function registerClientPlugin(plugin: ClientPluginExport): void {
  // @ts-ignore
  registerPlugin(plugin);
}
