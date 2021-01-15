import { ObjectId } from "mongodb";

import type { NamedContext, Project, User } from "../db";
import type { AuthedParams, ResolverParams } from "./context";
import { authed, resolver } from "./context";
import type { QueryResolvers } from "./resolvers";
import type { QueryOwnerArgs } from "./types";

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

  owner: authed(({
    ctx,
    args: { id },
  }: AuthedParams<unknown, QueryOwnerArgs>): Promise<User | Project | NamedContext> => {
    return ctx.getOwner(new ObjectId(id));
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
