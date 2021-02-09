import type { ListContextStateQuery, ListTaskListQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import { useView } from "./view";

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

type SchemaItem = Schema.Task | Schema.Note | Schema.File | Schema.Link;

// eslint-disable-next-line @typescript-eslint/ban-types
type StateO<T, O extends string, A = {}> = Omit<T, O | keyof A> & A;
// eslint-disable-next-line @typescript-eslint/ban-types
type State<T, A = {}> = Omit<T, keyof A> & A;

export type Project = StateO<Schema.Project, "taskList" | "items" | "sections", {
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
}>;

export type User = StateO<Schema.User, "password" | "items" | "sections", {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly contexts: ReadonlyMap<string, Context>;
}>;

export type Context = StateO<Schema.Context, "user" | "items" | "sections", {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
}>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Section = State<Schema.Section, {
  items: Item[];
  taskList: TaskList;
}>;

export type Link = State<Schema.Link>;
export type Note = State<Schema.Note>;
export type File = State<Schema.File>;
export type Task = State<Schema.Task>;

export type Item = Task | Note | File | Link;
export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;

export function isSection(list: TaskList | Section): list is Section {
  return list.__typename == "Section";
}

export function isContext(list: TaskList | Section): list is Context {
  return list.__typename == "Context";
}

export function isProject(list: TaskList | Section): list is Project {
  return list.__typename == "Project";
}

export function isUser(list: TaskList | Section): list is User {
  return list.__typename == "User";
}

export function useUser(): User {
  return useView().user;
}

export function useContexts(): ReadonlyMap<string, Context> {
  return useUser().contexts;
}

export function useProjectRoot(): ProjectRoot {
  let state = useView();
  return state.context ?? state.user;
}

export function useCurrentContext(): Context | null {
  let state = useView();
  return state.context ?? null;
}

type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;
type UserState = NonNullable<ListContextStateQuery["user"]>;
type ContextState = ArrayContents<UserState["contexts"]>;
type ProjectData = ArrayContents<UserState["projects"]>;

export function buildProjects(
  root: UserState | ContextState,
): Pick<User, "projects" | "subprojects"> {
  let projectMap = new Map(
    root.projects.map((data: ProjectData): [string, ProjectData] => {
      return [data.id, data];
    }),
  );

  let projects = new Map<string, Project>();

  let buildProjects = (
    list: readonly { id: string }[],
    parent: Project | null,
  ): readonly Project[] => {
    return list.map(({ id }: { id: string }): Project => {
      let data = projectMap.get(id);
      if (!data) {
        throw new Error("Unknown project.");
      }

      let project: Writable<Project> = {
        ...data,
        parent,
        subprojects: [],
      };

      project.subprojects = buildProjects(data.subprojects, project);
      projects.set(project.id, project);

      return project;
    });
  };

  return {
    projects,
    subprojects: buildProjects(root.subprojects, null),
  };
}

export function buildItems(items: readonly SchemaItem[]): Item[] {
  return [...items];
}

interface ProjectEntries {
  items: Item[];
  sections: Section[];
}

export function buildEntries(
  taskList: TaskList,
  data: ListTaskListQuery | undefined,
): ProjectEntries {
  if (!data?.taskList) {
    return {
      items: [],
      sections: [],
    };
  }

  return {
    items: buildItems(data.taskList.items),
    sections: data.taskList.sections.map((section: Schema.Section): Section => ({
      ...section,
      // @ts-ignore
      items: buildItems(section.items),
      taskList,
    })),
  };
}
