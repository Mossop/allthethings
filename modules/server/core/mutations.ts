import { URL } from "url";

import type {
  MutationArchiveItemArgs,
  MutationChangePasswordArgs,
  MutationCreateLinkArgs,
  MutationCreateTaskArgs,
  MutationCreateUserArgs,
  MutationDeleteItemArgs,
  MutationDeleteUserArgs,
  MutationEditItemArgs,
  MutationMarkTaskDoneArgs,
  MutationMarkTaskDueArgs,
  MutationMoveItemArgs,
  MutationSetTaskControllerArgs,
  MutationSnoozeItemArgs,
} from "#schema";
import { TaskController } from "#schema";
import type { GraphQLCtx, Transaction, TypeResolver } from "#server/utils";
import { bestIcon, loadPageInfo } from "#server/utils";

import { ItemType } from "./entities";
import type { ItemHolder } from "./implementations";
import {
  ServiceDetail,
  TaskInfo,
  LinkDetail,
  ItemHolderBase,
  Item,
  User,
} from "./implementations";
import type { MutationResolvers } from "./schema";
import { ServiceManager } from "./services";
import { ensureAdmin, ensureAuthed } from "./utils";

const mutationResolvers: TypeResolver<MutationResolvers, GraphQLCtx> = {
  createTask: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { section: sectionId, item: itemParams }: MutationCreateTaskArgs,
    ): Promise<Item> => {
      let itemHolder = sectionId
        ? await ItemHolderBase.getItemHolder(tx, sectionId)
        : null;

      if (sectionId && !itemHolder) {
        throw new Error("Unknown section.");
      }

      let item = await Item.create(tx, user, null, itemParams, {});

      if (itemHolder) {
        await item.move(itemHolder);
      }

      return item;
    },
  ),

  createLink: ensureAuthed(
    async (
      tx: Transaction,
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
        tx,
        user.id,
        targetUrl,
        isTask,
      );
      if (id) {
        let item = await Item.store(tx).get(id);
        if (itemHolder) {
          await item.move(itemHolder, null);
        }

        return item;
      }

      let pageInfo = await loadPageInfo(tx.segment, targetUrl);

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
      tx: Transaction,
      user: User,
      { id, item: params }: MutationEditItemArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);

      await item.update({
        ...params,
        archived: params.archived ?? null,
        snoozed: params.snoozed ?? null,
      });

      return item;
    },
  ),

  markTaskDone: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, done }: MutationMarkTaskDoneArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);

      let existing = await item.taskInfo;
      if (existing && existing.controller != TaskController.Manual) {
        throw new Error("Cannot set a non-manual task's done state.");
      }

      if (!existing) {
        await TaskInfo.create(tx, item, {
          manualDue: null,
          manualDone: done ?? null,
          controller: TaskController.Manual,
        });
      } else {
        await existing.update({
          manualDone: done ?? null,
        });
      }

      return item;
    },
  ),

  setTaskController: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, controller }: MutationSetTaskControllerArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);

      let existing = await item.taskInfo;
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

      let detail = await item.detail;

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
            break;
          }
          case TaskController.Service: {
            if (!detail.hasTaskState) {
              throw new Error("Unsupported task controller.");
            }
            break;
          }
        }
      }

      if (existing) {
        await existing.update({
          controller,
        });
      } else {
        await TaskInfo.create(tx, item, {
          controller,
          manualDue: null,
          manualDone: null,
        });
      }

      return item;
    },
  ),

  moveItem: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, section: sectionId, before: beforeId }: MutationMoveItemArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);

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
          before = await Item.store(tx).get(beforeId);
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
      tx: Transaction,
      user: User,
      { id }: MutationDeleteItemArgs,
    ): Promise<boolean> => {
      let item = await Item.store(tx).get(id);
      await item.delete();
      return true;
    },
  ),

  archiveItem: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, archived }: MutationArchiveItemArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);
      await item.update({
        archived: archived ?? null,
      });

      return item;
    },
  ),

  snoozeItem: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, snoozed }: MutationSnoozeItemArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);
      await item.update({
        snoozed: snoozed ?? null,
      });

      return item;
    },
  ),

  markTaskDue: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id, due }: MutationMarkTaskDueArgs,
    ): Promise<Item | null> => {
      let item = await Item.store(tx).get(id);
      let existing = await item.taskInfo;
      if (!existing) {
        return null;
      }

      await existing.update({
        manualDue: due,
      });

      return item;
    },
  ),

  createUser: ensureAdmin(
    async (
      tx: Transaction,
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
      tx: Transaction,
      user: User,
      { id }: MutationDeleteUserArgs,
    ): Promise<boolean> => {
      // TODO allow users to delete themselves.
      let targetUser = await User.store(tx).get(id ?? user.id);
      await targetUser.delete();
      return true;
    },
  ),

  changePassword: ensureAuthed(
    async (
      tx: Transaction,
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
