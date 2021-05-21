import type { Overwrite } from "@allthethings/utils";

import type { TaskController } from "../../../schema/dist";
import type { ListContextStateQuery, ListTaskListQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import { useView } from "./view";

export interface PluginItemFields {
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

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

export type TaskInfo = Overwrite<Schema.TaskInfo, {
  controller: TaskController;
}>;

export type PluginItem = State<Schema.Item, BaseItem & {
  detail: Schema.PluginDetail;
  taskInfo: TaskInfo | null;
}>;
export type NoteItem = State<Schema.Item, BaseItem & {
  detail: Schema.NoteDetail;
  taskInfo: TaskInfo | null;
}>;
export type FileItem = State<Schema.Item, BaseItem & {
  detail: Schema.FileDetail;
  taskInfo: TaskInfo | null;
}>;
export type LinkItem = State<Schema.Item, BaseItem & {
  detail: Schema.LinkDetail;
  taskInfo: TaskInfo | null;
}>;
export type TaskItem = State<Schema.Item, BaseItem & {
  taskInfo: TaskInfo;
  detail: null;
}>;
export type Item = TaskItem | LinkItem | NoteItem | FileItem | PluginItem;

export type WithTask<T extends Item> = Overwrite<T, {
  taskInfo: TaskInfo;
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

export function isItem(val: GraphQLType): val is Item {
  return val.__typename == "Item";
}

export function isPluginItem(item: Item): item is PluginItem {
  return item.detail?.__typename == "PluginDetail";
}

export function isNoteItem(item: Item): item is NoteItem {
  return item.detail?.__typename == "NoteDetail";
}

export function isLinkItem(item: Item): item is LinkItem {
  return item.detail?.__typename == "LinkDetail";
}

export function isFileItem(item: Item): item is FileItem {
  return item.detail?.__typename == "FileDetail";
}

export function isTaskItem(item: Item): item is TaskItem {
  return !item.detail && !!item.taskInfo;
}

export function isTask(item: PluginItem): item is WithTask<PluginItem>;
export function isTask(item: NoteItem): item is WithTask<NoteItem>;
export function isTask(item: FileItem): item is WithTask<FileItem>;
export function isTask(item: LinkItem): item is WithTask<LinkItem>;
export function isTask(item: Item): item is WithTask<Item>;
export function isTask(item: Item): boolean {
  return !!item.taskInfo;
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
  items: readonly Schema.Item[],
): Item[] {
  return items.map((item: Schema.Item): Item => {
    let taskInfo = item.taskInfo ? item.taskInfo as TaskInfo : null;

    if (item.detail) {
      return {
        ...item,
        taskInfo,
        detail: item.detail,
        parent,
      };
    }

    if (!taskInfo) {
      throw new Error("Basic item is missing task info.");
    }

    return {
      ...item,
      taskInfo,
      detail: null,
      parent,
    };
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
