import type Koa from "koa";
import { ObjectId } from "mongodb";

import type { DataSources, User } from "../db";
import type { ResolverFn } from "./resolvers";

export interface BaseContext {
  userId: ObjectId | null;
  login: (user: User) => void;
  logout: () => void;
}

export type ResolverContext = BaseContext & {
  dataSources: DataSources;
};

type AuthedContext = Omit<ResolverContext, "userId"> & {
  userId: ObjectId;
};

interface Params<TContext, TParent, TArgs> {
  outer: TParent;
  ctx: TContext;
  args: TArgs;
}

export type ResolverParams<
  TParent = unknown,
  TArgs = unknown,
> = Params<ResolverContext, TParent, TArgs>;
export type AuthedParams<
  TParent = unknown,
  TArgs = unknown,
> = Params<AuthedContext, TParent, TArgs>;

export function authed<TResult, TParent, TArgs>(
  resolver: (params: AuthedParams<TParent, TArgs>) => Promise<TResult> | TResult,
): ResolverFn<TResult, TParent, ResolverContext, TArgs> {
  return (outer: TParent, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    let { userId } = ctx;
    if (!userId) {
      throw new Error("Not logged in.");
    }

    return resolver({
      outer,
      args,
      ctx: {
        ...ctx,
        userId,
      },
    });
  };
}

export function resolver<TResult, TParent, TArgs>(
  resolver: (params: ResolverParams<TParent, TArgs>) => Promise<TResult> | TResult,
): ResolverFn<TResult, TParent, ResolverContext, TArgs> {
  return (outer: TParent, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    return resolver({
      outer,
      args,
      ctx,
    });
  };
}

export function buildContext({ ctx }: { ctx: Koa.Context }): BaseContext {
  let user = ctx.session?.userId;

  return {
    userId: user ? new ObjectId(user) : null,

    login(user: User): void {
      if (!ctx.session) {
        throw new Error("Session is not initialized.");
      }

      this.userId = user.dbId;
      ctx.session.userId = user.id;
      ctx.session.save();
    },

    logout(): void {
      this.userId = null;

      if (!ctx.session) {
        return;
      }

      ctx.session.userId = null;
      ctx.session.save();
    },
  };
}
