/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, GraphQLContext, User } from "@allthethings/server";
import BugzillaAPI from "bugzilla";

import { Account, Bug } from "./db/implementations";
import type { MutationCreateBugzillaAccountArgs, MutationSetItemTaskTypeArgs } from "./schema";
import { TaskType } from "./types";

const TaskTypes: string[] = [
  TaskType.None,
  TaskType.Manual,
  TaskType.Resolved,
  TaskType.Search,
];

const Resolvers: Resolver<GraphQLContext> = {
  User: {
    bugzillaAccounts(
      user: User,
      args: unknown,
      ctx: GraphQLContext,
    ): Promise<Account[]> {
      return Account.list(ctx, user.id());
    },
  },

  Mutation: {
    async createBugzillaAccount(
      outer: unknown,
      args: MutationCreateBugzillaAccountArgs,
      ctx: GraphQLContext,
    ): Promise<Account> {
      if (!ctx.userId) {
        throw new Error("Not authenticated.");
      }

      let api: BugzillaAPI;
      if (!args.username) {
        api = new BugzillaAPI(args.url);
        await api.version();
      } else {
        if (args.password) {
          api = new BugzillaAPI(args.url, args.username, args.password);
        } else {
          api = new BugzillaAPI(args.url, args.username);
        }

        await api.whoami();
      }

      return Account.create(ctx, ctx.userId, args);
    },

    async setItemTaskType(
      outer: unknown,
      { item, taskType }: MutationSetItemTaskTypeArgs,
      ctx: GraphQLContext,
    ): Promise<boolean> {
      let bug = await Bug.getForItem(ctx, item);
      if (!bug) {
        throw new Error("Unknown bug.");
      }

      if (!TaskTypes.includes(taskType)) {
        throw new Error(`Unknown task type ${taskType}`);
      }

      await bug.setTaskType(taskType as TaskType);

      return true;
    },
  },
};

export default Resolvers;
