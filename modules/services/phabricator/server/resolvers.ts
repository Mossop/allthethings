/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreatePhabricatorAccountArgs,
  MutationUpdatePhabricatorAccountArgs,
  MutationDeletePhabricatorAccountArgs,
} from "../../../schema";
import type { AuthedGraphQLCtx, ServiceTransaction } from "#server/utils";
import { rootResolvers } from "#server/utils";

import type { QueryClass } from "./implementations";
import { Account, Query } from "./implementations";
import type { Resolvers } from "./schema";

export default rootResolvers<Resolvers>({
  User: {
    phabricatorAccounts(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
    ): Promise<Account[]> {
      return Account.store(ctx.transaction).find({ userId: ctx.userId });
    },

    phabricatorQueries(): QueryClass[] {
      return Object.values(Query.queries);
    },
  },

  Mutation: {
    async createPhabricatorAccount(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      {
        params: { url, apiKey, queries },
      }: MutationCreatePhabricatorAccountArgs,
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
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      {
        id,
        params: { url, apiKey, queries },
      }: MutationUpdatePhabricatorAccountArgs,
    ): Promise<Account | null> {
      let account = await Account.store(ctx.transaction).get(id);
      await account.update({
        url: url ?? undefined,
        apiKey: apiKey ?? undefined,
      });

      if (Array.isArray(queries)) {
        await Query.ensureQueries(account, queries);
      }

      return account;
    },

    async deletePhabricatorAccount(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { account: accountId }: MutationDeletePhabricatorAccountArgs,
    ): Promise<boolean> {
      let account = await Account.store(ctx.transaction).get(accountId);

      await account.delete();
      return true;
    },
  },
});
