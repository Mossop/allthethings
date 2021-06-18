import type { Awaitable, Overwrite } from "@allthethings/utils";

import type { ProjectRoot, AppDataSources, TaskList, User } from "../db";
import type { DatabaseConnection } from "../db/connection";
import type { WebServerContext } from "../webserver/context";
import type { ResolverFn } from "./resolvers";

export interface ResolverContext {
  db: DatabaseConnection;
  userId: string | null;
  dataSources: AppDataSources;
  getRoot: (id: string) => Promise<ProjectRoot | null>;
  getTaskList: (id: string) => Promise<TaskList | null>;
  login: (user: User) => void;
  logout: () => void;
}

export type AuthedResolverContext = Overwrite<ResolverContext, {
  userId: string;
}>;

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
> = Params<AuthedResolverContext, TParent, TArgs>;

export function admin<TResult, TParent, TArgs>(
  resolver: (ctx: AuthedResolverContext, args: TArgs, parent: TParent) => Awaitable<TResult>,
): ResolverFn<TResult, TParent, ResolverContext, TArgs> {
  return async (outer: TParent, args: TArgs, ctx: ResolverContext): Promise<TResult> => {
    let { userId } = ctx;
    if (!userId) {
      throw new Error("Not logged in.");
    }

    let userRecord = await ctx.dataSources.users.getRecord(userId);
    if (!userRecord?.isAdmin) {
      throw new Error("Not an admin.");
    }

    return resolver(ctx as AuthedResolverContext, args, outer);
  };
}

export function authed<TResult, TParent, TArgs>(
  resolver: (ctx: AuthedResolverContext, args: TArgs, parent: TParent) => Awaitable<TResult>,
): ResolverFn<TResult, TParent, ResolverContext, TArgs> {
  return (outer: TParent, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    let { userId } = ctx;
    if (!userId) {
      throw new Error("Not logged in.");
    }

    return resolver(ctx as AuthedResolverContext, args, outer);
  };
}

export function resolver<TResult, TParent, TArgs>(
  resolver: (ctx: ResolverContext, args: TArgs, parent: TParent) => Awaitable<TResult>,
): ResolverFn<TResult, TParent, ResolverContext, TArgs> {
  return (outer: TParent, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    return resolver(ctx, args, outer);
  };
}

export async function buildResolverContext({
  ctx,
}: { ctx: WebServerContext }): Promise<Omit<ResolverContext, "dataSources">> {
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
      let context = await this.dataSources.contexts.getImpl(id);
      if (context) {
        return context;
      }

      let user = await this.dataSources.users.getImpl(id);
      if (user) {
        return user;
      }

      return null;
    },

    async getTaskList(this: ResolverContext, id: string): Promise<TaskList | null> {
      let project = await this.dataSources.projects.getImpl(id);
      if (project) {
        return project;
      }

      return this.getRoot(id);
    },

    login(this: ResolverContext, user: User): void {
      if (!ctx.session) {
        throw new Error("Session is not initialized.");
      }

      this.userId = user.id();
      ctx.session.userId = user.id();
      ctx.session.save();
    },

    logout(this: ResolverContext): void {
      this.userId = null;

      if (!ctx.session) {
        return;
      }

      ctx.session.userId = null;
      ctx.session.save();
    },
  };
}
