import type { GraphQLCtx, Transaction } from "../utils";
import { NotAuthenticatedError, RequestController } from "../utils";
import { User } from "./implementations";

type ResolverFn<A extends unknown[], R> = (
  ctx: GraphQLCtx,
  ...args: A
) => Promise<R>;

type AuthedResolverFn<A extends unknown[], R> = (
  tx: Transaction,
  user: User,
  ...args: A
) => Promise<R>;

export function ensureAuthed<A extends unknown[], R>(
  fn: AuthedResolverFn<A, R>,
): ResolverFn<A, R> {
  return async (ctx: GraphQLCtx, ...args: A): Promise<R> => {
    if (ctx.userId === null) {
      throw new Error("Not authenticated.");
    }

    let user = await User.store(ctx.transaction).get(ctx.userId);

    return fn(ctx.transaction, user, ...args);
  };
}

export function ensureAdmin<A extends unknown[], R>(
  fn: AuthedResolverFn<A, R>,
): ResolverFn<A, R> {
  return async (ctx: GraphQLCtx, ...args: A): Promise<R> => {
    if (ctx.userId === null) {
      throw new Error("Not authenticated.");
    }

    let user = await User.store(ctx.transaction).get(ctx.userId);
    if (!user.isAdmin) {
      throw new Error("Not an administrator.");
    }

    return fn(ctx.transaction, user, ...args);
  };
}

export class CoreController extends RequestController {
  public get userId(): string | null {
    return (this.context.session?.userId as string | undefined) ?? null;
  }

  public startTransaction(writable: boolean): Promise<Transaction> {
    return this.context.startTransaction(writable);
  }
}

export function Authenticated<A extends unknown[], R>(
  writable: boolean,
): MethodDecorator {
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    let inner = descriptor.value as (...args: A) => Promise<R>;

    descriptor.value = async function (
      this: CoreController,
      ...args: A
    ): Promise<R> {
      if (!this.userId) {
        throw new NotAuthenticatedError();
      }

      let tx = await this.startTransaction(writable);
      let user = await User.store(tx).findOne({ id: this.userId });
      if (user) {
        // @ts-ignore
        return inner(tx, user, ...args);
      }

      throw new NotAuthenticatedError();
    };
  };
}
