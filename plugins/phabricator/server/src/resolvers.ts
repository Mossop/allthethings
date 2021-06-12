/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { Account, Query } from "./db/implementations";
import type {
  MutationCreatePhabricatorAccountArgs,
  MutationDeletePhabricatorAccountArgs,
  PhabricatorQuery,
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

    phabricatorQueries(): PhabricatorQuery[] {
      return Query.queries;
    },
  },

  Mutation: {
    async createPhabricatorAccount(
      outer: unknown,
      { params: { url, apiKey, queries } }: MutationCreatePhabricatorAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account> {
      return Account.create(ctx, ctx.userId, {
        url,
        apiKey,
        queries,
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
