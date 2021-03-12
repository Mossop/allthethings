import type { ProjectRoot, TaskList, User } from "../db";
import type { AuthedParams, ResolverParams } from "./context";
import { authed, resolver } from "./context";
import type { QueryResolvers } from "./resolvers";
import type { QueryRootArgs, QueryTaskListArgs } from "./types";

const resolvers: QueryResolvers = {
  user: resolver(async ({
    ctx,
  }: ResolverParams): Promise<User | null> => {
    if (!ctx.userId) {
      return null;
    }

    let user = await ctx.dataSources.users.getImpl(ctx.userId);
    if (!user) {
      ctx.logout();
      return null;
    }

    return user;
  }),

  root: authed(({
    ctx,
    args: { id },
  }: AuthedParams<unknown, QueryRootArgs>): Promise<ProjectRoot | null> => {
    return ctx.getRoot(id);
  }),

  taskList: authed(({
    ctx,
    args: { id },
  }: AuthedParams<unknown, QueryTaskListArgs>): Promise<TaskList | null> => {
    return ctx.getTaskList(id);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
