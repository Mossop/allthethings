import { ObjectId } from "mongodb";

import type { User, NamedContext, Project } from "../db";
import type { AuthedParams, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type {
  MutationCreateNamedContextArgs,
  MutationCreateProjectArgs,
  MutationDeleteProjectArgs,
  MutationLoginArgs,
} from "./types";

function intoId(val: ObjectId | string): ObjectId;
function intoId(val: ObjectId | string | undefined | null): ObjectId | null;
function intoId(val: ObjectId | string | undefined | null): ObjectId | null {
  if (val === undefined || val === null) {
    return null;
  }

  if (typeof val === "string") {
    return new ObjectId(val);
  }
  return val;
}

const resolvers: MutationResolvers = {
  login: resolver(async ({
    args: { email, password },
    ctx,
  }: ResolverParams<unknown, MutationLoginArgs>): Promise<User | null> => {
    let user = await ctx.dataSources.users.verifyUser(email, password);

    if (!user) {
      user = await ctx.dataSources.users.create(email, password);
    }

    ctx.login(user);

    return user;
  }),

  logout: authed(async ({
    ctx,
  }: AuthedParams): Promise<boolean> => {
    ctx.logout();
    return true;
  }),

  createNamedContext: authed(({
    args: { params },
    ctx,
  }: AuthedParams<unknown, MutationCreateNamedContextArgs>): Promise<NamedContext> => {
    return ctx.dataSources.namedContexts.create(ctx.userId, params);
  }),

  createProject: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, MutationCreateProjectArgs>): Promise<Project> => {
    return ctx.dataSources.projects.create(ctx.userId, {
      ...params,
      owner: intoId(params.owner),
    });
  }),

  deleteProject: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, MutationDeleteProjectArgs>): Promise<boolean> => {
    await ctx.dataSources.projects.delete(intoId(id));
    return true;
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
