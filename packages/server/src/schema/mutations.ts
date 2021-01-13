import { ObjectId } from "mongodb";

import type { ContextDbObject, ProjectDbObject, UserDbObject } from "../db/types";
import type { AuthedParams, ResolverParams } from "./context";
import { resolver, authed } from "./context";
import type {
  Resolvers,
  MutationCreateContextArgs,
  MutationAssignContextArgs,
  MutationCreateProjectArgs,
  MutationAssignParentArgs,
  MutationLoginArgs,
} from "./types";

const resolvers: Resolvers["Mutation"] = {
  login: resolver(async ({
    args: { email, password },
    ctx,
  }: ResolverParams<unknown, MutationLoginArgs>): Promise<UserDbObject | null> => {
    let user = await ctx.dataSources.users.verifyUser(email, password);

    if (!user) {
      user = await ctx.dataSources.users.createUser(email, password);
    }

    ctx.login(user._id);
    return user;
  }),

  logout: authed(async ({
    ctx,
  }: AuthedParams): Promise<boolean> => {
    ctx.logout();
    return true;
  }),

  createContext: authed(({
    args: { name },
    ctx,
  }: AuthedParams<unknown, MutationCreateContextArgs>): Promise<ContextDbObject> => {
    return ctx.dataSources.contexts.create(ctx.userId, name);
  }),

  createProject: authed(async ({
    args: { name, parent, context },
    ctx,
  }: AuthedParams<unknown, MutationCreateProjectArgs>): Promise<ProjectDbObject> => {
    let contextId = await ctx.dataSources.contexts.getContextId(ctx.userId, context);

    return ctx.dataSources.projects.create(contextId, parent ? new ObjectId(parent) : null, name);
  }),

  assignContext: authed(async ({
    args: { project, context },
    ctx,
  }: AuthedParams<unknown, MutationAssignContextArgs>): Promise<ProjectDbObject | null> => {
    let contextId = await ctx.dataSources.contexts.getContextId(ctx.userId, context);

    return ctx.dataSources.projects.setContext(new ObjectId(project), contextId);
  }),

  assignParent: authed(async ({
    args: { project, parent },
    ctx,
  }: AuthedParams<unknown, MutationAssignParentArgs>): Promise<ProjectDbObject | null> => {
    return ctx.dataSources.projects.setParent(
      new ObjectId(project),
      parent ? new ObjectId(parent) : null,
    );
  }),
};

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Mutation: resolvers,
};
