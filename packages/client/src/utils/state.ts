import type { ListContextStateQuery, ListTaskListQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import { useView } from "./view";

export interface PluginItemFields {
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

type SchemaItem = Schema.Task | Schema.Note | Schema.File | Schema.Link | Schema.PluginItem;

// eslint-disable-next-line @typescript-eslint/ban-types
type StateO<T, O extends string, A = {}> = Omit<T, O | keyof A> & A;
// eslint-disable-next-line @typescript-eslint/ban-types
type State<T, A = {}> = Omit<T, keyof A> & A;

export type Project = StateO<Schema.Project, "taskList" | "items" | "sections", {
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
}>;

export type Inbox = State<Schema.Inbox, {
  items: Item[];
}>;

export type User = StateO<Schema.User, "password" | "items" | "sections", {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly contexts: ReadonlyMap<string, Context>;
  readonly inbox: Inbox;
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

interface BaseItem {
  parent: Inbox | TaskList | Section;
}

export type Link = State<Schema.Link, BaseItem>;
export type Note = State<Schema.Note, BaseItem>;
export type File = State<Schema.File, BaseItem>;
export type Task = State<Schema.Task, BaseItem>;
export type PluginItem = StateO<Schema.PluginItem, "pluginFields", BaseItem>;

export type Item = Task | Note | File | Link | PluginItem;
export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;

interface GraphQLType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: string;
}

export function isInbox(val: GraphQLType): val is Inbox {
  return val.__typename == "Inbox";
}

export function isSection(val: GraphQLType): val is Section {
  return val.__typename == "Section";
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

export function isLink(val: GraphQLType): val is Link {
  return val.__typename == "Link";
}

export function isNote(val: GraphQLType): val is Note {
  return val.__typename == "Note";
}

export function isFile(val: GraphQLType): val is File {
  return val.__typename == "File";
}

export function isTask(val: GraphQLType): val is Task {
  return val.__typename == "Task";
}

export function isPluginItem(val: GraphQLType): val is PluginItem {
  return val.__typename == "PluginItem";
}

export function isItem(val: GraphQLType): val is Task {
  return isFile(val) || isNote(val) || isTask(val) || isLink(val) || isPluginItem(val);
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

export function buildItems(
  parent: Inbox | TaskList | Section,
  items: readonly SchemaItem[],
): Item[] {
  return items.map((item: SchemaItem): Item => {
    if (isPluginItem(item)) {
      let {
        pluginFields,
        ...fields
      } = item;

      let itemFields: PluginItemFields = JSON.parse(pluginFields);
      return {
        ...itemFields,
        ...fields,
        parent,
      };
    } else {
      return {
        ...item,
        parent,
      };
    }
  });
}

export interface ProjectEntries {
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
    items: buildItems(taskList, data.taskList.items),
    sections: data.taskList.sections.map((schema: Schema.Section): Section => {
      let section: Section = {
        ...schema,
        items: [],
        taskList,
      };

      // @ts-ignore
      section.items = buildItems(section, schema.items);
      return section;
    }),
  };
}
