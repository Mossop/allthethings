import { URL } from "url";

import { DateTime } from "luxon";

import type {
  MutationArchiveItemArgs,
  MutationChangePasswordArgs,
  MutationCreateContextArgs,
  MutationCreateLinkArgs,
  MutationCreateProjectArgs,
  MutationCreateSectionArgs,
  MutationCreateTaskArgs,
  MutationCreateUserArgs,
  MutationDeleteContextArgs,
  MutationDeleteItemArgs,
  MutationDeleteProjectArgs,
  MutationDeleteSectionArgs,
  MutationDeleteUserArgs,
  MutationEditContextArgs,
  MutationEditItemArgs,
  MutationEditProjectArgs,
  MutationEditSectionArgs,
  MutationEditTaskControllerArgs,
  MutationEditTaskInfoArgs,
  MutationMarkItemDueArgs,
  MutationMoveItemArgs,
  MutationMoveProjectArgs,
  MutationMoveSectionArgs,
  MutationSnoozeItemArgs,
} from "#schema";
import { TaskController } from "#schema";
import type { GraphQLCtx, TypeResolver } from "#server/utils";
import { bestIcon, loadPageInfo } from "#server/utils";

import type { ItemHolder } from "./implementations";
import {
  ServiceDetail,
  TaskInfo,
  LinkDetail,
  ItemHolderBase,
  Context,
  Project,
  Section,
  TaskListBase,
  Item,
  User,
} from "./implementations";
import type { MutationResolvers } from "./schema";
import { ServiceManager } from "./services";
import type { CoreTransaction } from "./transaction";
import { ItemType } from "./types";
import { ensureAdmin, ensureAuthed } from "./utils";

const mutationResolvers: TypeResolver<
  MutationResolvers,
  GraphQLCtx<CoreTransaction>
> = {
  createContext: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { params }: MutationCreateContextArgs,
    ): Promise<Context> => {
      return Context.create(tx, user, params);
    },
  ),

  editContext: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, params }: MutationEditContextArgs,
    ): Promise<Context | null> => {
      let { stores } = tx;
      let context = await stores.contexts.get(id);
      if (!context) {
        return null;
      }

      await context.edit(params);

      return context;
    },
  ),

  deleteContext: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: MutationDeleteContextArgs,
    ): Promise<boolean> => {
      let { stores } = tx;
      let contexts = await stores.contexts.list({
        userId: user.id,
      });

      if (contexts.length == 1 && contexts[0].id == id) {
        throw new Error("Cannot delete the last context.");
      }

      return stores.contexts.deleteOne(id);
    },
  ),

  createProject: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { taskList: taskListId, params }: MutationCreateProjectArgs,
    ): Promise<Project> => {
      let taskList = await TaskListBase.getTaskList(tx, taskListId);
      if (!taskList) {
        throw new Error("Unknown task list.");
      }

      return Project.create(tx, taskList, params);
    },
  ),

  editProject: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, params }: MutationEditProjectArgs,
    ): Promise<Project | null> => {
      let { stores } = tx;
      let project = await stores.projects.get(id);

      if (!project) {
        return null;
      }

      await project.edit(params);

      return project;
    },
  ),

  moveProject: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, taskList: taskListId }: MutationMoveProjectArgs,
    ): Promise<Project | null> => {
      let { stores } = tx;
      let project = await stores.projects.get(id);

      if (!project) {
        return null;
      }

      let taskList = await TaskListBase.getTaskList(tx, taskListId);
      if (!taskList) {
        throw new Error("Unknown task list.");
      }

      await project.move(taskList);
      return project;
    },
  ),

  deleteProject: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: MutationDeleteProjectArgs,
    ): Promise<boolean> => {
      let { stores } = tx;
      let project = await stores.projects.get(id);
      if (!project) {
        return false;
      }

      await project.delete();
      return true;
    },
  ),

  createSection: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      {
        taskList: taskListId,
        before: beforeId,
        params,
      }: MutationCreateSectionArgs,
    ): Promise<Section> => {
      let { stores } = tx;
      let taskList = await TaskListBase.getTaskList(tx, taskListId);
      if (!taskList) {
        throw new Error("Unknown task list.");
      }

      let before: Section | null = null;
      if (beforeId) {
        before = await stores.sections.get(beforeId);
        if (!before) {
          throw new Error("Unknown section.");
        }
      }

      return Section.create(tx, taskList, before ?? null, params);
    },
  ),

  editSection: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, params }: MutationEditSectionArgs,
    ): Promise<Section | null> => {
      let { stores } = tx;
      let section = await stores.sections.get(id);

      if (!section) {
        return null;
      }

      await section.edit(params);

      return section;
    },
  ),

  moveSection: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, before: beforeId, taskList }: MutationMoveSectionArgs,
    ): Promise<Section | null> => {
      let { stores } = tx;
      let section = await stores.sections.get(id);
      if (!section) {
        return null;
      }

      let list = await TaskListBase.getTaskList(tx, taskList);
      if (list === null) {
        throw new Error("TaskList not found.");
      }

      let before: Section | null = null;
      if (beforeId) {
        before = await stores.sections.get(beforeId);
        if (!before) {
          throw new Error("Unknown section.");
        }
      }

      await section.move(list, before ?? null);
      return section;
    },
  ),

  deleteSection: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: MutationDeleteSectionArgs,
    ): Promise<boolean> => {
      let { stores } = tx;
      let section = await stores.sections.get(id);
      if (!section) {
        return false;
      }

      await section.delete();
      return true;
    },
  ),

  createTask: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { section: sectionId, item: itemParams }: MutationCreateTaskArgs,
    ): Promise<Item> => {
      let itemHolder = sectionId
        ? await ItemHolderBase.getItemHolder(tx, sectionId)
        : null;

      if (sectionId && !itemHolder) {
        throw new Error("Unknown section.");
      }

      let item = await Item.create(tx, user, null, itemParams);

      if (itemHolder) {
        await item.move(itemHolder);
      }

      return item;
    },
  ),

  createLink: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      {
        detail: { url },
        section: sectionId,
        isTask,
        item: itemParams,
      }: MutationCreateLinkArgs,
    ): Promise<Item> => {
      let targetUrl: URL;
      try {
        targetUrl = new URL(url);
      } catch (e) {
        throw new Error("Invalid url.");
      }

      let itemHolder: ItemHolder | null = null;
      if (sectionId) {
        itemHolder = await ItemHolderBase.getItemHolder(tx, sectionId);

        if (!itemHolder) {
          throw new Error("Unknown section.");
        }
      }

      let id = await ServiceManager.createItemFromURL(
        tx.transaction,
        user.id,
        targetUrl,
        isTask,
      );
      if (id) {
        let item = await tx.stores.items.get(id);
        if (!item) {
          throw new Error("Service returned an unknown item.");
        }

        if (itemHolder) {
          await item.move(itemHolder, null);
        }

        return item;
      }

      let pageInfo = await loadPageInfo(targetUrl);

      let summary = itemParams.summary;
      if (!summary) {
        summary = pageInfo.title ?? targetUrl.toString();
      }

      let item = await Item.create(
        tx,
        user,
        ItemType.Link,
        {
          ...itemParams,
          summary,
        },
        isTask ? { due: null, done: null } : null,
      );

      let icons = [...pageInfo.icons];
      let icon: string | null = bestIcon(icons, 32)?.url.toString() ?? null;

      await LinkDetail.create(tx, item, {
        url,
        icon,
      });

      return item;
    },
  ),

  createNote: ensureAuthed(async (): Promise<Item> => {
    throw new Error("Not implemented");
  }),

  editItem: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, item: params }: MutationEditItemArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);

      if (!item) {
        return null;
      }

      await item.edit({
        ...params,
        archived: params.archived ?? null,
        snoozed: params.snoozed ?? null,
      });

      return item;
    },
  ),

  editTaskInfo: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, taskInfo: taskInfoParams }: MutationEditTaskInfoArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);

      if (!item) {
        return null;
      }

      let existing = await item.taskInfo();
      if (existing && existing.controller != TaskController.Manual) {
        return item;
      }

      if (!taskInfoParams) {
        if (existing) {
          await existing.delete();
        }
        return item;
      }

      if (!existing) {
        await TaskInfo.create(tx, item, {
          due: taskInfoParams.due ?? null,
          manualDue: taskInfoParams.due ?? null,
          done: taskInfoParams.done ?? null,
          controller: TaskController.Manual,
        });
      } else {
        await existing.edit({
          due: taskInfoParams.due ?? null,
          manualDue: taskInfoParams.due ?? null,
          done: taskInfoParams.done ?? null,
          controller: TaskController.Manual,
        });
      }

      return item;
    },
  ),

  editTaskController: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, controller }: MutationEditTaskControllerArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);

      if (!item) {
        return null;
      }

      let existing = await item.taskInfo();
      let existingController = existing?.controller ?? null;
      if (existingController == controller) {
        return item;
      }

      if (!controller) {
        if (existing) {
          await existing.delete();
        }
        return item;
      }

      let taskInfo = {
        due: null as DateTime | null,
        manualDue: existing?.manualDue ?? null,
        done: existing?.done ?? null,
        controller: controller,
      };
      let detail = await item.detail();

      if (controller != TaskController.Manual) {
        if (!(detail instanceof ServiceDetail)) {
          throw new Error("Unsupported task controller.");
        }

        switch (controller) {
          case TaskController.ServiceList: {
            let wasListed = await detail.wasEverListed();
            if (!wasListed) {
              throw new Error("Unsupported task controller.");
            }

            let isListed = await detail.isCurrentlyListed();
            if (isListed) {
              taskInfo.done = null;
            } else if (!taskInfo.done) {
              taskInfo.done = DateTime.now();
            }

            taskInfo.due =
              taskInfo.manualDue ?? (await detail.getItemDueForLists());
            break;
          }
          case TaskController.Service: {
            if (!detail.hasTaskState) {
              throw new Error("Unsupported task controller.");
            }

            taskInfo.done = detail.taskDone;
            taskInfo.due = taskInfo.manualDue ?? detail.taskDue;
            break;
          }
        }
      } else {
        taskInfo.due = taskInfo.manualDue;
      }

      if (existing) {
        await existing.edit(taskInfo);
      } else {
        await TaskInfo.create(tx, item, taskInfo);
      }

      return item;
    },
  ),

  moveItem: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, section: sectionId, before: beforeId }: MutationMoveItemArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);

      if (!item) {
        return null;
      }

      let itemHolder: ItemHolder | null = null;
      if (sectionId) {
        itemHolder = await ItemHolderBase.getItemHolder(tx, sectionId);

        if (!itemHolder) {
          throw new Error("Unknown section.");
        }
      }

      if (itemHolder) {
        let before: Item | null = null;
        if (beforeId) {
          before = await stores.items.get(beforeId);
          if (!before) {
            throw new Error("Unknown before item.");
          }
        }

        await item.move(itemHolder, before);
      } else {
        await item.move(null);
      }

      return item;
    },
  ),

  deleteItem: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: MutationDeleteItemArgs,
    ): Promise<boolean> => {
      let { stores } = tx;
      let item = await stores.items.get(id);
      if (!item) {
        return false;
      }

      await item.delete();
      return true;
    },
  ),

  archiveItem: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, archived }: MutationArchiveItemArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);
      if (!item) {
        return null;
      }

      await item.edit({
        archived: archived ?? null,
      });

      return item;
    },
  ),

  snoozeItem: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, snoozed }: MutationSnoozeItemArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);
      if (!item) {
        return null;
      }

      await item.edit({
        snoozed: snoozed ?? null,
      });

      return item;
    },
  ),

  markItemDue: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id, due }: MutationMarkItemDueArgs,
    ): Promise<Item | null> => {
      let { stores } = tx;
      let item = await stores.items.get(id);
      if (!item) {
        return null;
      }

      let existing = await item.taskInfo();
      if (!existing) {
        return null;
      }

      if (due) {
        await existing.edit({
          due,
          manualDue: due,
        });
      } else {
        let due: DateTime | null = null;
        if (existing.controller != TaskController.Manual) {
          let detail = await item.detail();
          if (!(detail instanceof ServiceDetail)) {
            throw new Error("Invalid task controller.");
          }

          if (existing.controller == TaskController.Service) {
            due = detail.taskDue;
          } else {
            due = await detail.getItemDueForLists();
          }
        }

        await existing.edit({
          due,
          manualDue: null,
        });
      }

      return item;
    },
  ),

  createUser: ensureAdmin(
    async (
      tx: CoreTransaction,
      user: User,
      { email, password, isAdmin }: MutationCreateUserArgs,
    ): Promise<User> => {
      return User.create(tx, {
        email,
        password,
        isAdmin: isAdmin ?? false,
      });
    },
  ),

  deleteUser: ensureAdmin(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: MutationDeleteUserArgs,
    ): Promise<boolean> => {
      // TODO allow users to delete themselves.
      let { stores } = tx;
      let targetUser = await stores.users.get(id ?? user.id);
      if (!targetUser) {
        return false;
      }

      await user.delete();
      return true;
    },
  ),

  changePassword: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { currentPassword, newPassword }: MutationChangePasswordArgs,
    ): Promise<User | null> => {
      if (!(await user.verifyUser(currentPassword))) {
        return null;
      }

      await user.setPassword(newPassword);
      return user;
    },
  ),
};

export default mutationResolvers;
