import type { User, NamedContext, Project } from "../db";
import type { AuthedParams, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type {
  MutationCreateNamedContextArgs,
  MutationCreateProjectArgs,
  MutationDeleteNamedContextArgs,
  MutationDeleteProjectArgs,
  MutationLoginArgs,
  MutationMoveProjectArgs,
} from "./types";

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

  deleteNamedContext: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, MutationDeleteNamedContextArgs>): Promise<boolean> => {
    await ctx.dataSources.namedContexts.delete(id);
    return true;
  }),

  createProject: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, MutationCreateProjectArgs>): Promise<Project> => {
    return ctx.dataSources.projects.create(ctx.userId, {
      ...params,
      owner: params.owner ?? null,
    });
  }),

  moveProject: authed(async ({
    args: { id, owner: ownerId },
    ctx,
  }: AuthedParams<unknown, MutationMoveProjectArgs>): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getOne(id);
    if (!project) {
      return null;
    }

    let owner = await ctx.getOwner(ownerId ?? ctx.userId);
    if (owner === null) {
      throw new Error("Owner not found.");
    }

    await project.move(owner);
    return project;
  }),

  deleteProject: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, MutationDeleteProjectArgs>): Promise<boolean> => {
    await ctx.dataSources.projects.delete(id);
    return true;
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
