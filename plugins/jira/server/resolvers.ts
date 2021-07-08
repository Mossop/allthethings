/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "#server-utils";

import { Account, Search } from "./db/implementation";
import type {
  MutationCreateJiraAccountArgs,
  MutationCreateJiraSearchArgs,
  MutationDeleteJiraAccountArgs,
  MutationDeleteJiraSearchArgs,
} from "./schema";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    jiraAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
    },
  },

  Mutation: {
    async createJiraAccount(
      outer: unknown,
      { params }: MutationCreateJiraAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account> {
      return Account.create(ctx, ctx.userId, params);
    },

    async deleteJiraAccount(
      outer: unknown,
      { account: accountId }: MutationDeleteJiraAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<boolean> {
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        return false;
      }

      await account.delete();
      return true;
    },

    async createJiraSearch(
      outer: unknown,
      { account: accountId, params: { name, query } }: MutationCreateJiraSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<Search> {
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(account, {
        name,
        ownerId: account.id,
        query,
      });
    },

    async deleteJiraSearch(
      outer: unknown,
      { search: searchId }: MutationDeleteJiraSearchArgs,
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
