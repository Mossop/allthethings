import type { GraphQLCtx, TypeResolver } from "../utils";
import { User } from "./implementations";
import type { QueryResolvers } from "./schema";

const queryResolvers: TypeResolver<QueryResolvers, GraphQLCtx> = {
  async user(ctx: GraphQLCtx): Promise<User | null> {
    if (!ctx.userId) {
      return null;
    }

    return User.store(ctx.transaction).findOne({ id: ctx.userId });
  },
};

export default queryResolvers;
