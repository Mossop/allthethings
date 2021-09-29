import type { GraphQLCtx, Transaction, TypeResolver } from "../utils";
import { User } from "./implementations";
import type { QueryResolvers } from "./schema";
import { ensureAdmin } from "./utils";

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
};

export default queryResolvers;
