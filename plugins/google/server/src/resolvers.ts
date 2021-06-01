/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "@allthethings/server";

import { createAuthClient, generateAuthUrl } from "./auth";
import { Account } from "./db/implementations";
import type { GooglePluginConfig } from "./types";

export default function buildResolvers(config: GooglePluginConfig): Resolver<AuthedPluginContext> {
  return {
    User: {
      async googleAccounts(
        _user: User,
        _args: unknown,
        ctx: AuthedPluginContext,
      ): Promise<Account[]> {
        return Account.list(config, ctx, ctx.userId);
      },
    },

    Query: {
      async googleLoginUrl(
        outer: unknown,
        args: unknown,
        ctx: AuthedPluginContext,
      ): Promise<string> {
        let client = createAuthClient(config, ctx.pluginUrl);

        return generateAuthUrl(client, ctx.userId);
      },
    },
  };
}
