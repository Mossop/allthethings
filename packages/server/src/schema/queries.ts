/* eslint-disable @typescript-eslint/typedef */
import type { ProjectRoot, TaskList, User } from "../db";
import { admin, authed, resolver } from "./context";
import type { QueryResolvers } from "./resolvers";

const resolvers: QueryResolvers = {
  user: resolver(async (ctx): Promise<User | null> => {
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

  users: admin(async (ctx): Promise<User[]> => {
    return ctx.dataSources.users.find({});
  }),

  root: authed((ctx, { id }): Promise<ProjectRoot | null> => {
    return ctx.getRoot(id);
  }),

  taskList: authed((ctx, { id }): Promise<TaskList | null> => {
    return ctx.getTaskList(id);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
