/* eslint-disable @typescript-eslint/naming-convention */
import type { MutationCreateGoogleMailSearchArgs } from "#schema";
import type { Resolver, AuthedPluginContext, User } from "#server-utils";

import { GoogleApi } from "./api";
import { Account, MailSearch } from "./db/implementations";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    async googleAccounts(
      _user: User,
      _args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: ctx.userId });
    },
  },

  Query: {
    async googleLoginUrl(
      outer: unknown,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<string> {
      return GoogleApi.generateAuthUrl(ctx);
    },
  },

  Mutation: {
    async createGoogleMailSearch(
      outer: unknown,
      { account: accountId, params }: MutationCreateGoogleMailSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<MailSearch> {
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return MailSearch.create(ctx, account, params);
    },
  },
};

export default Resolvers;
