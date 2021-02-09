import type { User, Context, Project, Section, TaskList, TaskItem } from "../db";
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

  createContext: authed(async ({
    args: { params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateContextArgs>): Promise<Context> => {
    let user = await ctx.dataSources.users.getOne(ctx.userId);
    if (!user) {
      throw new Error("Unknown user.");
    }
    return ctx.dataSources.contexts.create(user, params);
  }),

  editContext: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditContextArgs>): Promise<Context | null> => {
    let context = await ctx.dataSources.contexts.getOne(id);
    if (!context) {
      return null;
    }

    await context.edit(params);

    return context;
  }),

  deleteContext: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteContextArgs>): Promise<boolean> => {
    await ctx.dataSources.contexts.delete(id);
    return true;
  }),

  createProject: authed(async ({
    args: { taskList: taskListId, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateProjectArgs>): Promise<Project> => {
    let taskList = await ctx.getTaskList(taskListId ?? ctx.userId);
    if (!taskList) {
      throw new Error("Unknown task list.");
    }

    return ctx.dataSources.projects.create(taskList, params);
  }),

  editProject: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditProjectArgs>): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getOne(id);

    if (!project) {
      return null;
    }

    await project.edit(params);

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
    args: { taskList: taskListId, before, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateSectionArgs>): Promise<Section> => {
    let taskList = await ctx.getTaskList(taskListId ?? ctx.userId);
    if (!taskList) {
      throw new Error("Unknown task list.");
    }

    return ctx.dataSources.sections.create(taskList, before ?? null, params);
  }),

  editSection: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditSectionArgs>): Promise<Section | null> => {
    let section = await ctx.dataSources.sections.getOne(id);

    if (!section) {
      return null;
    }

    await section.edit(params);

    return section;
  }),

  moveSection: authed(async ({
    args: { id, before, taskList },
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

    await section.move(list, before ?? null);
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

  createTask: authed(async ({
    args: { list: listId, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateTaskArgs>): Promise<TaskItem> => {
    let list: TaskList | Section | null = await ctx.getTaskList(listId ?? ctx.userId);
    if (!list && listId) {
      list = await ctx.dataSources.sections.getOne(listId);
    }

    if (!list) {
      throw new Error("Unknown task list.");
    }

    return ctx.dataSources.tasks.create(list, params);
  }),

  editTask: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditTaskArgs>): Promise<TaskItem | null> => {
    let item = await ctx.dataSources.tasks.getOne(id);

    if (!item) {
      return null;
    }

    await item.edit({
      ...params,
      done: params.done ?? null,
    });

    return item;
  }),

  deleteItem: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteItemArgs>): Promise<boolean> => {
    let item = await ctx.dataSources.items.getOne(id);
    if (!item) {
      return false;
    }

    await item.delete();
    return true;
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
