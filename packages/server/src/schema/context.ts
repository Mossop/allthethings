import type Koa from "koa";
import { ObjectId } from "mongodb";

import type { Context, DataSources, Owner, User } from "../db";
import type { ResolverFn } from "./resolvers";

export interface BaseContext {
  userId: ObjectId | null;
  getContext: (id: ObjectId) => Promise<Context | null>;
  getOwner: (id: ObjectId) => Promise<Owner | null>;
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

    async getContext(this: ResolverContext, id: ObjectId): Promise<Context | null> {
      let context = await this.dataSources.namedContexts.get(id);
      if (context) {
        return context;
      }

      let user = await this.dataSources.users.get(id);
      if (user) {
        return user;
      }

      throw new Error("Owner does not exist.");
    },

    async getOwner(this: ResolverContext, id: ObjectId): Promise<Owner | null> {
      let project = await this.dataSources.projects.get(id);
      if (project) {
        return project;
      }

      return this.getContext(id);
    },

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
