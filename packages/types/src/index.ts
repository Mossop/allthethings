/* eslint-disable @typescript-eslint/no-explicit-any */
import type Knex from "knex";
import type Koa from "koa";

export type MaybeCallable<T, C> = T | ((config: C) => T);
export type Awaitable<T> = T | Promise<T>;

export type PluginKnex = Omit<Knex, "transaction">;

type CreateColumn = (table: Knex.CreateTableBuilder, column: string) => Knex.ColumnBuilder;

export type ResolverFn<TContext = any, TResult = any, TParent = any, TArgs = any> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
) => Promise<TResult> | TResult;
export type TypeResolver<TContext> = Record<string, ResolverFn<TContext>>;
export type Resolver<TContext> = Record<string, TypeResolver<TContext>>;

export type TableRef = Pick<Knex.Ref<string, {[K in string]: string}>, "as"> & Knex.Raw<string>;

export interface PluginContext {
  readonly knex: PluginKnex;
  readonly userTableRef: TableRef;
  id(): Promise<string>;
  tableRef(name: string): TableRef;
  // eslint-disable-next-line @typescript-eslint/ban-types
  table<TRecord extends {} = any>(name: string): Knex.QueryBuilder<TRecord, TRecord[]>;
}

export interface GraphQLContext extends PluginContext {
  readonly userId: string | null;
}

export interface User {
  id: string;
}

export interface DbMigrationHelper {
  readonly idColumn: CreateColumn;
  readonly userRef: CreateColumn;
  readonly itemRef: CreateColumn;
}

export interface PluginItemFields {
}

export interface PluginDbMigration {
  readonly name: string;

  readonly up: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
  readonly down?: (knex: PluginKnex, helper: DbMigrationHelper) => Promise<void>;
}

export interface ServerPlugin {
  readonly id: string;

  readonly getSchema?: () => Promise<string>;
  readonly getResolvers?: () => Resolver<GraphQLContext>;
  readonly serverMiddleware?: Koa.Middleware;
  readonly getClientScripts?: (ctx: Koa.Context) => string[];
  readonly getDbMigrations?: () => PluginDbMigration[];
  readonly getItemFields: (id: string) => Promise<PluginItemFields>;
}

export type ServerPluginExport = MaybeCallable<Awaitable<ServerPlugin>, any>;
