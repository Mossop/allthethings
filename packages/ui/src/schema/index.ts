import type { Overwrite } from "@allthethings/utils";

import type * as Schema from "./types";

export type ItemInbox = Pick<Schema.Inbox, "id" | "__typename">;
export type ItemUser = Pick<Schema.User, "id" | "__typename">;
export type ItemContext = Pick<Schema.Context, "id" | "__typename">;
export type ItemProject = Pick<Schema.Project, "id" | "__typename">;

export type ItemTaskList = ItemUser | ItemContext | ItemProject;

export type ItemSection = Pick<Schema.Section, "id" | "__typename"> & {
  taskList: ItemTaskList;
};

export type Item = Overwrite<Schema.Item, {
  parent: ItemInbox | ItemTaskList | ItemSection;
}>;

export type TaskInfo = Schema.TaskInfo;
