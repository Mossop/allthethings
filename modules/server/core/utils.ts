import type { GraphQLCtx, Transaction } from "#server/utils";

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
