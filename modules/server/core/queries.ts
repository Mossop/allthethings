import type { GraphQLCtx, Transaction, TypeResolver } from "#server/utils";

import type { QueryTaskListArgs } from "../../schema";
import type { TaskList } from "./implementations";
import { User, TaskListBase } from "./implementations";
import type { QueryResolvers } from "./schema";
import { ensureAdmin, ensureAuthed } from "./utils";

const queryResolvers: TypeResolver<QueryResolvers, GraphQLCtx> = {
  async user(ctx: GraphQLCtx): Promise<User | null> {
    if (!ctx.userId) {
      return null;
    }

    return User.store(ctx.transaction).findOne({ id: ctx.userId });
  },

  users: ensureAdmin(async (tx: Transaction): Promise<User[]> => {
    return User.store(tx).find();
  }),

  taskList: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { id }: QueryTaskListArgs,
    ): Promise<TaskList | null> => {
      return TaskListBase.getTaskList(tx, id);
    },
  ),
};

export default queryResolvers;
