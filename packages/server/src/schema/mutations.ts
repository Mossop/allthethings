import type { User, Context, Project, Section } from "../db";
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

  createContext: authed(({
    args: { params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateContextArgs>): Promise<Context> => {
    return ctx.dataSources.contexts.create(ctx.userId, params);
  }),

  deleteContext: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteContextArgs>): Promise<boolean> => {
    await ctx.dataSources.contexts.delete(id);
    return true;
  }),

  createProject: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateProjectArgs>): Promise<Project> => {
    return ctx.dataSources.projects.create(ctx.userId, params);
  }),

  editProject: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditProjectArgs>): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getOne(id);

    if (!project) {
      return null;
    }

    await project.edit({
      name: params.name ?? undefined,
    });

    return project;
  }),

  moveProject: authed(async ({
    args: { id, taskList },
    ctx,
  }: AuthedParams<unknown, Types.MutationMoveProjectArgs>): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getOne(id);
    if (!project) {
      return null;
    }

    let list = await ctx.getTaskList(taskList ?? ctx.userId);
    if (list === null) {
      throw new Error("TaskList not found.");
    }

    await project.move(list);
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
    return ctx.dataSources.sections.create(ctx.userId, params);
  }),

  moveSection: authed(async ({
    args: { id, taskList },
    ctx,
  }: AuthedParams<unknown, Types.MutationMoveSectionArgs>): Promise<Section | null> => {
    let section = await ctx.dataSources.sections.getOne(id);
    if (!section) {
      return null;
    }

    let list = await ctx.getTaskList(taskList ?? ctx.userId);
    if (list === null) {
      throw new Error("TaskList not found.");
    }

    await section.move(list);
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
