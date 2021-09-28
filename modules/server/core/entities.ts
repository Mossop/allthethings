import type { DateTime } from "luxon";

import type { TaskController } from "../../schema";

export enum ItemType {
  Link = "link",
  File = "file",
  Note = "note",
  Service = "service",
}

interface Identifiable {
  id: string;
}

export interface UserEntity extends Identifiable {
  email: string;

  // This is the hashed password.
  password: string;

  // Whether the user is an admin or not.
  isAdmin: boolean;
}

export type TaskListEntity = ContextEntity | ProjectEntity;
export type ItemHolderEntity = TaskListEntity | SectionEntity;

export interface ContextEntity extends Identifiable {
  userId: string;

  name: string;

  // auto-generated from the name.
  stub: string;
}

// Every context has at least one anonymous project. Its id will match the context's, its name will
// be an empty string and its parentId will be null.
export interface ProjectEntity extends Identifiable {
  userId: string;
  contextId: string;
  parentId: string | null;

  // This will be empty for the anonymous project for the context. In this case contextId == id and
  // parentId == null.
  name: string;

  // auto-generated from the name.
  stub: string;
}

// Every project has at least one anonymous section. Its id will match the project's, its name will
// be an empty string and its index will be -1.
export interface SectionEntity extends Identifiable {
  userId: string;
  projectId: string;

  index: number;

  // This will be empty for the anonymous project for the context. In this case contextId == id and
  // parentId == null.
  name: string;

  // auto-generated from the name.
  stub: string;
}

// Every item.
export interface ItemEntity extends Identifiable {
  userId: string;
  sectionId: string | null;
  sectionIndex: number;

  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  type: ItemType | null;
  created: DateTime;
}

export interface ItemPropertyEntity {
  id: string;
}

// Task data for an item.
export interface TaskInfoEntity extends ItemPropertyEntity {
  due: DateTime | null;
  done: DateTime | null;
  manualDue: DateTime | null;
  manualDone: DateTime | null;
  controller: TaskController;
}

// Data for a link.
export interface LinkDetailEntity extends ItemPropertyEntity {
  icon: string | null;
  url: string;
}

// Data for a note. id is a foreign key to ItemDbTable.id.
export interface NoteDetailEntity extends ItemPropertyEntity {
  url: string;
  note: string;
}

// Data for a file. id is a foreign key to ItemDbTable.id.
export interface FileDetailEntity extends ItemPropertyEntity {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

// Data for a service item. id is a foreign key to ItemDbTable.id.
export interface ServiceDetailEntity extends ItemPropertyEntity {
  serviceId: string;
  hasTaskState: boolean;
  taskDone: DateTime | null;
  taskDue: DateTime | null;
}

// Data for a service list.
export interface ServiceListEntity extends Identifiable {
  serviceId: string;
  name: string;
  url: string | null;
}

export interface ServiceListItemEntity {
  itemId: string;
  listId: string;
  serviceId: string;

  present: DateTime;
  done: DateTime | null;
  due: DateTime | null;
}
