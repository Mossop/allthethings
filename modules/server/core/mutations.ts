import type { GraphQLCtx, Transaction, TypeResolver } from "#server/utils";

import type {
  MutationChangePasswordArgs,
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
  MutationMarkTaskDoneArgs,
  MutationMarkTaskDueArgs,
  MutationSetTaskControllerArgs,
} from "../../schema";
import { TaskController } from "../../schema";
import { ServiceDetail, TaskInfo, Item, User } from "./implementations";
import type { MutationResolvers } from "./schema";
import { ensureAdmin, ensureAuthed } from "./utils";

const mutationResolvers: TypeResolver<MutationResolvers, GraphQLCtx> = {
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
