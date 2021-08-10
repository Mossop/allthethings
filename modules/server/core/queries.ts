import type { QueryTaskListArgs } from "#schema";
import type { GraphQLCtx, TypeResolver } from "#server/utils";

import type { TaskList, User } from "./implementations";
import type { QueryResolvers } from "./schema";
import type { CoreTransaction } from "./transaction";
import { ensureAdmin, ensureAuthed } from "./utils";

const queryResolvers: TypeResolver<
  QueryResolvers,
  GraphQLCtx<CoreTransaction>
> = {
  async user(ctx: GraphQLCtx<CoreTransaction>): Promise<User | null> {
    if (!ctx.userId) {
      return null;
    }

    return ctx.transaction.stores.users.get(ctx.userId);
  },

  users: ensureAdmin(async (tx: CoreTransaction): Promise<User[]> => {
    return tx.stores.users.list();
  }),

  taskList: ensureAuthed(
    async (
      tx: CoreTransaction,
      user: User,
      { id }: QueryTaskListArgs,
    ): Promise<TaskList | null> => {
      let project = await tx.stores.projects.get(id);
      if (project) {
        return project;
      }

      let context = await tx.stores.contexts.get(id);
      if (context) {
        return context;
      }

      return null;
    },
  ),
};

export default queryResolvers;
