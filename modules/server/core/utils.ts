import type { GraphQLCtx } from "#server/utils";

import type { User } from "./implementations";
import type { CoreTransaction } from "./transaction";

type ResolverFn<
  A extends unknown[],
  R,
> = (ctx: GraphQLCtx<CoreTransaction>, ...args: A) => Promise<R>;

type AuthedResolverFn<
  A extends unknown[],
  R,
> = (tx: CoreTransaction, user: User, ...args: A) => Promise<R>;

export function ensureAuthed<
  A extends unknown[],
  R,
>(fn: AuthedResolverFn<A, R>): ResolverFn<A, R> {
  return async (ctx: GraphQLCtx<CoreTransaction>, ...args: A): Promise<R> => {
    if (ctx.userId === null) {
      throw new Error("Not authenticated.");
    }

    let user = await ctx.transaction.stores.users.get(ctx.userId);
    if (!user) {
      throw new Error("Not authenticated.");
    }

    return fn(ctx.transaction, user, ...args);
  };
}

export function ensureAdmin<
  A extends unknown[],
  R,
>(fn: AuthedResolverFn<A, R>): ResolverFn<A, R> {
  return async (ctx: GraphQLCtx<CoreTransaction>, ...args: A): Promise<R> => {
    if (ctx.userId === null) {
      throw new Error("Not authenticated.");
    }

    let user = await ctx.transaction.stores.users.get(ctx.userId);
    if (!user) {
      throw new Error("Not authenticated.");
    }
    if (!user.isAdmin) {
      throw new Error("Not an administrator.");
    }

    return fn(ctx.transaction, user, ...args);
  };
}
