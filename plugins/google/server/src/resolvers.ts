/* eslint-disable @typescript-eslint/naming-convention */
import type { Resolver, GraphQLContext, User } from "@allthethings/server";

import type { Account } from "./db/implementations";

const Resolvers: Resolver<GraphQLContext> = {
  User: {
    async googleAccounts(
      _user: User,
      _args: unknown,
      _ctx: GraphQLContext,
    ): Promise<Account[]> {
      return [];
    },
  },
};

export default Resolvers;
