/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MigrationSource, Migration, CreateTableBuilder, ColumnBuilder } from "knex";
import type Koa from "koa";

export type MaybeCallable<T, C> = T | ((config: C) => T);
export type Awaitable<T> = T | Promise<T>;

type CreateColumn = (table: CreateTableBuilder, column: string) => ColumnBuilder;

export interface DbMigrationHelper {
  readonly idColumn: CreateColumn;
  readonly userRef: CreateColumn;
  readonly itemRef: CreateColumn;
}

export interface ServerPlugin {
  readonly id: string;

  readonly getSchema?: () => Promise<string>;
  readonly serverMiddleware?: Koa.Middleware;
  readonly getClientScripts?: (ctx: Koa.Context) => string[];
  readonly getDbMigrations?: (helper: DbMigrationHelper) => MigrationSource<Migration>;
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
