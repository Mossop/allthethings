import type { TaskController } from "@allthethings/schema";
import type { Overwrite, ArrayContents } from "@allthethings/utils";

import type { Inbox, TaskList } from "./contextState";
import type { ClientItemFieldsFragment } from "./fragments";
import type { ListTaskListQuery } from "./queries";
import { useListTaskListQuery } from "./queries";
import type * as Schema from "./types";

type StateQuery = ListTaskListQuery;
type StateQuery$TaskList = NonNullable<StateQuery["taskList"]>;
type StateQuery$TaskList$Section = ArrayContents<StateQuery$TaskList["sections"]>;
type StateQuery$TaskList$Item$TaskInfo = NonNullable<ClientItemFieldsFragment["taskInfo"]>;

export type PluginList = Schema.PluginList;

export type LinkDetail = Schema.LinkDetail;
export type NoteDetail = Schema.NoteDetail;
export type PluginDetail = Overwrite<Schema.PluginDetail, {
  lists: PluginList[];
}>;
export type FileDetail = Schema.FileDetail;
export type Detail = LinkDetail | NoteDetail | PluginDetail | FileDetail;

export type TaskInfo = Overwrite<StateQuery$TaskList$Item$TaskInfo, {
  controller: TaskController;
}>;

export type Section = Overwrite<StateQuery$TaskList$Section, {
  remainingTasks: number;
  items: Item[];
  taskList: TaskList;
}>;

export interface TaskListContents {
  taskList: TaskList;
  items: Item[];
  sections: Section[];
}

type BaseItem = Overwrite<ClientItemFieldsFragment, {
  parent: Section | TaskList | Inbox;
  taskInfo: TaskInfo | null;
  detail: Detail | null;
}>;

export type PluginItem = Overwrite<BaseItem, {
  detail: PluginDetail;
}>;
export type NoteItem = Overwrite<BaseItem, {
  detail: NoteDetail;
}>;
export type FileItem = Overwrite<BaseItem, {
  detail: FileDetail;
}>;
export type LinkItem = Overwrite<BaseItem, {
  detail: LinkDetail;
}>;
export type TaskItem = Overwrite<BaseItem, {
  taskInfo: TaskInfo;
  detail: null;
}>;
export type Item = TaskItem | LinkItem | NoteItem | FileItem | PluginItem;

export type WithTask<T extends Item> = Overwrite<T, {
  taskInfo: TaskInfo;
}>;

interface GraphQLType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: string;
}

export function isSection(val: GraphQLType): val is Section {
  return val.__typename == "Section";
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

export function sectionTaskList(section: Inbox | Section | TaskList): Inbox | TaskList {
  return isSection(section) ? section.taskList : section;
}

export function itemTaskList(item: Item): Inbox | TaskList {
  return sectionTaskList(item.parent);
}

export function buildItem(
  parent: TaskList | Section | Inbox,
  queryResult: ClientItemFieldsFragment,
): Item {
  // TODO: Type correctly.
  return {
    ...queryResult,
    parent,
  } as Item;
}

function buildSection(taskList: TaskList, queryResult: StateQuery$TaskList$Section): Section {
  let section: Section = {
    ...queryResult,
    taskList,
    items: [],
    remainingTasks: queryResult.remainingTasks.count,
  };

  section.items = queryResult.items.items.map(buildItem.bind(null, section));
  return section;
}

export function useTaskListContents(taskList: TaskList): TaskListContents {
  let { data } = useListTaskListQuery({
    variables: {
      taskList: taskList.id,
    },
    pollInterval: 30000,
  });

  if (!data?.taskList) {
    return {
      taskList,
      items: [],
      sections: [],
    };
  }

  return {
    taskList,
    items: data.taskList.items.items.map(buildItem.bind(null, taskList)),
    sections: data.taskList.sections.map(buildSection.bind(null, taskList)),
  };
}
