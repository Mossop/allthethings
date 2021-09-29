/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateGithubSearchArgs,
  MutationDeleteGithubSearchArgs,
  MutationEditGithubSearchArgs,
} from "../../../schema";
import type {
  AuthedGraphQLCtx,
  ServiceTransaction,
} from "../../../server/utils";
import { rootResolvers } from "../../../server/utils";
import { GitHubApi } from "./api";
import { Account, Search } from "./implementations";
import type { Resolvers } from "./schema";

export default rootResolvers<Resolvers>({
  User: {
    async githubAccounts(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
    ): Promise<Account[]> {
      return Account.store(ctx.transaction).find({ userId: ctx.userId });
    },
  },

  Query: {
    async githubLoginUrl(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
    ): Promise<string> {
      return GitHubApi.generateLoginUrl(ctx.transaction, ctx.userId);
    },
  },

  Mutation: {
    async createGithubSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { account: accountId, params }: MutationCreateGithubSearchArgs,
    ): Promise<Search> {
      let account = await Account.store(ctx.transaction).get(accountId);

      return Search.create(ctx.transaction, account, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editGithubSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { search: searchId, params }: MutationEditGithubSearchArgs,
    ): Promise<Search | null> {
      let search = await Search.store(ctx.transaction).get(searchId);

      await search.update({
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
      await search.updateList();
      return search;
    },

    async deleteGithubSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { search: searchId }: MutationDeleteGithubSearchArgs,
    ): Promise<boolean> {
      let search = await Search.store(ctx.transaction).get(searchId);
      await search.delete();
      return true;
    },
  },
});
