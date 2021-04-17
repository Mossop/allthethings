/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type { Resolver, GraphQLContext, User } from "@allthethings/server";
import { bestIcon, loadPageInfo } from "@allthethings/server";

import type { BugzillaAccountRecord } from "./db/implementations";
import { Search, Account, Bug } from "./db/implementations";
import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationSetItemTaskTypeArgs,
} from "./schema";
import { SearchType, TaskType } from "./types";

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

      let record: Omit<BugzillaAccountRecord, "id" | "icon" | "user"> = {
        url,
        name,
        username,
        password,
      };

      let api = Account.buildAPI(record);
      if (username) {
        await api.whoami();
      } else {
        await api.version();
      }

      let info = await loadPageInfo(new URL(url));
      let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

      return Account.create(ctx, ctx.userId, {
        ...record,
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

      let searchType = params.type as SearchType;
      let query = account.normalizeQuery(params.query);
      let queryStr: string;
      let entries = [...query.entries()];
      if (entries.length == 1 && entries[0][0] == "quicksearch") {
        queryStr = entries[0][1];
        searchType = SearchType.Quicksearch;
      } else {
        queryStr = query.toString();
      }

      let bugs = await Search.getBugs(account.getAPI(), {
        type: searchType,
        query: queryStr,
      });

      let search = await Search.create(ctx, account, params);
      let { changedIds } = await search.update(bugs);
      for (let id of changedIds) {
        let bug = await Bug.get(account, id);
        if (bug) {
          await bug.updateSearchStatus();
        }
      }

      return search;
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
