import type { TaskController } from "@allthethings/schema";
import type { Knex } from "knex";
import type { DateTime } from "luxon";

// This stucture is a little complex to support having items and sections available at multiple
// levels.

export enum ItemType {
  Link = "link",
  File = "file",
  Note = "note",
  Plugin = "plugin",
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type DbTable<T = {}, A = {}> = Knex.CompositeTableType<
  Required<T> & A & DbEntity,
  T & DbEntity,
  Partial<T>
>;

export type DbObject<T> = Knex.ResolveTableType<T, "base">;
export type DbInsertObject<T> = Knex.ResolveTableType<T, "insert">;
export type DbUpdateObject<T> = Knex.ResolveTableType<T, "update">;

export interface DbEntity {
  // unique identifier
  id: string;
}

export interface IndexedDbEntity {
  ownerId: string;
  index: number;
}

// Represents the user, one per user obviously.
export type UserDbTable = DbTable<{
  // unique
  email: string;
  // This is the hashed password.
  password: string;
}>;

// Every user has at least one anonymous context. Its id will match the user's and its name will
// be an empty string.
//
// unique index on userId, stub.
export type ContextDbTable = DbTable<{
  // Foreign key to UserDbTable.id.
  userId: string;
  // This will be empty for the anonymous context for the user. In this case userId == id.
  name: string;
}, {
  // auto-generated from the name.
  stub: string;
}>;

// Every context has at least one anonymous project. Its id will match the context's, its name will
// be an empty string and its parentId will be null.
//
// unique index on contextId, parentId, stub.
// foreign key on contextId, parentId to ProjectDbTable contextId, id.
export type ProjectDbTable = DbTable<{
  // Foreign key to ContextDbTable.id.
  contextId: string;
  parentId: string | null;
  // This will be empty for the anonymous project for the context. In this case contextId == id and
  // parentId == null.
  name: string;
}, {
  // auto-generated from the name.
  stub: string;
}>;

// Every project has at least one anonymous section. Its id will match the project's, its name will
// be an empty string and its index will be -1. Every user has an additional anonymous section, its
// name will be an empty string and its index wll be -2.
//
// unique index on ownerId, index.
// unique index on ownerId, stub.
export type SectionDbTable = DbTable<IndexedDbEntity & {
  // This will be empty for the anonymous section for the project. In this case ownerId == id and
  // index = -1.
  name: string;
}, {
  // auto-generated from the name.
  stub: string;
}>;

// Every item.
export type ItemDbTable = DbTable<IndexedDbEntity & {
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
  type: ItemType | null;
}, {
  created: DateTime;
}>;

// Task data for an item. id is a foreign key to ItemDbTable.id
export type TaskInfoDbTable = DbTable<{
  due: DateTime | null;
  done: DateTime | null;
  controller: TaskController;
}>;

// Data for a link. id is a foreign key to ItemDbTable.id.
export type LinkDetailDbTable = DbTable<{
  icon: string | null;
  url: string;
}>;

// Data for a note. id is a foreign key to ItemDbTable.id.
export type NoteDetailDbTable = DbTable<{
  note: string;
}>;

// Data for a file. id is a foreign key to ItemDbTable.id.
export type FileDetailDbTable = DbTable<{
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}>;

// Data for a plugin item. id is a foreign key to ItemDbTable.id.
export type PluginDetailDbTable = DbTable<{
  pluginId: string;
  hasTaskState: boolean;
  taskDone: DateTime | null;
}>;

// Data for a plugin list.
export type PluginListDbTable = DbTable<{
  pluginId: string;
  name: string;
  url: string | null;
}>;

export interface PluginListItem {
  pluginId: string;
  listId: string;
  itemId: string;
  present: boolean;
}

export type PluginListItemsDbTable = Knex.CompositeTableType<
  PluginListItem
>;
