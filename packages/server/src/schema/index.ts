/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";
import path from "path";

import type { Context, Owner } from "../db";
import { NamedContext, User } from "../db";
import MutationResolvers from "./mutations";
import QueryResolvers from "./queries";
import type { Resolvers } from "./resolvers";

export function loadSchema(): Promise<string> {
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
