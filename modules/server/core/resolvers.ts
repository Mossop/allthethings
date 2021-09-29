/* eslint-disable @typescript-eslint/naming-convention */
import type { GraphQLCtx } from "../utils";
import { rootResolvers } from "../utils";
import QueryResolvers from "./queries";
import type { Resolvers } from "./schema";

export const coreResolvers = rootResolvers<Resolvers, GraphQLCtx>({
  Query: QueryResolvers,
});
