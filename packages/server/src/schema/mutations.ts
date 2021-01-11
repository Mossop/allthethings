import { ObjectId } from "mongodb";

import type { ContextDbObject, ProjectDbObject } from "../db/types";
import type { AuthedParams } from "./context";
import { authed } from "./context";
import type {
  Resolvers,
  MutationCreateContextArgs,
  MutationAssignContextArgs,
  MutationCreateProjectArgs,
  MutationAssignParentArgs,
} from "./types";

const resolvers: Resolvers["Mutation"] = {
  createContext: authed(({
    args: { name },
    ctx,
  }: AuthedParams<unknown, MutationCreateContextArgs>): Promise<ContextDbObject> => {
    return ctx.dataSources.contexts.insertOne({
      user: ctx.userId,
      name,
    });
  }),

  createProject: authed(async ({
    args: { name, parent, context },
    ctx,
  }: AuthedParams<unknown, MutationCreateProjectArgs>): Promise<ProjectDbObject> => {
    let contextId = await ctx.dataSources.contexts.getContextId(ctx.userId, context);

    return ctx.dataSources.projects.insertOne({
      context: contextId,
      parent: parent ? new ObjectId(parent) : null,
      name,
    });
  }),

  assignContext: authed(async ({
    args: { project, context },
    ctx,
  }: AuthedParams<unknown, MutationAssignContextArgs>): Promise<ProjectDbObject | null> => {
    let contextId = await ctx.dataSources.contexts.getContextId(ctx.userId, context);

    return ctx.dataSources.projects.updateOne(new ObjectId(project), {
      context: contextId,
    });
  }),

  assignParent: authed(async ({
    args: { project, parent },
    ctx,
  }: AuthedParams<unknown, MutationAssignParentArgs>): Promise<ProjectDbObject | null> => {
    return ctx.dataSources.projects.updateOne(new ObjectId(project), {
      parent: parent ? new ObjectId(parent) : null,
    });
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
