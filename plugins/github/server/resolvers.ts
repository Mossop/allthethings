/* eslint-disable @typescript-eslint/naming-convention */
import type { MutationCreateGithubSearchArgs } from "#schema";
import type { AuthedPluginContext, User } from "#server-utils";

import { GitHubApi } from "./api";
import { Search, Account } from "./db/implementations";
import { Resolvers } from "./schema";

const Resolvers: Pick<Resolvers<AuthedPluginContext>, "User" | "Query" | "Mutation"> = {
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

  Mutation: {
    async createGithubSearch(
      outer: unknown,
      { account: accountId, params }: MutationCreateGithubSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<Search> {
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(ctx, account, params);
    },
  },
};

export default Resolvers;
