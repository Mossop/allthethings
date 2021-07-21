/* eslint-disable @typescript-eslint/naming-convention */
import type { MutationCreateGithubSearchArgs } from "#schema";
import type { AuthedGraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import { GitHubApi } from "./api";
import type { Account } from "./implementations";
import { Search } from "./implementations";
import type { Resolvers } from "./schema";
import type { GithubTransaction } from "./stores";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<GithubTransaction>>({
  User: {
    async githubAccounts(
      ctx: AuthedGraphQLCtx<GithubTransaction>,
    ): Promise<Account[]> {
      return ctx.transaction.stores.accounts.list({ userId: ctx.userId });
    },
  },

  Query: {
    async githubLoginUrl(
      ctx: AuthedGraphQLCtx<GithubTransaction>,
    ): Promise<string> {
      return GitHubApi.generateLoginUrl(ctx.transaction, ctx.userId);
    },
  },

  Mutation: {
    async createGithubSearch(
      ctx: AuthedGraphQLCtx<GithubTransaction>,
      { account: accountId, params }: MutationCreateGithubSearchArgs,
    ): Promise<Search> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return Search.create(ctx.transaction, account, params);
    },
  },
});
