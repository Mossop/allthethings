import { promises as fs } from "fs";
import path from "path";

import MutationResolvers from "./mutations";
import QueryResolvers from "./queries";
import ObjectResolvers from "./resolvers";
import type { Resolvers } from "./types";

export function loadSchema(): Promise<string> {
  return fs.readFile(path.join(__dirname, "..", "..", "src", "schema", "schema.graphql"), {
    encoding: "utf8",
  });
}

export const resolvers: Resolvers = {
  ...ObjectResolvers,
  ...QueryResolvers,
  ...MutationResolvers,
};
