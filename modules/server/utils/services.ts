import type { URL } from "url";

import type * as KoaRouter from "@koa/router";
import type { DateTime } from "luxon";
import type { JsonDecoder } from "ts.data.json";

import type {
  Awaitable,
  MaybeCallable,
  Overwrite,
  RelativeDateTime,
} from "../../utils";
import type { MiddlewareContext, WebContext } from "./controllers";
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

export interface Server {
  readonly rootUrl: URL;
  readonly serviceUrl: URL;
  readonly taskManager: TaskManager;

  withTransaction<R>(
    operation: string,
    task: (tx: ServiceTransaction) => Promise<R>,
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

export type ServiceWebContext = Overwrite<
  WebContext<ServiceTransaction>,
  {
    readonly userId: string;
    readonly rootUrl: URL;
    readonly serviceUrl: URL;

    settingsPageUrl(page: string): URL;
  }
>;

export type ServiceMiddlewareContext = MiddlewareContext<
  ServiceTransaction,
  ServiceWebContext
>;

export class ServiceController extends RequestController<
  ServiceTransaction,
  ServiceWebContext
> {
  public get userId(): string {
    return this.context.userId;
  }

  public get rootUrl(): URL {
    return this.context.rootUrl;
  }

  public get serviceUrl(): URL {
    return this.context.serviceUrl;
  }

  public settingsPageUrl(page: string): URL {
    return this.context.settingsPageUrl(page);
  }
}

export interface Service {
  readonly createItemFromURL?: (
    tx: ServiceTransaction,
    userId: string,
    targetUrl: URL,
    isTask: boolean,
  ) => Promise<string | null>;
  readonly getServiceItem: (
    tx: ServiceTransaction,
    id: string,
  ) => Awaitable<ServiceItem>;
  readonly addWebRoutes?: (router: KoaRouter) => void;
  readonly listProblems?: (
    tx: ServiceTransaction,
    userId: string | null,
  ) => Promise<Problem[]>;
}

export interface ServiceExport<C = any> {
  readonly id: string;
  readonly configDecoder?: JsonDecoder.Decoder<C>;
  readonly init: (server: Server, config: C) => Awaitable<Service>;
}
