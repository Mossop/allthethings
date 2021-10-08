import type { IocContainer } from "@tsoa/runtime";
import { Controller } from "@tsoa/runtime";
import type Koa from "koa";

import type { Segment } from "./segment";
import type { Transaction } from "./transaction";

export interface WebContext<Tx extends Transaction> {
  readonly segment: Segment;
  startTransaction(writable: boolean): Promise<Tx>;
}

export type MiddlewareContext<
  Tx extends Transaction,
  Ctx extends WebContext<Tx>,
> = Koa.ParameterizedContext<Koa.DefaultState, Ctx & Koa.DefaultContext>;

export class RequestController<
  Tx extends Transaction = Transaction,
  Ctx extends WebContext<Tx> = WebContext<Tx>,
> extends Controller {
  public constructor(protected readonly context: MiddlewareContext<Tx, Ctx>) {
    super();
  }

  public get segment(): Segment {
    return this.context.segment;
  }

  public startTransaction(writable: boolean): Promise<Tx> {
    return this.context.startTransaction(writable);
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
