import type Koa from "koa";

import type { ProjectRoot, AppDataSources, TaskList, User } from "../db";
import type { DatabaseConnection } from "../db/connection";
import type { AppContext } from "../webserver/context";
import type { ResolverFn } from "./resolvers";

export interface BaseContext {
  db: DatabaseConnection;
  userId: string | null;
  getRoot: (id: string) => Promise<ProjectRoot | null>;
  getTaskList: (id: string) => Promise<TaskList | null>;
  login: (user: User) => void;
  logout: () => void;
}

export type ResolverContext = BaseContext & {
  dataSources: AppDataSources;
};

type AuthedContext = Omit<ResolverContext, "userId"> & {
  userId: string;
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

export async function buildContext({
  ctx,
}: { ctx: AppContext & Koa.Context }): Promise<BaseContext> {
  let user = ctx.session?.userId ?? null;

  if (!ctx.db.isInTransaction) {
    await ctx.db.startTransaction();
  }

  return {
    userId: user,

    get db(): DatabaseConnection {
      return ctx.db;
    },

    async getRoot(this: ResolverContext, id: string): Promise<ProjectRoot | null> {
      let context = await this.dataSources.contexts.getOne(id);
      if (context) {
        return context;
      }

      let user = await this.dataSources.users.getOne(id);
      if (user) {
        return user;
      }

      return null;
    },

    async getTaskList(this: ResolverContext, id: string): Promise<TaskList | null> {
      let project = await this.dataSources.projects.getOne(id);
      if (project) {
        return project;
      }

      return this.getRoot(id);
    },

    login(user: User): void {
      if (!ctx.session) {
        throw new Error("Session is not initialized.");
      }

      this.userId = user.id;
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
  } as BaseContext;
}
