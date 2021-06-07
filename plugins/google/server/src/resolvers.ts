/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { createAuthClient, generateAuthUrl } from "./api";
import { Account } from "./db/implementations";

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
};

export default Resolvers;
