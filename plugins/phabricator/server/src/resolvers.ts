/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { Account } from "./db/implementations";
import type {
  MutationCreatePhabricatorAccountArgs,
  MutationDeletePhabricatorAccountArgs,
} from "./schema";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    phabricatorAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
    },
  },

  Mutation: {
    async createPhabricatorAccount(
      outer: unknown,
      { params: { url, apiKey } }: MutationCreatePhabricatorAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account> {
      return Account.create(ctx, ctx.userId, {
        url,
        apiKey,
      });
    },

    async deletePhabricatorAccount(
      outer: unknown,
      { account: accountId }: MutationDeletePhabricatorAccountArgs,
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
