/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";
import path from "path";

import { ApolloServer } from "apollo-server-koa";

import type { Context, Owner } from "../db";
import { NamedContext, User, dataSources } from "../db";
import type { DatabaseConnection } from "../db/connection";
import { buildContext } from "./context";
import MutationResolvers from "./mutations";
import QueryResolvers from "./queries";
import type { Resolvers } from "./resolvers";

function loadSchema(): Promise<string> {
  return fs.readFile(path.join(__dirname, "..", "..", "src", "schema", "schema.graphql"), {
    encoding: "utf8",
  });
}

export const resolvers: Resolvers = {
  Owner: {
    __resolveType(parent: Owner): "User" | "NamedContext" | "Project" {
      if (parent instanceof User) {
        return "User";
      }

      if (parent instanceof NamedContext) {
        return "NamedContext";
      }

      return "Project";
    },
  },

  Context: {
    __resolveType(parent: Context): "User" | "NamedContext" {
      if (parent instanceof User) {
        return "User";
      }

      return "NamedContext";
    },
  },

  ...QueryResolvers,
  ...MutationResolvers,
};

export async function createGqlServer(db: DatabaseConnection): Promise<ApolloServer> {
  return new ApolloServer({
    typeDefs: await loadSchema(),
    resolvers,
    context: buildContext,
    // @ts-ignore
    dataSources: () => dataSources(db),
  });
}
