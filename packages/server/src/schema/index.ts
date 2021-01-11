import { promises as fs } from "fs";
import path from "path";

import type { ResolverContext } from "./context";
import type { Context, Resolvers } from "./types";

export function loadSchema(): Promise<string> {
  return fs.readFile(path.join(__dirname, "..", "..", "src", "schema", "schema.graphql"), {
    encoding: "utf8",
  });
}

export const resolvers: Resolvers = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: {
    contexts: (_parent: unknown, _ctx: ResolverContext): Context[] => {
      return [{
        id: "a",
        name: "Context A",
      }, {
        id: "b",
        name: "Context B",
      }];
    },
  },
};
