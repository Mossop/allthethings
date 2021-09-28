import type { URL } from "url";

import type * as KoaRouter from "@koa/router";
import type Koa from "koa";
import type { DateTime } from "luxon";
import type { JsonDecoder } from "ts.data.json";

import type { Awaitable, MaybeCallable, RelativeDateTime } from "#utils";

import type { TaskController } from "../../schema";
import { RequestController } from "./controllers";
import type { Problem } from "./schema";
import type { TaskManager } from "./tasks";
import type { Transaction } from "./transaction";

export interface ItemList {
  name: string;
  url: string | null;
  items?: string[];
  due?: RelativeDateTime | null;
}

export interface CreateItemParams {
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  due?: DateTime | null;
  done?: DateTime | boolean | null;
  controller: TaskController | null;
}

export interface ServiceItem<T = unknown> {
  id: string;
  fields: MaybeCallable<Awaitable<T>>;
}

export interface Server<Tx extends ServiceTransaction = ServiceTransaction> {
  readonly rootUrl: URL;
  readonly serviceUrl: URL;
  readonly taskManager: TaskManager;

  withTransaction<R>(
    operation: string,
    task: (tx: Tx) => Promise<R>,
  ): Promise<R>;
}

export type ServiceTransaction = Transaction & {
  readonly rootUrl: URL;
  readonly serviceUrl: URL;

  createItem(user: string, props: CreateItemParams): Promise<string>;
  setItemTaskDone(
    id: string,
    done: DateTime | boolean | null,
    due?: DateTime | null,
  ): Promise<void>;
  setItemSummary(id: string, summary: string): Promise<void>;
  disconnectItem(
    id: string,
    url?: string | null,
    icon?: string | null,
  ): Promise<void>;
  deleteItem(id: string): Promise<void>;

  addList(list: ItemList): Promise<string>;
  updateList(id: string, list: Partial<ItemList>): Promise<void>;
  deleteList(id: string): Promise<void>;

  settingsPageUrl(page: string): URL;
};

export interface ServiceWebContextExtras<
  Tx extends ServiceTransaction = ServiceTransaction,
> {
  readonly userId: string;
  readonly transaction: Tx;
}

export type ServiceWebContext<
  Tx extends ServiceTransaction = ServiceTransaction,
> = ServiceWebContextExtras<Tx> & Koa.DefaultContext & Koa.ExtendableContext;

export type ServiceWebMiddleware<Tx extends ServiceTransaction> = (
  ctx: Koa.ParameterizedContext<unknown, ServiceWebContext<Tx>>,
  next: Koa.Next,
) => Promise<any>;

export interface Service<Tx extends ServiceTransaction = ServiceTransaction> {
  readonly buildTransaction: (transaction: ServiceTransaction) => Awaitable<Tx>;
  readonly resolvers: Record<string, unknown>;
  readonly createItemFromURL?: (
    tx: Tx,
    userId: string,
    targetUrl: URL,
    isTask: boolean,
  ) => Promise<string | null>;
  readonly getServiceItem: (tx: Tx, id: string) => Awaitable<ServiceItem>;
  readonly webMiddleware?: ServiceWebMiddleware<Tx>;
  readonly addWebRoutes?: (router: KoaRouter) => void;
  readonly listProblems?: (tx: Tx, userId: string | null) => Promise<Problem[]>;
}

export interface ServiceExport<
  C = any,
  Tx extends ServiceTransaction = ServiceTransaction,
> {
  readonly id: string;
  readonly configDecoder?: JsonDecoder.Decoder<C>;
  readonly init: (server: Server<Tx>, config: C) => Awaitable<Service<Tx>>;
}

export class ServiceController extends RequestController {}
