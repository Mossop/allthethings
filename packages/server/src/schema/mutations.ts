import type { User, NamedContext, Project, Section } from "../db";
import type { AuthedParams, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type * as Types from "./types";

const resolvers: MutationResolvers = {
  login: resolver(async ({
    args: { email, password },
    ctx,
  }: ResolverParams<unknown, Types.MutationLoginArgs>): Promise<User | null> => {
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
  }: AuthedParams<unknown, Types.MutationCreateNamedContextArgs>): Promise<NamedContext> => {
    return ctx.dataSources.namedContexts.create(ctx.userId, params);
  }),

  deleteNamedContext: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteNamedContextArgs>): Promise<boolean> => {
    await ctx.dataSources.namedContexts.delete(id);
    return true;
  }),

  createProject: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateProjectArgs>): Promise<Project> => {
    return ctx.dataSources.projects.create(ctx.userId, {
      ...params,
      owner: params.owner ?? null,
    });
  }),

  moveProject: authed(async ({
    args: { id, owner: ownerId },
    ctx,
  }: AuthedParams<unknown, Types.MutationMoveProjectArgs>): Promise<Project | null> => {
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
  }: AuthedParams<unknown, Types.MutationDeleteProjectArgs>): Promise<boolean> => {
    let project = await ctx.dataSources.projects.getOne(id);
    if (!project) {
      return false;
    }

    await project.delete();
    return true;
  }),

  createSection: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateSectionArgs>): Promise<Section> => {
    return ctx.dataSources.sections.create(ctx.userId, {
      ...params,
      owner: params.owner ?? null,
    });
  }),

  moveSection: authed(async ({
    args: { id, owner: ownerId },
    ctx,
  }: AuthedParams<unknown, Types.MutationMoveSectionArgs>): Promise<Section | null> => {
    let section = await ctx.dataSources.sections.getOne(id);
    if (!section) {
      return null;
    }

    let owner = await ctx.getOwner(ownerId ?? ctx.userId);
    if (owner === null) {
      throw new Error("Owner not found.");
    }

    await section.move(owner);
    return section;
  }),

  deleteSection: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteSectionArgs>): Promise<boolean> => {
    let section = await ctx.dataSources.sections.getOne(id);
    if (!section) {
      return false;
    }

    await section.delete();
    return true;
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
