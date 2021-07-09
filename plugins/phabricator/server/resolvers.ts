/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreatePhabricatorAccountArgs,
  MutationUpdatePhabricatorAccountArgs,
  MutationDeletePhabricatorAccountArgs,
} from "#schema";
import type { Resolver, AuthedPluginContext, User } from "#server-utils";

import type { QueryClass } from "./db/implementations";
import { Account, Query } from "./db/implementations";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    phabricatorAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
    },

    phabricatorQueries(): QueryClass[] {
      return Object.values(Query.queries);
    },
  },

  Mutation: {
    async createPhabricatorAccount(
      outer: unknown,
      { params: { url, apiKey, queries } }: MutationCreatePhabricatorAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account> {
      let account = await Account.create(ctx, ctx.userId, {
        url,
        apiKey,
        queries,
      });

      await Query.ensureQueries(account, queries);

      return account;
    },

    async updatePhabricatorAccount(
      outer: unknown,
      { id, params: { url, apiKey, queries } }: MutationUpdatePhabricatorAccountArgs,
      ctx: AuthedPluginContext,
    ): Promise<Account | null> {
      let account = await Account.store.update(ctx, {
        id,
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
