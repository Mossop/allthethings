/* eslint-disable @typescript-eslint/no-explicit-any */
import type Knex from "knex";
import type Koa from "koa";

export type MaybeCallable<T, C> = T | ((config: C) => T);
export type Awaitable<T> = T | Promise<T>;

export type PluginKnex = Pick<Knex, "schema">;

type CreateColumn = (table: Knex.CreateTableBuilder, column: string) => Knex.ColumnBuilder;

export interface DbMigrationHelper {
  readonly idColumn: CreateColumn;
  readonly userRef: CreateColumn;
  readonly itemRef: CreateColumn;
}

export interface PluginItemFields {
}

export interface PluginDbMigration {
  readonly name: string;

  readonly up: (knex: PluginKnex) => Promise<void>;
  readonly down?: (knex: PluginKnex) => Promise<void>;
}

export interface ServerPlugin {
  readonly id: string;

  readonly getSchema?: () => Promise<string>;
  readonly serverMiddleware?: Koa.Middleware;
  readonly getClientScripts?: (ctx: Koa.Context) => string[];
  readonly getDbMigrations?: (helper: DbMigrationHelper) => PluginDbMigration[];
  readonly getItemFields: (id: string) => Promise<PluginItemFields>;
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
