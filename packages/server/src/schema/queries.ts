import type { User } from "../db";
import type { ResolverParams } from "./context";
import { resolver } from "./context";
import type { QueryResolvers } from "./resolvers";

const resolvers: QueryResolvers = {
  user: resolver(async ({
    ctx,
  }: ResolverParams): Promise<User | null> => {
    if (!ctx.userId) {
      return null;
    }

    let user = await ctx.dataSources.users.get(ctx.userId);
    if (!user) {
      ctx.logout();
      return null;
    }

    return user;
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
