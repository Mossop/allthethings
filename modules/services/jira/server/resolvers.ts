/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateJiraAccountArgs,
  MutationCreateJiraSearchArgs,
  MutationDeleteJiraAccountArgs,
  MutationDeleteJiraSearchArgs,
  MutationEditJiraSearchArgs,
} from "#schema";
import type { AuthedGraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import { Account, Search } from "./implementations";
import type { Resolvers } from "./schema";
import type { JiraTransaction } from "./stores";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<JiraTransaction>>({
  User: {
    jiraAccounts(ctx: AuthedGraphQLCtx<JiraTransaction>): Promise<Account[]> {
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
      { account: accountId, params }: MutationCreateJiraSearchArgs,
    ): Promise<Search> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(account, {
        accountId: account.id,
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editJiraSearch(
      ctx: AuthedGraphQLCtx<JiraTransaction>,
      { search: searchId, params }: MutationEditJiraSearchArgs,
    ): Promise<Search | null> {
      let search = await ctx.transaction.stores.searches.get(searchId);
      if (!search) {
        return null;
      }

      await ctx.transaction.stores.searches.updateOne(searchId, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });

      await search.update();
      return search;
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
