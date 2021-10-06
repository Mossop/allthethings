import type { URL } from "url";

import type * as KoaRouter from "@koa/router";
import type { DateTime } from "luxon";
import type { JsonDecoder } from "ts.data.json";

import type { MiddlewareContext } from ".";
import type {
  Awaitable,
  MaybeCallable,
  Overwrite,
  RelativeDateTime,
} from "../../utils";
import type { WebContext } from "./controllers";
import { RequestController } from "./controllers";
import type { TaskManager } from "./tasks";
import type { Transaction } from "./transaction";
import type { Problem, TaskController } from "./types";

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

export type ServiceWebContext<
  Tx extends ServiceTransaction = ServiceTransaction,
> = Overwrite<
  WebContext,
  {
    readonly userId: string;
    readonly rootUrl: URL;
    readonly serviceUrl: URL;

    startTransaction(writable: boolean): Promise<Tx>;
    settingsPageUrl(page: string): URL;
  }
>;

export type ServiceMiddlewareContext<
  Tx extends ServiceTransaction = ServiceTransaction,
> = MiddlewareContext<ServiceWebContext<Tx>>;

export class ServiceController<
  Tx extends ServiceTransaction = ServiceTransaction,
> extends RequestController<ServiceWebContext<Tx>> {
  public get userId(): string {
    return this.context.userId;
  }

  public get rootUrl(): URL {
    return this.context.rootUrl;
  }

  public get serviceUrl(): URL {
    return this.context.serviceUrl;
  }

  public startTransaction(writable: boolean): Promise<Tx> {
    return this.context.startTransaction(writable);
  }

  public settingsPageUrl(page: string): URL {
    return this.context.settingsPageUrl(page);
  }
}

export interface Service<Tx extends ServiceTransaction = ServiceTransaction> {
  readonly buildTransaction: (transaction: ServiceTransaction) => Awaitable<Tx>;
  readonly createItemFromURL?: (
    tx: Tx,
    userId: string,
    targetUrl: URL,
    isTask: boolean,
  ) => Promise<string | null>;
  readonly getServiceItem: (tx: Tx, id: string) => Awaitable<ServiceItem>;
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
