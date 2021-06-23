/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { Account } from "./db/implementation";
import type { MutationCreateJiraAccountArgs, MutationDeleteJiraAccountArgs } from "./schema";

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
  },
};

export default Resolvers;
