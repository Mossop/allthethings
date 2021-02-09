/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";
import path from "path";

import { ApolloServer } from "apollo-server-koa";
import type { ValueNode } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { DateTime } from "luxon";

import type { Overwrite } from "@allthethings/utils";

import type { ProjectRoot, TaskList } from "../db";
import { Context, User, dataSources } from "../db";
import type { ResolverContext } from "./context";
import { buildContext } from "./context";
import MutationResolvers from "./mutations";
import ServerPlugin from "./plugin";
import QueryResolvers from "./queries";
import type * as Resolvers from "./resolvers";

function loadSchema(): Promise<string> {
  return fs.readFile(path.join(__dirname, "..", "..", "src", "schema", "schema.graphql"), {
    encoding: "utf8",
  });
}

type RootResolvers<ContextType = ResolverContext> = Overwrite<
  Omit<Resolvers.Resolvers<ContextType>, "User" | "Context" | "Project" | "Section">,
  {
    Item: Pick<Resolvers.ItemResolvers<ContextType>, "__resolveType">,
    TaskList: Pick<Resolvers.TaskListResolvers<ContextType>, "__resolveType">,
    ProjectRoot: Pick<Resolvers.ContextResolvers<ContextType>, "__resolveType">,
  }
>;

export const resolvers: RootResolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime",
    serialize(value: DateTime): string {
      return value.toISO();
    },
    parseValue(value: unknown): DateTime | null {
      return typeof value == "string" ? DateTime.fromISO(value) : null;
    },
    parseLiteral(ast: ValueNode): DateTime | null {
      if (ast.kind === Kind.STRING) {
        return DateTime.fromISO(ast.value);
      }
      return null;
    },
  }),

  Item: {
    __resolveType(): "Task" {
      return "Task";
    },
  },

  TaskList: {
    __resolveType(parent: TaskList): "User" | "Context" | "Project" {
      if (parent instanceof User) {
        return "User";
      }

      if (parent instanceof Context) {
        return "Context";
      }

      return "Project";
    },
  },

  ProjectRoot: {
    __resolveType(parent: ProjectRoot): "User" | "Context" {
      if (parent instanceof User) {
        return "User";
      }

      return "Context";
    },
  },

  ...QueryResolvers,
  ...MutationResolvers,
};

export async function createGqlServer(): Promise<ApolloServer> {
  return new ApolloServer({
    typeDefs: await loadSchema(),
    resolvers,
    context: buildContext,
    // @ts-ignore
    dataSources: () => dataSources(),
    plugins: [ServerPlugin],
  });
}
