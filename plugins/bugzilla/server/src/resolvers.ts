/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";
import { bestIcon, loadPageInfo } from "@allthethings/server";

import { Search, Account } from "./db/implementations";
import type { BugzillaAccountRecord } from "./db/types";
import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationDeleteBugzillaAccountArgs,
  MutationDeleteBugzillaSearchArgs,
} from "./schema";

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

    async deleteBugzillaAccount(
      outer: unknown,
      { account: accountId }: MutationDeleteBugzillaAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<boolean> {
      let account = await Account.get(ctx, accountId);
      if (!account) {
        return false;
      }

      await account.delete();
      return true;
    },

    async createBugzillaSearch(
      outer: unknown,
      { account: accountId, params: { name, query } }: MutationCreateBugzillaSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<Search> {
      let account = await Account.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(ctx, account, {
        name,
        ...account.normalizeQuery(query),
      });
    },

    async deleteBugzillaSearch(
      outer: unknown,
      { search: searchId }: MutationDeleteBugzillaSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<boolean> {
      let search = await Search.get(ctx, searchId);
      if (!search) {
        return false;
      }

      await search.delete();
      return true;
    },
  },
};

export default Resolvers;
