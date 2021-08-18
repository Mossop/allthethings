import { GraphQLScalarType } from "graphql";
import type { GraphQLResolveInfo } from "graphql";

import type { Problem as SchemaProblem } from "#schema";
import { isPromise, waitFor } from "#utils";
import type { Awaitable, MaybeCallable, Overwrite } from "#utils";

import type { ServiceTransaction } from "./services";
import type { Transaction } from "./transaction";
import type { Resolver } from "./types";

export interface Root {
  dummy: "Root";
}

export type Problem = Omit<SchemaProblem, "__typename">;

export interface ContextBuilder {
  buildContext(
    info: GraphQLResolveInfo,
    resolvers?: Record<string, unknown>,
  ): Promise<GraphQLCtx>;
}

export interface GraphQLCtx<Tx extends Transaction = Transaction> {
  userId: string | null;
  transaction: Tx;
}

export type AuthedGraphQLCtx<Tx extends Transaction = Transaction> = Overwrite<
  GraphQLCtx<Tx>,
  {
    userId: string;
  }
>;

export type ResolverImpl<T> = {
  [K in keyof T]: T[K] extends Resolver<infer TResult, any, any, infer TArgs>
    ? MaybeCallable<Awaitable<TResult>, [args: TArgs, info: GraphQLResolveInfo]>
    : T[K];
};

type Contexts<Tx extends Transaction> = GraphQLCtx<Tx> | AuthedGraphQLCtx<Tx>;

export type TypeResolver<T, Ctx> = {
  [K in keyof T]: T[K] extends Resolver<infer TResult, any, any, infer TArgs>
    ? MaybeCallable<
        Awaitable<TResult>,
        [context: Ctx, args: TArgs, info: GraphQLResolveInfo]
      >
    : T[K];
};

export type ResolverFor<T, Ctx> = T extends GraphQLScalarType
  ? T
  : "__resolveType" extends keyof T
  ? Pick<T, "__resolveType">
  : TypeResolver<T, Ctx>;

export type RootResolvers<R, Ctx extends Contexts<any>> = {
  [K in keyof R]?: ResolverFor<R[K], Ctx>;
};

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function rootResolvers<
  R,
  Ctx extends Contexts<any> = AuthedGraphQLCtx<ServiceTransaction>,
>(resolvers: RootResolvers<R, Ctx>): R {
  let root = {};

  const mapResolvers = (resolver, target = {}) => {
    for (let [key, value] of Object.entries(resolver)) {
      target[key] = mapResolver(key, value);
    }

    return target;
  };

  const mapResolver = (key: string, value: unknown) => {
    if (value instanceof GraphQLScalarType) {
      return value;
    } else if (typeof value == "function") {
      if (key == "__resolveType") {
        return async function (
          parent: unknown,
          ctx: ContextBuilder,
          info: GraphQLResolveInfo,
        ): Promise<unknown> {
          return waitFor(
            value.call(
              // @ts-ignore
              this,
              parent,
              await ctx.buildContext(info, root),
              info,
            ),
          );
        };
      }

      return async function (
        parent: unknown,
        args: unknown,
        ctx: ContextBuilder,
        info: GraphQLResolveInfo,
      ): Promise<unknown> {
        return waitFor(
          value.call(
            // @ts-ignore
            this,
            await ctx.buildContext(info, root),
            args,
            info,
          ),
        );
      };
    } else if (isPromise(value) || typeof value != "object") {
      return () => value;
    } else {
      return mapResolvers(value);
    }
  };

  // @ts-ignore
  return mapResolvers(resolvers, root);
}
