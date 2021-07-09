/* eslint-disable @typescript-eslint/no-explicit-any */
import type { URL } from "url";

import type { Knex } from "knex";
import type Koa from "koa";
import type { DateTime, Duration } from "luxon";

import type { TaskController } from "#schema";
import type { Awaitable, MaybeCallable } from "#utils";

export type PluginKnex = Omit<Knex, "transaction">;

type CreateColumn = (table: Knex.CreateTableBuilder, column: string) => Knex.ColumnBuilder;

export type TableRef = Pick<Knex.Ref<string, {[K in string]: string}>, "as"> & Knex.Raw<string>;

export interface DbMigrationHelper {
  readonly idColumn: CreateColumn;
  readonly userRef: CreateColumn;
  readonly itemRef: CreateColumn;
  readonly listRef: CreateColumn;
  readonly tableName: (name: string) => string;
}

export interface PluginDbMigration {
  readonly name: string;

  readonly up: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
  readonly down?: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
}

export interface PluginList {
  name: string;
  url: string | null;
  items?: string[];
  due?: Duration | null;
}

export interface CreatePluginItemParams {
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  due?: DateTime | null;
  done?: DateTime | boolean | null;
  controller: TaskController | null;
}

export interface PluginItem {
  id: string;
  fields: MaybeCallable<Awaitable<unknown>>;
}

export interface Problem {
  description: string;
  url: string;
}

type Task<R = void> = () => Awaitable<R>;

export interface TaskManager {
  queueTask(task: Task, delay?: number): void;
  queueRecurringTask(task: Task<number>, delay?: number): void;
}

export interface PluginContext {
  rootUrl: URL;
  pluginUrl: URL;

  settingsPageUrl(page: string): URL;

  readonly knex: PluginKnex;
  readonly userTableRef: TableRef;
  id(): Promise<string>;
  tableRef(table: string): TableRef;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]>;

  createItem(user: string, props: CreatePluginItemParams): Promise<string>;
  setItemTaskDone(
    id: string,
    done: DateTime | boolean | null,
    due?: DateTime | null,
  ): Promise<void>;
  setItemSummary(id: string, summary: string): Promise<void>;
  disconnectItem(id: string, url?: string | null, icon?: string | null): Promise<void>;
  deleteItem(id: string): Promise<void>;

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

export interface ServerPluginExport {
  readonly id: string;
  readonly init: (server: PluginServer, config: any) => Awaitable<ServerPlugin>;
}

export interface ServerPlugin {
  readonly startup?: PluginField<void>;
  readonly resolvers?: PluginField<Resolver<AuthedPluginContext>>;
  readonly middleware?: PluginWebMiddleware;
  readonly clientScripts?: PluginField<string[], [ctx: Koa.Context]>;
  readonly dbMigrations?: PluginField<PluginDbMigration[]>;
  readonly getPluginItem: PluginField<
    PluginItem,
    [context: PluginContext, id: string]
  >;
  readonly deleteItem?: PluginField<void, [context: PluginContext, id: string]>;
  readonly createItemFromURL?: PluginField<
    string | null,
    [context: AuthedPluginContext, url: URL, isTask: boolean]
  >;
  readonly listProblems?: PluginField<Problem[], [context: PluginContext, user: string | null]>;
}
