/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, GraphQLContext, User } from "@allthethings/types";

import { Account } from "./db/implementations";
import type { MutationCreateBugzillaAccountArgs } from "./schema";

const Resolvers: Resolver<GraphQLContext> = {
  User: {
    bugzillaAccounts(
      user: User,
      args: unknown,
      ctx: GraphQLContext,
    ): Promise<Account[]> {
      return Account.list(ctx, user.id);
    },
  },

  Mutation: {
    async createBugzillaAccount(
      outer: unknown,
      args: MutationCreateBugzillaAccountArgs,
      ctx: GraphQLContext,
    ): Promise<Account> {
      if (!ctx.userId) {
        throw new Error("Not authenticated.");
      }

      return Account.create(ctx, ctx.userId, args);
    },
  },
};

export default Resolvers;
