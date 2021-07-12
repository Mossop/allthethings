import type { GraphQLResolveInfo } from "graphql";

import type { MaybeCallable, Awaitable } from "#utils";

export interface Root {
  dummy: "Root";
}

export type ResolverFunc<TResult, TParent, TContext, TArgs> =
  TParent extends Root
    ? MaybeCallable<
      Awaitable<TResult>,
      [parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo]
    >
    : MaybeCallable<
      Awaitable<TResult>,
      [args: TArgs, context: TContext, info: GraphQLResolveInfo]
    >;
