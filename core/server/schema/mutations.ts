/* eslint-disable @typescript-eslint/typedef */
import { URL } from "url";

import { TaskController } from "#schema";
import type { Overwrite } from "#utils";
import { DateTime } from "luxon";

import type { User, Context, Project, Section, Item, ItemHolder } from "../db";
import { PluginDetail } from "../db";
import { ItemType } from "../db/types";
import PluginManager from "../plugins";
import { bestIcon, loadPageInfo } from "../utils/page";
import type { AuthedResolverContext } from "./context";
import { admin, resolver, authed } from "./context";
import type { MutationResolvers } from "./resolvers";
import type * as Types from "./types";

type ItemCreateArgs = Overwrite<Types.MutationCreateTaskArgs, {
  user: User;
  section: ItemHolder | null;
  taskInfo?: Types.TaskInfoParams | null;
}>;

async function baseCreateItem(
  ctx: AuthedResolverContext,
  { user, section, item: itemParams, taskInfo }: ItemCreateArgs,
  type: ItemType | null,
): Promise<Item> {
  let item = await ctx.dataSources.items.create(user, section, {
    ...itemParams,
    archived: itemParams.archived ?? null,
    snoozed: itemParams.snoozed ?? null,
    type,
  });

  if (taskInfo) {
    await ctx.dataSources.taskInfo.create(item, {
      ...taskInfo,
      due: taskInfo.due ?? null,
      manualDue: taskInfo.due ?? null,
      done: taskInfo.done ?? null,
      controller: TaskController.Manual,
    });
  }

  return item;
}

const resolvers: MutationResolvers = {
  login: resolver(async (ctx, { email, password }): Promise<User | null> => {
    let user = await ctx.dataSources.users.verifyUser(email, password);

    if (!user) {
      throw new Error("Unknown user.");
    }

    ctx.login(user);

    return user;
  }),

  logout: authed(async (ctx): Promise<boolean> => {
    ctx.logout();
    return true;
  }),

  createContext: authed(async (ctx, { params }): Promise<Context> => {
    let user = await ctx.dataSources.users.getImpl(ctx.userId);
    if (!user) {
      throw new Error("Unknown user.");
    }
    return ctx.dataSources.contexts.create(user, params);
  }),

  editContext: authed(async (ctx, { id, params }): Promise<Context | null> => {
    let context = await ctx.dataSources.contexts.getImpl(id);
    if (!context) {
      return null;
    }

    await context.edit(params);

    return context;
  }),

  deleteContext: authed(async (ctx, { id }): Promise<boolean> => {
    let record = await ctx.dataSources.contexts.getRecord(id);
    if (!record) {
      return false;
    }

    let userContexts = await ctx.dataSources.contexts.find({ userId: record.userId });
    if (userContexts.length < 2) {
      throw new Error("Cannot delete the last context.");
    }

    await ctx.dataSources.contexts.delete(id);
    return true;
  }),

  createProject: authed(async (ctx, { taskList: taskListId, params }): Promise<Project> => {
    let taskList = await ctx.getTaskList(taskListId);
    if (!taskList) {
      throw new Error("Unknown task list.");
    }

    return ctx.dataSources.projects.create(taskList, params);
  }),

  editProject: authed(async (ctx, { id, params }): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getImpl(id);

    if (!project) {
      return null;
    }

    await project.edit(params);

    return project;
  }),

  moveProject: authed(async (ctx, { id, taskList }): Promise<Project | null> => {
    let project = await ctx.dataSources.projects.getImpl(id);
    if (!project) {
      return null;
    }

    let list = await ctx.getTaskList(taskList);
    if (list === null) {
      throw new Error("TaskList not found.");
    }

    await project.move(list);
    return project;
  }),

  deleteProject: authed(async (ctx, { id }): Promise<boolean> => {
    let project = await ctx.dataSources.projects.getImpl(id);
    if (!project) {
      return false;
    }

    await project.delete();
    return true;
  }),

  createSection: authed(async (ctx, { taskList: taskListId, before, params }): Promise<Section> => {
    let taskList = await ctx.getTaskList(taskListId);
    if (!taskList) {
      throw new Error("Unknown task list.");
    }

    return ctx.dataSources.sections.create(taskList, before ?? null, params);
  }),

  editSection: authed(async (ctx, { id, params }): Promise<Section | null> => {
    let section = await ctx.dataSources.sections.getImpl(id);

    if (!section) {
      return null;
    }

    await section.edit(params);

    return section;
  }),

  moveSection: authed(async (ctx, { id, before, taskList }): Promise<Section | null> => {
    let section = await ctx.dataSources.sections.getImpl(id);
    if (!section) {
      return null;
    }

    let list = await ctx.getTaskList(taskList);
    if (list === null) {
      throw new Error("TaskList not found.");
    }

    await section.move(list, before ?? null);
    return section;
  }),

  deleteSection: authed(async (ctx, { id }): Promise<boolean> => {
    let section = await ctx.dataSources.sections.getImpl(id);
    if (!section) {
      return false;
    }

    await section.delete();
    return true;
  }),

  createTask: authed(async (ctx, { user: userId, section: sectionId, ...args }): Promise<Item> => {
    let user = await ctx.getUser(userId ?? null);

    let section: ItemHolder | null = null;
    if (sectionId) {
      section = await ctx.getSection(sectionId);

      if (!section) {
        throw new Error("Unknown section.");
      }
    }

    return baseCreateItem(ctx, {
      user,
      section,
      ...args,
      taskInfo: {
        due: null,
        done: null,
      },
    }, null);
  }),

  createLink: authed(
    async (ctx, {
      detail: { url },
      section: sectionId,
      user: userId,
      isTask,
      ...args
    }): Promise<Item> => {
      let user = await ctx.getUser(userId ?? null);

      let targetUrl: URL;
      try {
        targetUrl = new URL(url);
      } catch (e) {
        throw new Error("Invalid url.");
      }

      let section: ItemHolder | null = null;
      if (sectionId) {
        section = await ctx.getSection(sectionId);

        if (!section) {
          throw new Error("Unknown section.");
        }
      }

      let item = await PluginManager.createItemFromURL(ctx, targetUrl, isTask);
      if (item) {
        if (section) {
          await item.move(section, null);
        }

        return item;
      }

      let pageInfo = await loadPageInfo(targetUrl);

      let summary = args.item.summary;
      if (!summary) {
        summary = pageInfo.title ?? targetUrl.toString();
      }

      item = await baseCreateItem(ctx, {
        ...args,
        user,
        section,
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
    },
  ),

  createNote: authed(async (ctx, {
    detail,
    user: userId,
    section: sectionId,
    ...args
  }): Promise<Item> => {
    let user = await ctx.getUser(userId ?? null);

    let section: ItemHolder | null = null;
    if (sectionId) {
      section = await ctx.getSection(sectionId);

      if (!section) {
        throw new Error("Unknown section.");
      }
    }

    let item = await baseCreateItem(ctx, { user, section, ...args }, ItemType.Note);

    await ctx.dataSources.noteDetail.create(item, {
      ...detail,
    });

    return item;
  }),

  editItem: authed(async (ctx, { id, item: params }): Promise<Item | null> => {
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

  editTaskInfo: authed(async (ctx, { id, taskInfo: taskInfoParams }): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    let existing = await item.taskInfo();
    if (existing && await existing.controller() != TaskController.Manual) {
      return item;
    }

    if (!taskInfoParams) {
      await ctx.dataSources.taskInfo.delete(id);
      return item;
    }

    if (!existing) {
      await ctx.dataSources.taskInfo.insert({
        id,
        due: taskInfoParams.due ?? null,
        manualDue: taskInfoParams.due ?? null,
        done: taskInfoParams.done ?? null,
        controller: TaskController.Manual,
      });
    } else {
      await ctx.dataSources.taskInfo.updateOne(id, {
        due: taskInfoParams.due ?? null,
        manualDue: taskInfoParams.due ?? null,
        done: taskInfoParams.done ?? null,
        controller: TaskController.Manual,
      });
    }

    return item;
  }),

  editTaskController: authed(async (ctx, { id, controller }): Promise<Item | null> => {
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
      await ctx.dataSources.taskInfo.delete(id);
    } else {
      let taskInfo = {
        due: null as DateTime | null,
        manualDue: existing ? await existing.manualDue() : null,
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

            taskInfo.due = taskInfo.manualDue ??
              await ctx.dataSources.pluginList.getItemDue(item.id());
            break;
          }
          case TaskController.Plugin: {
            if (!await detail.hasTaskState()) {
              throw new Error("Unsupported task controller.");
            }

            taskInfo.done = await detail.taskDone();
            taskInfo.due = taskInfo.manualDue ?? await detail.taskDue();
            break;
          }
        }
      } else {
        taskInfo.due = taskInfo.manualDue;
      }

      if (existing) {
        await ctx.dataSources.taskInfo.updateOne(id, taskInfo);
      } else {
        await ctx.dataSources.taskInfo.insert({
          id,
          ...taskInfo,
        });
      }
    }

    return item;
  }),

  moveItem: authed(async (ctx, { id, section: sectionId, before }): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);

    if (!item) {
      return null;
    }

    let section: ItemHolder | null = null;
    if (sectionId) {
      section = await ctx.getSection(sectionId);

      if (!section) {
        throw new Error("Unknown section.");
      }
    }

    await item.move(section, before ?? null);

    return item;
  }),

  deleteItem: authed(async (ctx, { id }): Promise<boolean> => {
    let item = await ctx.dataSources.items.getImpl(id);
    if (!item) {
      return false;
    }

    await item.delete();
    return true;
  }),

  archiveItem: authed(async (ctx, { id, archived }): Promise<Item | null> => {
    await ctx.dataSources.items.updateOne(id, {
      archived: archived ?? null,
      snoozed: null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  snoozeItem: authed(async (ctx, { id, snoozed }): Promise<Item | null> => {
    await ctx.dataSources.items.updateOne(id, {
      archived: null,
      snoozed: snoozed ?? null,
    });

    return ctx.dataSources.items.getImpl(id);
  }),

  markItemDue: authed(async (ctx, { id, due }): Promise<Item | null> => {
    let item = await ctx.dataSources.items.getImpl(id);
    if (!item) {
      return null;
    }

    let existing = await ctx.dataSources.taskInfo.getRecord(id);
    if (!existing) {
      return null;
    }

    if (due) {
      await ctx.dataSources.taskInfo.updateOne(id, {
        due,
        manualDue: due,
      });
    } else {
      let due: DateTime | null = null;
      if (existing.controller != TaskController.Manual) {
        let detail = await item.detail();
        if (!(detail instanceof PluginDetail)) {
          throw new Error("Invalid task controller.");
        }

        if (existing.controller == TaskController.Plugin) {
          due = await detail.taskDue();
        } else {
          due = await ctx.dataSources.pluginList.getItemDue(id);
        }
      }

      await ctx.dataSources.taskInfo.updateOne(id, {
        due,
        manualDue: null,
      });
    }

    return item;
  }),

  createUser: admin((ctx, { email, password, isAdmin }): Promise<User> => {
    return ctx.dataSources.users.create({
      email,
      password,
      isAdmin: isAdmin ?? false,
    });
  }),

  deleteUser: admin(async (ctx, { id }): Promise<boolean> => {
    let user = await ctx.getUser(id ?? null);
    await user.delete();
    return true;
  }),

  changePassword: authed(
    async (ctx, { id, currentPassword, newPassword }): Promise<User | null> => {
      id = id ?? ctx.userId;

      if (id != ctx.userId) {
        await ctx.dataSources.users.assertIsAdmin(ctx.userId);
      }

      return ctx.dataSources.users.changePassword(id, currentPassword, newPassword);
    },
  ),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
