import type { IocContainer } from "@tsoa/runtime";
import { Controller } from "@tsoa/runtime";
import type Koa from "koa";

import type { Segment } from "./segment";
import type { Transaction } from "./transaction";

export interface WebContext {
  readonly segment: Segment;
  startTransaction(writable: boolean): Promise<Transaction>;
}

export type WebServerContext = WebContext &
  Koa.DefaultContext &
  Koa.ExtendableContext;

export class RequestController extends Controller {
  public constructor(protected readonly context: WebServerContext) {
    super();
  }

  public get segment(): Segment {
    return this.context.segment;
  }
}

export function iocContainer(request: Koa.Request): IocContainer {
  return {
    get<T>(controller: new (request: WebServerContext) => T): T {
      return new controller(request.ctx as unknown as WebServerContext);
    },
  };
}

export class HttpError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
  }
}
