/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateJiraAccountArgs,
  MutationCreateJiraSearchArgs,
  MutationDeleteJiraAccountArgs,
  MutationDeleteJiraSearchArgs,
} from "#schema";
import type { AuthedGraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import { Account, Search } from "./implementations";
import type { Resolvers } from "./schema";
import type { JiraTransaction } from "./stores";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<JiraTransaction>>({
  User: {
    jiraAccounts(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
    ): Promise<Account[]> {
      return ctx.transaction.stores.accounts.list({ userId: ctx.userId });
    },
  },

  Mutation: {
    async createJiraAccount(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
      { params }: MutationCreateJiraAccountArgs,
    ): Promise<Account> {
      return Account.create(ctx.transaction, ctx.userId, params);
    },

    async deleteJiraAccount(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
      { account: accountId }: MutationDeleteJiraAccountArgs,
    ): Promise<boolean> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        return false;
      }

      await account.delete();
      return true;
    },

    async createJiraSearch(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
      { account: accountId, params: { name, query } }: MutationCreateJiraSearchArgs,
    ): Promise<Search> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(account, {
        name,
        accountId: account.id,
        query,
      });
    },

    async deleteJiraSearch(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
      { search: searchId }: MutationDeleteJiraSearchArgs,
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
