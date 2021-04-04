import { URL } from "url";

import type { Overwrite } from "@allthethings/utils";

import type { User, Context, Project, Section, TaskList, Item } from "../db";
import { ItemType } from "../db/types";
import PluginManager from "../plugins";
import type { Icon } from "../utils/page";
import { loadPageInfo } from "../utils/page";
import type { AuthedParams, AuthedContext, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type * as Types from "./types";

type ItemCreateArgs = Overwrite<Types.MutationCreateTaskArgs, {
  list: TaskList | Section;
  taskInfo?: Types.TaskInfoParams | null;
}>;

async function baseCreateItem(
  ctx: AuthedContext,
  { list, item: itemParams, taskInfo }: ItemCreateArgs,
  type: ItemType | null,
): Promise<Item> {
  let item = await ctx.dataSources.items.create(list, {
    ...itemParams,
    archived: itemParams.archived ?? null,
    snoozed: itemParams.snoozed ?? null,
    type,
  });

  if (taskInfo) {
    await ctx.dataSources.taskInfo.create(item, {
      ...taskInfo,
      due: taskInfo.due ?? null,
      done: taskInfo.done ?? null,
    });
  }

  return item;
}

const resolvers: MutationResolvers = {
  login: resolver(async ({
    args: { email, password },
    ctx,
  }: ResolverParams<unknown, Types.MutationLoginArgs>): Promise<User | null> => {
    let user = await ctx.dataSources.users.verifyUser(email, password);

    if (!user) {
      user = await ctx.dataSources.users.create({
        email,
        password,
      });
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
    let user = await ctx.dataSources.users.getImpl(ctx.userId);
    if (!user) {
      throw new Error("Unknown user.");
    }
    return ctx.dataSources.contexts.create(user, params);
  }),

  editContext: authed(async ({
    args: { id, params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditContextArgs>): Promise<Context | null> => {
    let context = await ctx.dataSources.contexts.getImpl(id);
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
    let project = await ctx.dataSources.projects.getImpl(id);

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
    let project = await ctx.dataSources.projects.getImpl(id);
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
    let project = await ctx.dataSources.projects.getImpl(id);
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
    let section = await ctx.dataSources.sections.getImpl(id);

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
    let section = await ctx.dataSources.sections.getImpl(id);
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
    let section = await ctx.dataSources.sections.getImpl(id);
    if (!section) {
      return false;
    }

    await section.delete();
    return true;
  }),

  createTask: authed(async ({
    args: { list: listId, ...args },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateTaskArgs>): Promise<Item> => {
    let list: TaskList | Section | null = await ctx.getTaskList(listId ?? ctx.userId);
    if (!list && listId) {
      list = await ctx.dataSources.sections.getImpl(listId);
    }

    if (!list) {
      throw new Error("Unknown task list.");
    }

    return baseCreateItem(ctx, { list, ...args }, null);
  }),

  createLink: authed(async ({
    args: { detail, list: listId, ...args },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateLinkArgs>): Promise<Item> => {
    let url: URL;
    try {
      url = new URL(detail.url);
    } catch (e) {
      throw new Error("Invalid url.");
    }

    let list: TaskList | Section | null = await ctx.getTaskList(listId ?? ctx.userId);
    if (!list && listId) {
      list = await ctx.dataSources.sections.getImpl(listId);
    }

    if (!list) {
      throw new Error("Unknown task list.");
    }

    let item = await PluginManager.createItemFromURL(ctx, url);
    if (item) {
      await item.move(list, null);
      return item;
    }

    let pageInfo = await loadPageInfo(url);

    let summary = args.item.summary;
    if (!summary) {
      summary = pageInfo.title ?? "";
    }
    if (!summary) {
      throw new Error("No page title found.");
    }

    item = await baseCreateItem(ctx, {
      ...args,
      list,
      item: {
        ...args.item,
        summary,
      },
    }, ItemType.Link);

    let icons = [...pageInfo.icons];
    let icon: string | null = null;

    if (icons.length) {
      icons.sort((a: Icon, b: Icon): number => (a.size ?? 0) - (b.size ?? 0));
      if (icons[0].size === null) {
        icon = icons[0].url.toString();
      } else if ((icons[icons.length - 1].size ?? 0) < 32) {
        icon = icons[icons.length - 1].url.toString();
      } else {
        while (icons.length && icons[0].size < 32) {
          icons.shift();
        }
        if (icons.length) {
          icon = icons[0].url.toString();
        }
      }
    }

    await ctx.dataSources.linkDetail.create(item, {
      ...detail,
      icon,
    });

    return item;
  }),

  createNote: authed(async ({
    args: { detail, list: listId, ...args },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateNoteArgs>): Promise<Item> => {
    let list: TaskList | Section | null = await ctx.getTaskList(listId ?? ctx.userId);
    if (!list && listId) {
      list = await ctx.dataSources.sections.getImpl(listId);
    }

    if (!list) {
      throw new Error("Unknown task list.");
    }

    let item = await baseCreateItem(ctx, { list, ...args }, ItemType.Note);

    await ctx.dataSources.noteDetail.create(item, {
      ...detail,
    });

    return item;
  }),

  editItem: authed(async ({
    args: { id, item: params },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditItemArgs>): Promise<Item | null> => {
    await ctx.dataSources.items.updateOne(id, {
      ...params,
      archived: params.archived ?? null,
      snoozed: params.snoozed ?? null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  editTaskInfo: authed(async ({
    args: { id, taskInfo },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditTaskInfoArgs>): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    if (taskInfo) {
      await ctx.dataSources.taskInfo.updateOne(id, {
        ...taskInfo,
        due: taskInfo.due ?? null,
        done: taskInfo.done ?? null,
      });
    } else {
      await ctx.dataSources.taskInfo.delete(id);
    }

    return item;
  }),

  moveItem: authed(async ({
    args: { id, parent, before },
    ctx,
  }: AuthedParams<unknown, Types.MutationMoveItemArgs>): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    if (!parent) {
      parent = ctx.userId;
    }

    let owner: TaskList | Section | null = await ctx.getTaskList(parent);
    if (!owner) {
      owner = await ctx.dataSources.sections.getImpl(parent);
    }
    if (!owner) {
      throw new Error("Owner not found.");
    }

    await item.move(owner, before ?? null);
    return item;
  }),

  deleteItem: authed(async ({
    args: { id },
    ctx,
  }: AuthedParams<unknown, Types.MutationDeleteItemArgs>): Promise<boolean> => {
    let item = await ctx.dataSources.items.getImpl(id);
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
