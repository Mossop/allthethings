/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Overwrite } from "@allthethings/utils";
import { useMemo } from "react";

import type { ListContextStateQuery } from "./queries";
import { useListContextStateQuery } from "./queries";

type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;
interface StateId {
  id: string
}
type StateQuery = ListContextStateQuery;
type StateQuery$User = NonNullable<StateQuery["user"]>;
type StateQuery$User$Inbox = StateQuery$User["inbox"];
type StateQuery$User$Context = ArrayContents<StateQuery$User["contexts"]>;
type StateQuery$User$Project = ArrayContents<StateQuery$User["projects"]>;

export type User = Overwrite<StateQuery$User, {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly contexts: ReadonlyMap<string, Context>;
  readonly remainingTasks: number;
  readonly overdueItems: number;
  readonly inbox: Inbox;
}>;

export type Context = Overwrite<StateQuery$User$Context, {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
  readonly remainingTasks: number;
  readonly overdueItems: number;
}>;

export type Project = Overwrite<StateQuery$User$Project, {
  readonly remainingTasks: number;
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
}>;

export type Inbox = Overwrite<Omit<StateQuery$User$Inbox, "items">, {
  readonly id: "inbox";
  readonly itemCount: number;
}>;

export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;

interface GraphQLType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: string;
}

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
  return isUser(val) || isProject(val) || isContext(val);
}

function buildProjectRoot(
  queryResult: StateQuery$User | StateQuery$User$Context,
): Pick<User, Exclude<Extract<keyof User, keyof Context>, "__typename">> {
  type TempProject = Overwrite<Project, {
    subprojects: TempProject[];
    parent: TempProject | null;
  }>;

  let projects = new Map(
    queryResult.projects.map((state: StateQuery$User$Project): [string, TempProject] => [
      state.id,
      {
        ...state,
        remainingTasks: state.remainingTasks.count,
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
    id: queryResult.id,
    remainingTasks: queryResult.remainingTasks.count,
    overdueItems: queryResult.overdueItems.count,
    projects,
    subprojects: queryResult.subprojects.map(({ id }: StateId) => projects.get(id)!),
  };
}

function buildContext(queryResult: StateQuery$User$Context): Context {
  return {
    ...queryResult,
    ...buildProjectRoot(queryResult),
  };
}

function buildUser(queryResult: StateQuery$User): User {
  return {
    ...queryResult,
    inbox: {
      ...queryResult.inbox,
      id: "inbox",
      itemCount: queryResult.inbox.items.count,
    },
    ...buildProjectRoot(queryResult),
    contexts: new Map(
      queryResult.contexts.map(
        (state: StateQuery$User$Context): [string, Context] => [state.id, buildContext(state)],
      ),
    ),
  };
}

function buildState(queryResult: StateQuery): User | null {
  return queryResult.user ? buildUser(queryResult.user) : null;
}

export function useContextState(): User | null | undefined {
  let { data } = useListContextStateQuery({
    pollInterval: 30000,
  });

  return useMemo(() => data ? buildState(data) : undefined, [data]);
}
