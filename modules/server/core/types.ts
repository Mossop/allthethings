import type { DateTime } from "luxon";

import type { TaskController } from "#schema";
import type { Identifiable } from "#server/utils";

export enum ItemType {
  Link = "link",
  File = "file",
  Note = "note",
  Service = "service",
}

export interface IndexedEntity {
  ownerId: string;
  userId: string;
  index: number;
}

export type UserRecord = Identifiable<{
  // unique
  email: string;
  // This is the hashed password.
  password: string;
  // Whether the user is an admin or not.
  isAdmin: boolean;
}>;

// unique index on userId, stub.
export type ContextRecord = Identifiable<{
  // Foreign key to UserDbTable.id.
  userId: string;
  // This will be empty for the anonymous context for the user. In this case userId == id.
  name: string;
  // auto-generated from the name.
  stub: string;
}>;

export type ContextInsertRecord = Omit<ContextRecord, "stub">;

// Every context has at least one anonymous project. Its id will match the context's, its name will
// be an empty string and its parentId will be null.
//
// unique index on contextId, parentId, stub.
// foreign key on contextId, parentId to ProjectDbTable contextId, id.
export type ProjectRecord = Identifiable<{
  // Foreign key to ContextDbTable.id.
  contextId: string;
  // Foreign key to UserDbTable.id.
  userId: string;
  parentId: string | null;
  // This will be empty for the anonymous project for the context. In this case contextId == id and
  // parentId == null.
  name: string;
  // auto-generated from the name.
  stub: string;
}>;

export type ProjectInsertRecord = Omit<ProjectRecord, "stub">;

// Every project has at least one anonymous section. Its id will match the project's, its name will
// be an empty string and its index will be -1. Every user has an additional anonymous section, its
// name will be an empty string and its index wll be -2.
//
// unique index on ownerId, index.
// unique index on ownerId, stub.
export type SectionRecord = Identifiable<
  IndexedEntity & {
    // This will be empty for the anonymous section for the project. In this case ownerId == id and
    // index = -1.
    name: string;
    // auto-generated from the name.
    stub: string;
  }
>;

export type SectionInsertRecord = Omit<SectionRecord, "stub">;

// Every item.
export type ItemRecord = Identifiable<{
  // Foreign key to UserDbTable.id.
  userId: string;
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  type: ItemType | null;
  created: DateTime;
}>;

export type SectionItemsRecord = Identifiable<IndexedEntity>;

// Task data for an item. id is a foreign key to ItemDbTable.id
export type TaskInfoRecord = Identifiable<{
  due: DateTime | null;
  done: DateTime | null;
  manualDue: DateTime | null;
  manualDone: DateTime | null;
  controller: TaskController;
}>;

// Data for a link. id is a foreign key to ItemDbTable.id.
export type LinkDetailRecord = Identifiable<{
  icon: string | null;
  url: string;
}>;

// Data for a note. id is a foreign key to ItemDbTable.id.
export type NoteDetailRecord = Identifiable<{
  note: string;
}>;

// Data for a file. id is a foreign key to ItemDbTable.id.
export type FileDetailRecord = Identifiable<{
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}>;

// Data for a service item. id is a foreign key to ItemDbTable.id.
export type ServiceDetailRecord = Identifiable<{
  serviceId: string;
  hasTaskState: boolean;
  taskDone: DateTime | null;
  taskDue: DateTime | null;
}>;

// Data for a service list.
export type ServiceListRecord = Identifiable<{
  serviceId: string;
  name: string;
  url: string | null;
}>;

export interface ServiceListItemsRecord {
  serviceId: string;
  itemId: string;
  listId: string;
  present: DateTime;
  done: DateTime | null;
  due: DateTime | null;
}
