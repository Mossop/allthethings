/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type { Resolver, GraphQLContext, User } from "@allthethings/server";
import { bestIcon, loadPageInfo } from "@allthethings/server";
import BugzillaAPI from "bugzilla";

import { Search, Account, Bug } from "./db/implementations";
import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationSetItemTaskTypeArgs,
} from "./schema";
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
      { params: { url, name, username, password } }: MutationCreateBugzillaAccountArgs,
      ctx: GraphQLContext,
    ): Promise<Account> {
      if (!ctx.userId) {
        throw new Error("Not authenticated.");
      }

      let info = await loadPageInfo(new URL(url));
      let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

      let api: BugzillaAPI;
      if (!username) {
        api = new BugzillaAPI(url);
        await api.version();
      } else {
        if (password) {
          api = new BugzillaAPI(url, username, password);
        } else {
          api = new BugzillaAPI(url, username);
        }

        await api.whoami();
      }

      return Account.create(ctx, ctx.userId, {
        url,
        name,
        username,
        password,
        icon,
      });
    },

    async createBugzillaSearch(
      outer: unknown,
      { account: accountId, params }: MutationCreateBugzillaSearchArgs,
      ctx: GraphQLContext,
    ): Promise<Search> {
      if (!ctx.userId) {
        throw new Error("Not authenticated.");
      }

      let account = await Account.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(ctx, account, params);
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
