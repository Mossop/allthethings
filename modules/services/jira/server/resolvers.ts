/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateJiraAccountArgs,
  MutationCreateJiraSearchArgs,
  MutationDeleteJiraAccountArgs,
  MutationDeleteJiraSearchArgs,
  MutationEditJiraSearchArgs,
} from "#schema";
import type { AuthedGraphQLCtx, ServiceTransaction } from "#server/utils";
import { rootResolvers } from "#server/utils";

import { Account, Search } from "./implementations";
import type { Resolvers } from "./schema";

export default rootResolvers<Resolvers>({
  User: {
    jiraAccounts(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
    ): Promise<Account[]> {
      return Account.store(ctx.transaction).find({ userId: ctx.userId });
    },
  },

  Mutation: {
    async createJiraAccount(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { params }: MutationCreateJiraAccountArgs,
    ): Promise<Account> {
      return Account.create(ctx.transaction, ctx.userId, params);
    },

    async deleteJiraAccount(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { account: accountId }: MutationDeleteJiraAccountArgs,
    ): Promise<boolean> {
      let account = await Account.store(ctx.transaction).get(accountId);
      await account.delete();
      return true;
    },

    async createJiraSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { account: accountId, params }: MutationCreateJiraSearchArgs,
    ): Promise<Search> {
      let account = await Account.store(ctx.transaction).get(accountId);

      return Search.create(account, {
        accountId: account.id,
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editJiraSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { search: searchId, params }: MutationEditJiraSearchArgs,
    ): Promise<Search | null> {
      let search = await Search.store(ctx.transaction).get(searchId);

      await search.update({
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });

      await search.updateList();
      return search;
    },

    async deleteJiraSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { search: searchId }: MutationDeleteJiraSearchArgs,
    ): Promise<boolean> {
      let search = await Search.store(ctx.transaction).get(searchId);

      await search.delete();
      return true;
    },
  },
});
