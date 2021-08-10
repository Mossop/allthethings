/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationDeleteBugzillaAccountArgs,
  MutationDeleteBugzillaSearchArgs,
} from "#schema";
import type { AuthedGraphQLCtx, GraphQLCtx } from "#server/utils";
import { rootResolvers, bestIcon, loadPageInfo } from "#server/utils";

import { Search, Account } from "./implementations";
import type { Resolvers } from "./schema";
import type { BugzillaTransaction } from "./stores";
import type { BugzillaAccountRecord } from "./types";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<BugzillaTransaction>>({
  User: {
    bugzillaAccounts(
      ctx: AuthedGraphQLCtx<BugzillaTransaction>,
    ): Promise<Account[]> {
      return ctx.transaction.stores.accounts.list({ userId: ctx.userId });
    },
  },

  Mutation: {
    async createBugzillaAccount(
      ctx: AuthedGraphQLCtx<BugzillaTransaction>,
      {
        params: { url, name, username, password },
      }: MutationCreateBugzillaAccountArgs,
    ): Promise<Account> {
      let record: Omit<BugzillaAccountRecord, "id" | "icon" | "userId"> = {
        url,
        name,
        username: username ?? null,
        password: password ?? null,
      };

      let api = Account.buildAPI(record);
      if (username) {
        await api.whoami();
      } else {
        await api.version();
      }

      let info = await loadPageInfo(new URL(url));
      let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

      return Account.create(ctx.transaction, ctx.userId, {
        ...record,
        icon,
      });
    },

    async deleteBugzillaAccount(
      ctx: GraphQLCtx<BugzillaTransaction>,
      { account: accountId }: MutationDeleteBugzillaAccountArgs,
    ): Promise<boolean> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        return false;
      }

      await account.delete();
      return true;
    },

    async createBugzillaSearch(
      ctx: GraphQLCtx<BugzillaTransaction>,
      {
        account: accountId,
        params: { name, query },
      }: MutationCreateBugzillaSearchArgs,
    ): Promise<Search> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(account, {
        name,
        accountId: account.id,
        ...account.normalizeQuery(query),
      });
    },

    async deleteBugzillaSearch(
      ctx: GraphQLCtx<BugzillaTransaction>,
      { search: searchId }: MutationDeleteBugzillaSearchArgs,
    ): Promise<boolean> {
      let search = await ctx.transaction.stores.searches.get(searchId);
      if (!search) {
        return false;
      }

      await search.delete();
      return true;
    },
  },
});
