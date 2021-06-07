/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { createAuthClient, generateAuthUrl } from "./api";
import { Account, MailSearch } from "./db/implementations";
import type { MutationCreateGoogleMailSearchArgs } from "./schema";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    async googleAccounts(
      _user: User,
      _args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.list(ctx, ctx.userId);
    },
  },

  Query: {
    async googleLoginUrl(
      outer: unknown,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<string> {
      let client = createAuthClient(ctx.pluginUrl);

      return generateAuthUrl(client, ctx.userId);
    },
  },

  Mutation: {
    async createGoogleMailSearch(
      outer: unknown,
      { account: accountId, params }: MutationCreateGoogleMailSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<MailSearch> {
      let account = await Account.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return MailSearch.create(ctx, account, params);
    },
  },
};

export default Resolvers;
