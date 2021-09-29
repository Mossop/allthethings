import type { IocContainer } from "@tsoa/runtime";
import { Controller } from "@tsoa/runtime";
import type Koa from "koa";

import type { Segment } from "./segment";
import type { Transaction } from "./transaction";

export interface WebContext {
  readonly segment: Segment;
  startTransaction(writable: boolean): Promise<Transaction>;
}

export type MiddlewareContext<Ctx extends WebContext> =
  Koa.ParameterizedContext<Koa.DefaultState, Ctx & Koa.DefaultContext>;

export class RequestController<
  Ctx extends WebContext = WebContext,
> extends Controller {
  public constructor(protected readonly context: MiddlewareContext<Ctx>) {
    super();
  }

  public get segment(): Segment {
    return this.context.segment;
  }
}

export function iocContainer(request: Koa.Request): IocContainer {
  return {
    get<T>(controller: new (ctx: unknown) => T): T {
      return new controller(request.ctx);
    },
  };
}

export class HttpError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  public constructor() {
    super(404, "Not found");
  }
}

export class NotAuthenticatedError extends HttpError {
  public constructor() {
    super(403, "Not yet authenticated");
  }
}
