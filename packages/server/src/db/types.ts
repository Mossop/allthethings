import type { DateTime } from "luxon";

// This stucture is a little complex to support having items and sections available at multiple
// levels.

export enum ItemType {
  Task = "task",
  Link = "link",
  File = "file",
  Note = "note",
}

export interface DbEntity {
  // unique identifier
  id: string;
}

export interface IndexedDbEntity extends DbEntity {
  ownerId: string;
  index: number;
}

// Represents the user, one per user obviously.
export interface UserDbObject extends DbEntity {
  // unique
  email: string;
  // This is the hashed password.
  password: string;
}

// Every user has at least one anonymous context. Its id will match the user's and its name will
// be an empty string.
//
// unique index on userId, stub.
export interface ContextDbObject extends DbEntity {
  // Foreign key to UserDbObject.id.
  userId: string;
  // This will be empty for the anonymous context for the user. In this case userId == id.
  name: string;
  // auto-generated from the name.
  stub: string;
}

// Every context has at least one anonymous project. Its id will match the context's, its name will
// be an empty string and its parentId will be null.
//
// unique index on contextId, parentId, stub.
// foreign key on contextId, parentId to ProjectDbObject contextId, id.
export interface ProjectDbObject extends DbEntity {
  // Foreign key to ContextDbObject.id.
  contextId: string;
  parentId: string | null;
  // This will be empty for the anonymous project for the context. In this case contextId == id and
  // parentId == null.
  name: string;
  // auto-generated from the name.
  stub: string;
}

// Every project has at least one anonymous section. Its id will match the project's, its name will
// be an empty string and its index will be -1. Every user has an additional anonymous section, its
// name will be an empty string and its index wll be -2.
//
// unique index on ownerId, index.
// unique index on ownerId, stub.
export interface SectionDbObject extends IndexedDbEntity {
  // This will be empty for the anonymous section for the project. In this case ownerId == id and
  // index = -1.
  name: string;
  // auto-generated from the name.
  stub: string;
}

// Every item, abstract.
export interface ItemDbObject extends IndexedDbEntity {
  summary: string;
  type: ItemType;
  created: DateTime;
}

// A special instance of an item. id is a foreign key to ItemDbObject.id.
export interface TaskItemDbObject extends DbEntity {
  due: DateTime | null;
  done: DateTime | null;
  link: string | null;
}

// A link artifact.
export interface LinkItemDbObject extends DbEntity {
  icon: string | null;
  link: string;
}

// A note artifact.
export interface NoteItemDbObject extends DbEntity {
  note: string;
}

// A file artifact.
export interface FileItemDbObject extends DbEntity {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}
