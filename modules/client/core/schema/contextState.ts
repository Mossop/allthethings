import type { GraphQLType } from ".";
import type { Overwrite } from "../../../utils";
import type {
  ServerContextState,
  Problem as ServerProblem,
  ServerProjectState,
  ServerState,
  ServerUserState,
} from "../../utils";

export type Problem = Readonly<ServerProblem>;

export interface State {
  readonly user: User | null;
  readonly problems: readonly Problem[];
}

export type User = Overwrite<
  Readonly<ServerUserState>,
  {
    readonly inbox: Inbox;
    readonly contexts: ReadonlyMap<string, Context>;
    readonly defaultContext: Context;
  }
>;

export type Context = Overwrite<
  Readonly<ServerContextState>,
  {
    readonly projects: ReadonlyMap<string, Project>;
    readonly subprojects: readonly Project[];
  }
>;

export type Project = Overwrite<
  Readonly<Omit<ServerProjectState, "parentId">>,
  {
    readonly parent: Project | null;
    readonly subprojects: readonly Project[];
  }
>;

export interface Inbox {
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

function buildContext(contextState: ServerContextState): Context {
  type WritableProject = Overwrite<
    Project,
    {
      parent: WritableProject | null;
      subprojects: WritableProject[];
    }
  >;

  let projectStates = new Map<string, ServerProjectState>(
    contextState.projects.map(
      (project: ServerProjectState): [string, ServerProjectState] => [
        project.id,
        project,
      ],
    ),
  );

  let projects = new Map<string, WritableProject>();
  let addProject = (id: string): WritableProject => {
    let project = projects.get(id);
    if (!project) {
      let state = projectStates.get(id);
      if (!state) {
        throw new Error("Unknown project");
      }

      project = {
        ...state,
        parent: null,
        subprojects: [],
      };

      projects.set(state.id, project);

      if (state.parentId) {
        project.parent = addProject(state.parentId);
        project.parent.subprojects.push(project);
      }
    }

    return project;
  };

  let subprojects: Project[] = [];
  for (let id of projectStates.keys()) {
    let project = addProject(id);
    if (!project.parent) {
      subprojects.push(project);
    }
  }

  return {
    ...contextState,
    projects,
    subprojects,
  };
}

function buildUser(userState: ServerUserState): User {
  let contexts = userState.contexts.map(buildContext);
  if (contexts.length == 0) {
    throw new Error("Invalid user.");
  }

  return {
    ...userState,
    inbox: {
      __typename: "Inbox",
      itemCount: userState.inbox,
    },
    defaultContext: contexts[0],
    contexts: new Map(
      contexts.map((context: Context): [string, Context] => [
        context.id,
        context,
      ]),
    ),
  };
}

export function buildState(serverState: ServerState): State {
  return {
    user: serverState.user ? buildUser(serverState.user) : null,
    problems: serverState.problems,
  };
}
