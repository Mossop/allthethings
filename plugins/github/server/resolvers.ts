/* eslint-disable @typescript-eslint/naming-convention */
import type { AuthedPluginContext, User } from "#server-utils";

import { GitHubApi } from "./api";
import { Account } from "./db/implementations";
import { Resolvers } from "./schema";

const Resolvers: Pick<Resolvers<AuthedPluginContext>, "User" | "Query"> = {
  User: {
    async githubAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
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
};

export default Resolvers;
