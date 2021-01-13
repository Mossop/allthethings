import type { DbObject } from "../db";
import type { ContextDbObject, ProjectDbObject, UserDbObject } from "../db/types";
import type { AuthedParams } from "./context";
import { authed } from "./context";
import type {
  Resolvers,
  ContextResolvers,
  ProjectResolvers,
  UserResolvers,
  ProjectContextResolvers,
  EmptyContextResolvers,
} from "./types";

function dbObjectResolver<T>(resolver: T): T {
  return {
    id: (outer: DbObject) => outer._id.toHexString(),
    ...resolver,
  };
}

const UserResolver = dbObjectResolver<UserResolvers>({
  contexts: authed(({
    outer,
    ctx,
  }: AuthedParams<UserDbObject>): Promise<ContextDbObject[]> => {
    return ctx.dataSources.contexts.listNamed(outer._id);
  }),

  emptyContext: authed(({
    outer,
    ctx,
  }: AuthedParams<UserDbObject>): Promise<ContextDbObject> => {
    return ctx.dataSources.contexts.getEmptyContext(outer._id);
  }),
});

const ProjectContextResolver: ProjectContextResolvers = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __resolveType(outer: ContextDbObject): "Context" | "EmptyContext" {
    if (outer.name) {
      return "Context";
    }

    return "EmptyContext";
  },
};

const EmptyContextResolver: EmptyContextResolvers = {
  user: authed(async ({
    outer,
    ctx,
  }: AuthedParams<ContextDbObject>): Promise<UserDbObject> => {
    let user = await ctx.dataSources.users.get(outer.user);
    if (user) {
      return user;
    }

    throw new Error(`Expected to find a user for context ${outer._id}.`);
  }),

  projects: authed(({ outer, ctx }: AuthedParams<ContextDbObject>): Promise<ProjectDbObject[]> => {
    return ctx.dataSources.projects.listContextRoots(outer._id);
  }),
};

const ContextResolver = dbObjectResolver<ContextResolvers>(EmptyContextResolver);

const ProjectResolver = dbObjectResolver<ProjectResolvers>({
  parent: authed(async ({
    outer,
    ctx,
  }: AuthedParams<ProjectDbObject>): Promise<ProjectDbObject | null> => {
    if (!outer.parent) {
      return null;
    }

    return ctx.dataSources.projects.get(outer.parent);
  }),

  context: authed(async ({
    outer,
    ctx,
  }: AuthedParams<ProjectDbObject>): Promise<ContextDbObject> => {
    let context = await ctx.dataSources.contexts.get(outer.context);
    if (context) {
      return context;
    }

    throw new Error(`Expected to find a context for project ${outer._id}`);
  }),

  subprojects: authed(({
    outer,
    ctx,
  }: AuthedParams<ProjectDbObject>): Promise<ProjectDbObject[]> => {
    return ctx.dataSources.projects.listChildren(outer._id);
  }),
});

/* eslint-disable @typescript-eslint/naming-convention */
const resolvers: Omit<Resolvers, "Query" | "Mutation"> = {
  User: UserResolver,
  ProjectContext: ProjectContextResolver,
  Context: ContextResolver,
  EmptyContext: EmptyContextResolver,
  Project: ProjectResolver,
};

export default resolvers;
