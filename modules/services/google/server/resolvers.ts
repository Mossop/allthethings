/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateGoogleMailSearchArgs,
  MutationDeleteGoogleMailSearchArgs,
  MutationEditGoogleMailSearchArgs,
} from "#schema";
import type { AuthedGraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import { GoogleApi } from "./api";
import type { Account } from "./implementations";
import { MailSearch } from "./implementations";
import type { Resolvers } from "./schema";
import type { GoogleTransaction } from "./stores";

export default rootResolvers<Resolvers, AuthedGraphQLCtx<GoogleTransaction>>({
  User: {
    async googleAccounts(
      ctx: AuthedGraphQLCtx<GoogleTransaction>,
    ): Promise<Account[]> {
      return ctx.transaction.stores.accounts.list({ userId: ctx.userId });
    },
  },

  Query: {
    async googleLoginUrl(
      ctx: AuthedGraphQLCtx<GoogleTransaction>,
    ): Promise<string> {
      return GoogleApi.generateAuthUrl(ctx.transaction, ctx.userId);
    },
  },

  Mutation: {
    async createGoogleMailSearch(
      ctx: AuthedGraphQLCtx<GoogleTransaction>,
      { account: accountId, params }: MutationCreateGoogleMailSearchArgs,
    ): Promise<MailSearch> {
      let account = await ctx.transaction.stores.accounts.get(accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return MailSearch.create(account, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editGoogleMailSearch(
      ctx: AuthedGraphQLCtx<GoogleTransaction>,
      { id, params }: MutationEditGoogleMailSearchArgs,
    ): Promise<MailSearch | null> {
      let search = await ctx.transaction.stores.mailSearches.get(id);
      if (!search) {
        return null;
      }

      await ctx.transaction.stores.mailSearches.updateOne(id, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });

      await search.update();

      return search;
    },

    async deleteGoogleMailSearch(
      ctx: AuthedGraphQLCtx<GoogleTransaction>,
      { id }: MutationDeleteGoogleMailSearchArgs,
    ): Promise<boolean> {
      let search = await ctx.transaction.stores.mailSearches.get(id);
      if (!search) {
        return false;
      }

      await search.delete();
      return true;
    },
  },
});
