import type { DateTime } from "luxon";

import type { GraphQLType } from ".";
import type { Overwrite } from "../../../utils";
import { decodeDateTime } from "../../../utils";
import type {
  FileDetailState,
  ItemState,
  LinkDetailState,
  NoteDetailState,
  SectionContents,
  ServiceDetailState,
  ServiceListState,
  TaskInfoState,
} from "../../utils";
import { api, queryHook } from "../../utils";
import type { Inbox, TaskList } from "./contextState";

export type ServiceList = ServiceListState;

export type LinkDetail = LinkDetailState;
export type NoteDetail = NoteDetailState;
export type ServiceDetail = ServiceDetailState;
export type FileDetail = FileDetailState;
export type Detail = LinkDetail | NoteDetail | ServiceDetail | FileDetail;

export type TaskInfo = Overwrite<
  TaskInfoState,
  {
    due: DateTime | null;
    done: DateTime | null;
  }
>;

export type Section = Overwrite<
  SectionContents,
  {
    taskList: TaskList;
    items: Item[];
  }
>;

export interface TaskListContents {
  taskList: TaskList;
  items: Item[];
  sections: Section[];
}

type BaseItem = Overwrite<
  ItemState,
  {
    parent: Section | TaskList | Inbox;
    detail: Detail | null;
    snoozed: DateTime | null;
    archived: DateTime | null;
    taskInfo: TaskInfo | null;
  }
>;

export type ServiceItem = Overwrite<
  BaseItem,
  {
    detail: ServiceDetail;
  }
>;
export type NoteItem = Overwrite<
  BaseItem,
  {
    detail: NoteDetail;
  }
>;
export type FileItem = Overwrite<
  BaseItem,
  {
    detail: FileDetail;
  }
>;
export type LinkItem = Overwrite<
  BaseItem,
  {
    detail: LinkDetail;
  }
>;
export type TaskItem = Overwrite<
  BaseItem,
  {
    taskInfo: TaskInfo;
    detail: null;
  }
>;
export type Item = TaskItem | LinkItem | NoteItem | FileItem | ServiceItem;

export type WithTask<T extends Item> = Overwrite<
  T,
  {
    taskInfo: TaskInfo;
  }
>;

export function isSection(val: GraphQLType): val is Section {
  return val.__typename == "Section";
}

export function isItem(val: GraphQLType): val is Item {
  return val.__typename == "Item";
}

export function isServiceItem(item: Item): item is ServiceItem {
  return item.detail?.__typename == "ServiceDetail";
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

export function isTask(item: ServiceItem): item is WithTask<ServiceItem>;
export function isTask(item: NoteItem): item is WithTask<NoteItem>;
export function isTask(item: FileItem): item is WithTask<FileItem>;
export function isTask(item: LinkItem): item is WithTask<LinkItem>;
export function isTask(item: Item): item is WithTask<Item>;
export function isTask(item: Item): boolean {
  return !!item.taskInfo;
}

export function sectionTaskList(
  section: Inbox | Section | TaskList,
): Inbox | TaskList {
  return isSection(section) ? section.taskList : section;
}

export function itemTaskList(item: Item): Inbox | TaskList {
  return sectionTaskList(item.parent);
}

function buildTaskInfo(taskInfo: TaskInfoState): TaskInfo {
  return {
    ...taskInfo,
    due: decodeDateTime(taskInfo.due),
    done: decodeDateTime(taskInfo.done),
  };
}

export function buildItem(
  parent: TaskList | Section | Inbox,
  item: ItemState,
): Item {
  // TODO: Type correctly.
  return {
    ...item,
    parent,
    snoozed: decodeDateTime(item.snoozed),
    archived: decodeDateTime(item.archived),
    taskInfo: item.taskInfo ? buildTaskInfo(item.taskInfo) : null,
  } as Item;
}

function buildSection(taskList: TaskList, contents: SectionContents): Section {
  let section: Section = {
    ...contents,
    taskList,
    items: [],
  };

  section.items = contents.items.map(buildItem.bind(null, section));
  return section;
}

const useItemList = queryHook(api.project.listContents, {
  pollInterval: 60000,
});

export function useTaskListContents(taskList: TaskList): TaskListContents {
  let [data] = useItemList({
    id: taskList.id,
  });

  if (!data) {
    return {
      taskList,
      items: [],
      sections: [],
    };
  }

  return {
    taskList,
    items: data.items.map(buildItem.bind(null, taskList)),
    sections: data.sections.map(buildSection.bind(null, taskList)),
  };
}
