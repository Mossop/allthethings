import type { Context, Owner, User } from "../db";
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

    let user = await ctx.dataSources.users.getOne(ctx.userId);
    if (!user) {
      ctx.logout();
      return null;
    }

    return user;
  }),

  context: authed(({
    ctx,
    args: { id },
  }: AuthedParams<unknown, QueryOwnerArgs>): Promise<Context | null> => {
    return ctx.getContext(id);
  }),

  owner: authed(({
    ctx,
    args: { id },
  }: AuthedParams<unknown, QueryOwnerArgs>): Promise<Owner | null> => {
    return ctx.getOwner(id);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
