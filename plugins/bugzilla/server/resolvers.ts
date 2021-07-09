/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationDeleteBugzillaAccountArgs,
  MutationDeleteBugzillaSearchArgs,
} from "#schema";
import type { Resolver, AuthedPluginContext, User } from "#server-utils";
import { bestIcon, loadPageInfo } from "#server-utils";

import { Search, Account } from "./db/implementations";
import type { BugzillaAccountRecord } from "./db/types";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    bugzillaAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
    },
  },

  Mutation: {
    async createBugzillaAccount(
      outer: unknown,
      { params: { url, name, username, password } }: MutationCreateBugzillaAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account> {
      let record: Omit<BugzillaAccountRecord, "id" | "icon" | "userId"> = {
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
      let account = await Account.store.get(ctx, accountId);
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
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(account, {
        name,
        ownerId: account.id,
        ...account.normalizeQuery(query),
      });
    },

    async deleteBugzillaSearch(
      outer: unknown,
      { search: searchId }: MutationDeleteBugzillaSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<boolean> {
      let search = await Search.store.get(ctx, searchId);
      if (!search) {
        return false;
      }

      await search.delete();
      return true;
    },
  },
};

export default Resolvers;
