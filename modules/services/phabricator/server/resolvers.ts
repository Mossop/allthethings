/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreatePhabricatorAccountArgs,
  MutationUpdatePhabricatorAccountArgs,
  MutationDeletePhabricatorAccountArgs,
} from "#schema";
import type { AuthedGraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import type { QueryClass } from "./implementations";
import { Account, Query } from "./implementations";
import type { Resolvers } from "./schema";
import type { PhabricatorTransaction } from "./stores";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<PhabricatorTransaction>>({
  User: {
    phabricatorAccounts(
      ctx: AuthedGraphQLCtx<PhabricatorTransaction>,
    ): Promise<Account[]> {
      return ctx.transaction.stores.accounts.list({ userId: ctx.userId });
    },

    phabricatorQueries(): QueryClass[] {
      return Object.values(Query.queries);
    },
  },

  Mutation: {
    async createPhabricatorAccount(
      ctx: AuthedGraphQLCtx<PhabricatorTransaction>,
      { params: { url, apiKey, queries } }: MutationCreatePhabricatorAccountArgs,
    ): Promise<Account> {
      let account = await Account.create(ctx.transaction, ctx.userId, {
        url,
        apiKey,
        queries,
      });

      await Query.ensureQueries(account, queries);

      return account;
    },

    async updatePhabricatorAccount(
      ctx: AuthedGraphQLCtx<PhabricatorTransaction>,
      { id, params: { url, apiKey, queries } }: MutationUpdatePhabricatorAccountArgs,
    ): Promise<Account | null> {
      let account = await ctx.transaction.stores.accounts.updateOne(id, {
        url: url ?? undefined,
        apiKey: apiKey ?? undefined,
      });

      if (!account) {
        return null;
      }

      if (Array.isArray(queries)) {
        await Query.ensureQueries(account, queries);
      }

      return account;
    },

    async deletePhabricatorAccount(
      ctx: AuthedGraphQLCtx<PhabricatorTransaction>,
      { account: accountId }: MutationDeletePhabricatorAccountArgs,
    ): Promise<boolean> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        return false;
      }

      await account.delete();
      return true;
    },
  },
});
