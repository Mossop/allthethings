/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateGithubSearchArgs,
  MutationDeleteGithubSearchArgs,
  MutationEditGithubSearchArgs,
} from "#schema";
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

      return Search.create(ctx.transaction, account, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editGithubSearch(
      ctx: AuthedGraphQLCtx<GithubTransaction>,
      { search: searchId, params }: MutationEditGithubSearchArgs,
    ): Promise<Search | null> {
      let search = await ctx.transaction.stores.searches.get(searchId);
      if (!search) {
        return null;
      }

      await ctx.transaction.stores.searches.updateOne(searchId, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
      await search.update();
      return search;
    },

    async deleteGithubSearch(
      ctx: AuthedGraphQLCtx<GithubTransaction>,
      { search: searchId }: MutationDeleteGithubSearchArgs,
    ): Promise<boolean> {
      let search = await ctx.transaction.stores.searches.get(searchId);
      if (!search) {
        return false;
      }

      await search.delete();
      return true;
    },
  },
});
