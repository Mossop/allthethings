import { URL } from "url";

import { TaskController } from "@allthethings/schema";
import type { Overwrite } from "@allthethings/utils";
import { DateTime } from "luxon";

import type { User, Context, Project, Section, TaskList, Item } from "../db";
import { PluginDetail } from "../db";
import { ItemType } from "../db/types";
import PluginManager from "../plugins";
import { bestIcon, loadPageInfo } from "../utils/page";
import type { AuthedParams, AuthedResolverContext, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type * as Types from "./types";

type ItemCreateArgs = Overwrite<Types.MutationCreateTaskArgs, {
  list: TaskList | Section;
  taskInfo?: Types.TaskInfoParams | null;
}>;

async function baseCreateItem(
  ctx: AuthedResolverContext,
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
      controller: TaskController.Manual,
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
      throw new Error("Unknown user.");
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

    return baseCreateItem(ctx, {
      list,
      ...args,
      taskInfo: {
        due: null,
        done: null,
      },
    }, null);
  }),

  createLink: authed(async ({
    args: { detail: { url }, list: listId, isTask, ...args },
    ctx,
  }: AuthedParams<unknown, Types.MutationCreateLinkArgs>): Promise<Item> => {
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
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

    let item = await PluginManager.createItemFromURL(ctx, targetUrl, isTask);
    if (item) {
      await item.move(list, null);
      return item;
    }

    let pageInfo = await loadPageInfo(targetUrl);

    let summary = args.item.summary;
    if (!summary) {
      summary = pageInfo.title ?? targetUrl.toString();
    }

    item = await baseCreateItem(ctx, {
      ...args,
      list,
      item: {
        ...args.item,
        summary,
      },
      taskInfo: isTask ? { due: null, done: null } : null,
    }, ItemType.Link);

    let icons = [...pageInfo.icons];
    let icon: string | null = bestIcon(icons, 32)?.url.toString() ?? null;

    await ctx.dataSources.linkDetail.create(item, {
      url,
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
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    await ctx.dataSources.items.updateOne(id, {
      ...params,
      archived: params.archived ?? null,
      snoozed: params.snoozed ?? null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  editTaskInfo: authed(async ({
    args: { id, taskInfo: taskInfoParams },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditTaskInfoArgs>): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    let existing = await item.taskInfo();
    if (existing && await existing.controller() != TaskController.Manual) {
      return item;
    }

    let taskInfo = taskInfoParams
      ? {
        ...taskInfoParams,
        due: taskInfoParams.due ?? null,
        done: taskInfoParams.done ?? null,
      }
      : null;

    await ctx.dataSources.taskInfo.setItemTaskInfo(
      item,
      taskInfo
        ? {
          ...taskInfo,
          controller: TaskController.Manual,
        }
        : null,
    );

    return item;
  }),

  editTaskController: authed(async ({
    args: { id, controller },
    ctx,
  }: AuthedParams<unknown, Types.MutationEditTaskControllerArgs>): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    let existing = await item.taskInfo();
    let existingController = await existing?.controller() ?? null;
    if (existingController == controller) {
      return item;
    }

    if (!controller) {
      await ctx.dataSources.taskInfo.setItemTaskInfo(item, null);
    } else {
      let taskInfo = {
        due: existing ? await existing.due() : null,
        done: existing ? await existing.done() : null,
        controller: controller as TaskController,
      };
      let detail = await item.detail();

      if (controller != TaskController.Manual) {
        if (!(detail instanceof PluginDetail)) {
          throw new Error("Unsupported task controller.");
        }

        switch (controller) {
          case TaskController.PluginList: {
            let wasListed = await ctx.dataSources.pluginList.wasItemEverListed(item.id());
            if (!wasListed) {
              throw new Error("Unsupported task controller.");
            }

            let isListed = await ctx.dataSources.pluginList.isItemCurrentlyListed(item.id());
            if (isListed) {
              taskInfo.done = null;
            } else if (!taskInfo.done) {
              taskInfo.done = DateTime.now();
            }
            break;
          }
          case TaskController.Plugin: {
            if (!await detail.hasTaskState()) {
              throw new Error("Unsupported task controller.");
            }

            taskInfo.done = await detail.taskDone();
            break;
          }
        }
      }

      await ctx.dataSources.taskInfo.setItemTaskInfo(item, taskInfo);
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

  archiveItem: authed(async ({
    args: { id, archived },
    ctx,
  }: AuthedParams<unknown, Types.MutationArchiveItemArgs>): Promise<Item | null> => {
    await ctx.dataSources.items.updateOne(id, {
      archived: archived ?? null,
      snoozed: null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  snoozeItem: authed(async ({
    args: { id, snoozed },
    ctx,
  }: AuthedParams<unknown, Types.MutationSnoozeItemArgs>): Promise<Item | null> => {
    await ctx.dataSources.items.updateOne(id, {
      archived: null,
      snoozed: snoozed ?? null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  markItemDue: authed(async ({
    args: { id, due },
    ctx,
  }: AuthedParams<unknown, Types.MutationMarkItemDueArgs>): Promise<Item | null> => {
    await ctx.dataSources.taskInfo.updateOne(id, {
      due: due ?? null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
