import type { ContextDbObject, UserDbObject } from "../db/types";
import type { AuthedParams, ResolverParams } from "./context";
import { authed, resolver } from "./context";
import type { QueryContextArgs, Resolvers } from "./types";

const resolvers: Resolvers["Query"] = {
  user: resolver(async ({
    ctx,
  }: ResolverParams): Promise<UserDbObject | null> => {
    if (!ctx.userId) {
      return null;
    }

    let user = await ctx.dataSources.users.get(ctx.userId);
    if (!user) {
      ctx.logout();
    }

    return user;
  }),

  context: authed(({
    args: { id },
    ctx,
  }: AuthedParams<unknown, QueryContextArgs>): Promise<ContextDbObject | null> => {
    return ctx.dataSources.contexts.get(id);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
