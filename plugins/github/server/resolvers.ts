/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, AuthedPluginContext, User } from "#server-utils";

import { GitHubApi } from "./api";
import { Account } from "./db/implementations";

const Resolvers: Resolver<AuthedPluginContext> = {
  User: {
    async githubAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: ctx.userId });
    },
  },

  Query: {
    async githubLoginUrl(
      outer: unknown,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<string> {
      return GitHubApi.generateLoginUrl(ctx);
    },
  },

  Mutation: {
  },
};

export default Resolvers;
