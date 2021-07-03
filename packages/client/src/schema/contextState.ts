/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Overwrite } from "@allthethings/utils";
import { useMemo } from "react";

import type { GraphQLType } from ".";
import type { ListContextStateQuery } from "./queries";
import { useListContextStateQuery } from "./queries";

type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;
interface StateId {
  id: string
}
type StateQuery = ListContextStateQuery;
type StateQuery$User = NonNullable<StateQuery["user"]>;
type StateQuery$User$Context = ArrayContents<StateQuery$User["contexts"]>;
type StateQuery$User$Project = ArrayContents<StateQuery$User$Context["projects"]>;

export type User = Overwrite<StateQuery$User, {
  readonly contexts: ReadonlyMap<string, Context>;
  readonly inbox: Inbox;
  readonly defaultContext: Context;
}>;

export type Context = Overwrite<StateQuery$User$Context, {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
  readonly remainingTasks: number;
}>;

export type Project = Overwrite<StateQuery$User$Project, {
  readonly remainingTasks: number;
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
}>;

export interface Inbox {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: "Inbox";
  readonly itemCount: number;
}

export type TaskList = Project | Context;

export function isInbox(val: GraphQLType): val is Inbox {
  return val.__typename == "Inbox";
}

export function isContext(val: GraphQLType): val is Context {
  return val.__typename == "Context";
}

export function isProject(val: GraphQLType): val is Project {
  return val.__typename == "Project";
}

export function isUser(val: GraphQLType): val is User {
  return val.__typename == "User";
}

export function isTaskList(val: GraphQLType): val is TaskList {
  return isProject(val) || isContext(val);
}

function buildContext(queryResult: StateQuery$User$Context): Context {
  type TempProject = Overwrite<Project, {
    subprojects: TempProject[];
    parent: TempProject | null;
  }>;

  let projects = new Map(
    queryResult.projects.map((state: StateQuery$User$Project): [string, TempProject] => [
      state.id,
      {
        ...state,
        remainingTasks: state.remainingTasks.isTask.count,
        subprojects: [],
        parent: null,
      },
    ]),
  );

  for (let state of queryResult.projects) {
    let project = projects.get(state.id)!;
    project.subprojects = state.subprojects.map(({ id }: StateId) => projects.get(id)!);
    for (let inner of project.subprojects) {
      inner.parent = project;
    }
  }

  return {
    ...queryResult,
    id: queryResult.id,
    remainingTasks: queryResult.remainingTasks.isTask.count,
    projects,
    subprojects: queryResult.subprojects.map(({ id }: StateId) => projects.get(id)!),
  };
}

function buildUser(queryResult: StateQuery$User): User {
  let contexts = queryResult.contexts.map(buildContext);
  if (contexts.length == 0) {
    throw new Error("Invalid user.");
  }

  return {
    ...queryResult,
    inbox: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __typename: "Inbox",
      itemCount: queryResult.inbox.count,
    },
    defaultContext: contexts[0],
    contexts: new Map(
      contexts.map(
        (context: Context): [string, Context] => [context.id, context],
      ),
    ),
  };
}

function buildState(queryResult: StateQuery): User | null {
  return queryResult.user ? buildUser(queryResult.user) : null;
}

export function useContextState(): User | null | undefined {
  let { data } = useListContextStateQuery({
    pollInterval: 5000,
  });

  return useMemo(() => data ? buildState(data) : undefined, [data]);
}
