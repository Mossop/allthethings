/* eslint-disable @typescript-eslint/typedef */
import { promises as fs } from "fs";
import path from "path";

import type { ProjectRoot, TaskList, User } from "../db";
import { admin, authed, resolver } from "./context";
import type { QueryResolvers } from "./resolvers";

const pageRoot = path.normalize(path.join(__dirname, "..", "..", "pages"));

async function loadFile(name: string): Promise<string | null> {
  try {
    let content = await fs.readFile(name, {
      encoding: "utf8",
    });
    return content;
  } catch (e) {
    return null;
  }
}

const resolvers: QueryResolvers = {
  user: resolver(async (ctx): Promise<User | null> => {
    if (!ctx.userId) {
      return null;
    }

    let user = await ctx.dataSources.users.getImpl(ctx.userId);
    if (!user) {
      ctx.logout();
      return null;
    }

    return user;
  }),

  users: admin(async (ctx): Promise<User[]> => {
    return ctx.dataSources.users.find({});
  }),

  root: authed((ctx, { id }): Promise<ProjectRoot | null> => {
    return ctx.getRoot(id);
  }),

  taskList: authed((ctx, { id }): Promise<TaskList | null> => {
    return ctx.getTaskList(id);
  }),

  pageContent: resolver(async (ctx, { path: targetPath }): Promise<string> => {
    targetPath = targetPath.substring(1);
    let target: string;
    if (targetPath.length) {
      target = path.join(pageRoot, ...targetPath.split("/"));
    } else {
      target = path.normalize(path.join(pageRoot, "..", "..", "..", "README"));
    }

    let content = await loadFile(target + ".md");
    if (content) {
      return content;
    }

    content = await loadFile(path.join(target, "index.md"));
    if (content) {
      return content;
    }

    throw new Error(`Unknown file: ${target}`);
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Query: resolvers,
};
