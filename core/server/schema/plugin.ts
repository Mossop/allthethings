import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextWillSendResponse,
} from "apollo-server-plugin-base";
import type { GraphQLError } from "graphql";

import type { ResolverContext } from "./context";

const requestListener: GraphQLRequestListener<ResolverContext> = {
  async didEncounterErrors(
    ctx: GraphQLRequestContextDidEncounterErrors<ResolverContext>,
  ): Promise<void> {
    console.log(`Error performing ${ctx.request.operationName}`);
    if (ctx.request.variables) {
      console.log(ctx.request.variables);
    }

    ctx.errors.forEach((error: GraphQLError) => {
      console.error(error);
    });

    if (ctx.context.db.isInTransaction) {
      await ctx.context.db.rollbackTransaction();
    }
  },

  async willSendResponse(
    ctx: GraphQLRequestContextWillSendResponse<ResolverContext>,
  ): Promise<void> {
    if (ctx.context.db.isInTransaction) {
      await ctx.context.dataSources.ensureSanity();
      await ctx.context.db.commitTransaction();
    }
  },
};

const serverPlugin: ApolloServerPlugin<ResolverContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<ResolverContext> | void> {
    return requestListener;
  },
};

export default serverPlugin as ApolloServerPlugin;
