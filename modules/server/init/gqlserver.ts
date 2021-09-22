import { createHash } from "crypto";
import { promises as fs } from "fs";

import { mergeResolvers } from "@graphql-tools/merge";
import { ApolloServer } from "apollo-server-koa";
import type {
  GraphQLRequestListener,
  ApolloServerPlugin,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestContextDidEncounterErrors,
} from "apollo-server-plugin-base";
import type { GraphQLResolveInfo } from "graphql";

import {
  buildServiceTransaction,
  coreResolvers,
  ServiceManager,
  ServiceOwner,
} from "#server/core";
import type { ContextBuilder, GraphQLCtx } from "#server/utils";

import initResolvers from "./resolvers";
import type { WebServerContext } from "./webserver";

interface ResolverContext extends ContextBuilder {
  webserverContext: WebServerContext;
}

const requestListener: GraphQLRequestListener<ResolverContext> = {
  async didEncounterErrors(
    ctx: GraphQLRequestContextDidEncounterErrors<ResolverContext>,
  ): Promise<void> {
    for (let error of ctx.errors) {
      ctx.context.webserverContext.segment.error(error.originalError ?? error);
    }

    ctx.context.webserverContext.segment.error(
      "Error performing GraphQL operation",
      {
        operation: ctx.request.operationName,
        variables: ctx.request.variables,
      },
    );

    await ctx.context.webserverContext.rollbackTransaction();
  },

  async willSendResponse(
    ctx: GraphQLRequestContextWillSendResponse<ResolverContext>,
  ): Promise<void> {
    await ctx.context.webserverContext.commitTransaction();
  },
};

const serverPlugin: ApolloServerPlugin = {
  async requestDidStart(): Promise<GraphQLRequestListener | void> {
    return requestListener;
  },
};

export async function buildResolverContext({
  ctx,
}: {
  ctx: WebServerContext;
}): Promise<ResolverContext> {
  return {
    webserverContext: ctx,

    async buildContext(
      info: GraphQLResolveInfo,
      resolver?: Record<string, unknown>,
    ): Promise<GraphQLCtx> {
      let serviceOwner = resolver
        ? ServiceOwner.getServiceOwnerForResolver(resolver)
        : undefined;
      let service = await serviceOwner?.service;
      if (service && !ctx.userId) {
        throw new Error("Not authenticated.");
      }

      let transaction = await ctx.startTransaction(
        info.operation.name?.value ?? "GraphQL Operation",
        info.operation.operation == "mutation",
      );
      if (service) {
        transaction = await buildServiceTransaction(service, transaction);
      }

      return {
        userId: ctx.userId,
        transaction,
      };
    },
  };
}

export async function createGqlServer(): Promise<ApolloServer> {
  let baseSchema = await fs.readFile(
    require.resolve("#schema/schema.graphql"),
    {
      encoding: "utf8",
    },
  );
  let hasher = createHash("sha256");
  hasher.update(baseSchema);
  let schemaVersion = hasher.digest("hex");

  let serviceResolvers = await ServiceManager.getServiceResolvers();

  let server = new ApolloServer({
    typeDefs: baseSchema,

    // See https://github.com/apollographql/apollo-server/issues/4398
    mocks: true,
    mockEntireSchema: false,

    // @ts-ignore
    resolvers: mergeResolvers([
      initResolvers(schemaVersion),
      coreResolvers,
      // @ts-ignore
      ...serviceResolvers,
    ]),
    context: buildResolverContext,
    plugins: [serverPlugin],
  });

  await server.start();
  return server;
}
