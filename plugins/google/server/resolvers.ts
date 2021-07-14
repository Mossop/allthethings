/* eslint-disable @typescript-eslint/naming-convention */
import type { MutationCreateGoogleMailSearchArgs } from "#schema";
import type { AuthedPluginContext, User } from "#server-utils";

import { GoogleApi } from "./api";
import { Account, MailSearch } from "./db/implementations";
import { Resolvers } from "./schema";

const Resolvers: Pick<Resolvers<AuthedPluginContext>, "User" | "Query" | "Mutation"> = {
  User: {
    async googleAccounts(
      user: User,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<Account[]> {
      return Account.store.list(ctx, { userId: user.id() });
    },
  },

  Query: {
    async googleLoginUrl(
      outer: unknown,
      args: unknown,
      ctx: AuthedPluginContext,
    ): Promise<string> {
      return GoogleApi.generateAuthUrl(ctx);
    },
  },

  Mutation: {
    async createGoogleMailSearch(
      outer: unknown,
      { account: accountId, params }: MutationCreateGoogleMailSearchArgs,
      ctx: AuthedPluginContext,
    ): Promise<MailSearch> {
      let account = await Account.store.get(ctx, accountId);
      if (!account) {
        throw new Error("Unknown account.");
      }

      return MailSearch.create(ctx, account, params);
    },
  },
};

export default Resolvers;
