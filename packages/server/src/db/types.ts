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
// be an empty string and its index will be -1.
//
// unique index on projectId, index.
// unique index on projectId, stub.
export interface SectionDbObject extends DbEntity {
  // Foreign key to ProjectDbObject.id.
  projectId: string;
  index: number;
  // This will be empty for the anonymous section for the project. In this case projectId == id and
  // index = -1.
  name: string;
  // auto-generated from the name.
  stub: string;
}

// Puts items into sections.
//
// unique index on sectionId, index.
export interface SectionItemLink {
  // Foreign key to SectionDbObject.id.
  sectionId: string;
  // Foreign key to ItemDbObject.id. Unique within table.
  itemId: string;
  // The index of the item in the section.
  index: number;
}

// Every item, abstract.
export interface ItemDbObject extends DbEntity {
  // Foreign key to UserDbObject.id
  userId: string;
  icon: string | null;
  summary: string;
  type: ItemType;
}

// A special instance of an item. id is a foreign key to ItemDbObject.id.
export interface TaskItemDbObject extends DbEntity {
  done: boolean;
  link: string | null;
}

// A link artifact.
export interface LinkItemDbObject extends DbEntity {
  link: string;
}

// A note artifact.
export interface NoteItemDbObject extends DbEntity {
  note: string;
}

// A file artifact.
export interface FileItemDbObject extends DbEntity {
  path: string;
}
