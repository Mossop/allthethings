/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";
import { bestIcon, loadPageInfo } from "@allthethings/server";

import { Search, Account } from "./db/implementations";
import type { BugzillaAccountRecord } from "./db/types";
import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
} from "./schema";
import { SearchType } from "./types";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    bugzillaAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.list(ctx, user.id());
    },
  },

  Mutation: {
    async createBugzillaAccount(
      outer: unknown,
      { params: { url, name, username, password } }: MutationCreateBugzillaAccountArgs,
      ctx: AuthedPluginContext,
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
      ctx: AuthedPluginContext,
    ): Promise<Search> {
      if (!ctx.userId) {
        throw new Error("Not authenticated.");
      }

      let account = await Account.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      let searchType = params.type as SearchType;
      let queryStr = params.query;

      if (searchType == SearchType.Advanced) {
        let query = account.normalizeQuery(params.query);
        let entries = [...query.entries()];
        if (entries.length == 1 && entries[0][0] == "quicksearch") {
          queryStr = entries[0][1];
          searchType = SearchType.Quicksearch;
        } else {
          queryStr = query.toString();
        }
      }

      return Search.create(ctx, account, {
        name: params.name,
        query: queryStr,
        type: searchType,
      });
    },
  },
};

export default Resolvers;
