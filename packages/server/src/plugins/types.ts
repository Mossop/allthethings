/* eslint-disable @typescript-eslint/no-explicit-any */
import type { URL } from "url";

import type { TaskController } from "@allthethings/schema";
import type { Awaitable, MaybeCallable } from "@allthethings/utils";
import type { Knex } from "knex";
import type Koa from "koa";
import type { DateTime } from "luxon";

import type { TaskManager } from "../utils/tasks";
import type { PluginDbMigration, PluginKnex, TableRef } from "./db";

export interface PluginList {
  name: string;
  url: string;
  items?: string[];
}

export interface PluginTaskInfo {
  due: DateTime | null;
  done: DateTime | null;
}

export interface BasePluginItem {
  id: string;
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  taskInfo: PluginTaskInfo | null;
}

export type CreateBasePluginItem = Omit<BasePluginItem, "id" | "taskInfo"> & {
  due?: DateTime | null;
  done?: DateTime | null;
  controller: TaskController | null;
};

export interface PluginItemFields {
}

export interface PluginContext {
  baseUrl: URL;
  pluginUrl: URL;

  settingsPageUrl(page: string): URL;

  readonly knex: PluginKnex;
  readonly userTableRef: TableRef;
  id(): Promise<string>;
  tableRef(name: string): TableRef;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]>;

  createItem(user: string, props: CreateBasePluginItem): Promise<BasePluginItem>;
  getItem(id: string): Promise<BasePluginItem | null>;
  setItemTaskDone(id: string, done: DateTime | null): Promise<void>;

  addList(list: PluginList): Promise<string>;
  updateList(id: string, list: Partial<PluginList>): Promise<void>;
  deleteList(id: string): Promise<void>;
}

export interface AuthedPluginContext extends PluginContext {
  readonly userId: string;
}

export interface User {
  id: () => string;
}

export type PluginField<R, A extends unknown[] = []> = MaybeCallable<Awaitable<R>, A>;

export type PluginWebContext = Koa.ParameterizedContext<Koa.DefaultState, {
  pluginContext: AuthedPluginContext,
}, any>;

export type PluginWebMiddleware = (context: PluginWebContext, next: Koa.Next) => Awaitable<unknown>;

export type ResolverFn<TContext = any, TResult = any, TParent = any, TArgs = any> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
) => Promise<TResult> | TResult;
export type TypeResolver<TContext> = Record<string, ResolverFn<TContext>>;
export type Resolver<TContext> = Record<string, TypeResolver<TContext>>;

export interface PluginServer {
  withContext: <T>(task: (context: PluginContext) => Promise<T>) => Promise<T>;
  taskManager: TaskManager;
}

export type ServerPluginExport = MaybeCallable<
  Awaitable<ServerPlugin>,
  [server: PluginServer, config: any]
>;

export interface ServerPlugin {
  readonly startup?: PluginField<void>;
  readonly schema?: PluginField<string>;
  readonly resolvers?: PluginField<Resolver<AuthedPluginContext>>;
  readonly middleware?: PluginWebMiddleware;
  readonly clientScripts?: PluginField<string[], [ctx: Koa.Context]>;
  readonly dbMigrations?: PluginField<PluginDbMigration[]>;
  readonly getItemFields: PluginField<
    PluginItemFields,
    [context: PluginContext, item: BasePluginItem]
  >;
  readonly deleteItem?: PluginField<void, [context: PluginContext, item: BasePluginItem]>;
  readonly createItemFromURL?: PluginField<
    string | null,
    [context: AuthedPluginContext, url: URL, isTask: boolean]
  >;
  readonly editItem?: PluginField<
    void,
    [context: PluginContext, item: BasePluginItem, newItem: Omit<BasePluginItem, "id" | "taskInfo">]
  >;
  readonly editTaskInfo?: PluginField<
    void,
    [context: PluginContext, item: BasePluginItem, taskInfo: PluginTaskInfo | null]
  >;
}
