import type { Awaitable, Overwrite } from "#utils";

import type { AppDataSources, TaskList, User, ItemHolder } from "../db";
import type { DatabaseConnection } from "../db/connection";
import type { WebServerContext } from "../webserver/context";
import type { ResolverFn } from "./resolvers";
import type { Root } from "./types";

export interface ResolverContext {
  db: DatabaseConnection;
  userId: string | null;
  dataSources: AppDataSources;
  getUser(id: string | null): Promise<User>;
  getTaskList(id: string): Promise<TaskList | null>;
  getSection(id: string): Promise<ItemHolder | null>;
  login: (user: User) => void;
  logout: () => void;
}

export type AuthedResolverContext = Overwrite<ResolverContext, {
  userId: string;
}>;

export function admin<TResult, TArgs>(
  resolver: (ctx: AuthedResolverContext, args: TArgs) => Awaitable<TResult>,
): ResolverFn<TResult, Root, ResolverContext, TArgs> {
  return async (outer: Root, args: TArgs, ctx: ResolverContext): Promise<TResult> => {
    let { userId } = ctx;
    if (!userId) {
      throw new Error("Not logged in.");
    }

    let userRecord = await ctx.dataSources.users.getRecord(userId);
    if (!userRecord?.isAdmin) {
      throw new Error("Not an admin.");
    }

    return resolver(ctx as AuthedResolverContext, args);
  };
}

export function authed<TResult, TArgs>(
  resolver: (ctx: AuthedResolverContext, args: TArgs) => Awaitable<TResult>,
): ResolverFn<TResult, Root, ResolverContext, TArgs> {
  return (outer: Root, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    let { userId } = ctx;
    if (!userId) {
      throw new Error("Not logged in.");
    }

    return resolver(ctx as AuthedResolverContext, args);
  };
}

export function resolver<TResult, TArgs>(
  resolver: (ctx: ResolverContext, args: TArgs) => Awaitable<TResult>,
): ResolverFn<TResult, Root, ResolverContext, TArgs> {
  return (outer: Root, args: TArgs, ctx: ResolverContext): Promise<TResult> | TResult => {
    return resolver(ctx, args);
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

    async getUser(this: ResolverContext, id: string | null): Promise<User> {
      if (!this.userId) {
        throw new Error("Can only call on an authenticated context.");
      }

      id = id ?? this.userId;
      let user = await this.dataSources.users.getImpl(id);
      if (!user) {
        throw new Error("Unknown user.");
      }

      return user;
    },

    async getTaskList(this: ResolverContext, id: string): Promise<TaskList | null> {
      if (!this.userId) {
        throw new Error("Can only call on an authenticated context.");
      }

      let user = await this.dataSources.users.getImpl(this.userId);
      if (!user) {
        throw new Error("User is unknown.");
      }

      let project = await this.dataSources.projects.getImpl(id);
      if (project) {
        return project;
      }

      let context = await this.dataSources.contexts.getImpl(id);
      if (context) {
        return context;
      }

      return null;
    },

    async getSection(this: ResolverContext, id: string): Promise<ItemHolder | null> {
      let taskList = await this.getTaskList(id);
      if (taskList) {
        return taskList;
      }

      return this.dataSources.sections.getImpl(id);
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
