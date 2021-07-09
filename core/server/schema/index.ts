/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";

import { mergeResolvers } from "@graphql-tools/merge";
import { ApolloServer } from "apollo-server-koa";
import { GraphQLScalarType, Kind } from "graphql";
import type { ValueNode } from "graphql";
import { DateTime } from "luxon";

import type { TaskController } from "#schema";

import * as Db from "../db";
import PluginManager from "../plugins";
import { buildResolverContext } from "./context";
import MutationResolvers from "./mutations";
import ServerPlugin from "./plugin";
import QueryResolvers from "./queries";
import type { Resolvers } from "./resolvers";

type UnionTypes = "TaskList" | "ItemDetail";

type CustomTypes = "DateTime" | "TaskController";
type BaseResolvers = "Query" | "Mutation";
type RootResolvers = Pick<Resolvers, CustomTypes | BaseResolvers> & {
  [K in UnionTypes]: {
    __resolveType: Resolvers[K]["__resolveType"];
  };
};

const rootResolvers: RootResolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime",
    serialize(value: DateTime): string {
      return value.toISO();
    },
    parseValue(value: unknown): DateTime | null {
      return typeof value == "string" ? DateTime.fromISO(value).toUTC() : null;
    },
    parseLiteral(ast: ValueNode): DateTime | null {
      if (ast.kind === Kind.STRING) {
        return DateTime.fromISO(ast.value);
      }
      return null;
    },
  }),

  TaskController: new GraphQLScalarType({
    name: "TaskController",
    description: "TaskController",
    serialize(value: TaskController): string {
      return value;
    },
    parseValue(value: unknown): TaskController | null {
      return typeof value == "string" ? value as TaskController : null;
    },
    parseLiteral(ast: ValueNode): TaskController | null {
      if (ast.kind === Kind.STRING) {
        return ast.value as TaskController;
      }
      return null;
    },
  }),

  TaskList: {
    __resolveType(parent: Db.TaskList): "Context" | "Project" {
      if (parent instanceof Db.Context) {
        return "Context";
      }

      return "Project";
    },
  },

  ItemDetail: {
    __resolveType(
      parent: Db.ItemDetail,
    ): "PluginDetail" | "NoteDetail" | "LinkDetail" | "FileDetail" {
      if (parent instanceof Db.PluginDetail) {
        return "PluginDetail";
      }

      if (parent instanceof Db.NoteDetail) {
        return "NoteDetail";
      }

      if (parent instanceof Db.LinkDetail) {
        return "LinkDetail";
      }

      return "FileDetail";
    },
  },

  ...QueryResolvers,
  ...MutationResolvers,
};

export async function createGqlServer(): Promise<ApolloServer> {
  let baseSchema = await fs.readFile(require.resolve("#schema/schema.graphql"), {
    encoding: "utf8",
  });

  return new ApolloServer({
    typeDefs: baseSchema,

    // See https://github.com/apollographql/apollo-server/issues/4398
    mocks: true,
    mockEntireSchema: false,

    // @ts-ignore
    resolvers: mergeResolvers([
      rootResolvers,
      ...await PluginManager.getResolvers(),
    ]),
    context: buildResolverContext,
    // @ts-ignore
    dataSources: () => new Db.AppDataSources(),
    plugins: [ServerPlugin],
  });
}
