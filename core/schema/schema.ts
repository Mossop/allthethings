/* eslint-disable */
import type { DateTime } from 'luxon';
import type { TaskController } from './types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
  TaskController: TaskController;
};

export type Context = TaskList & {
  readonly __typename: 'Context';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly rootItems: ItemSet;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ContextParams = {
  readonly name: Scalars['String'];
};


export type FileDetail = {
  readonly __typename: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type Item = {
  readonly __typename: 'Item';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly created: Scalars['DateTime'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
  readonly taskInfo: Maybe<TaskInfo>;
  readonly detail: Maybe<ItemDetail>;
};

export type ItemDetail = PluginDetail | LinkDetail | NoteDetail | FileDetail;

export type ItemParams = {
  readonly summary: Scalars['String'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
};

export type ItemSet = {
  readonly __typename: 'ItemSet';
  readonly count: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly snoozed: ItemSet;
  readonly archived: ItemSet;
  readonly due: ItemSet;
  readonly isTask: ItemSet;
};


export type ItemSetSnoozedArgs = {
  isSnoozed: Maybe<Scalars['Boolean']>;
};


export type ItemSetArchivedArgs = {
  isArchived: Maybe<Scalars['Boolean']>;
};


export type ItemSetDueArgs = {
  before: Maybe<Scalars['DateTime']>;
  after: Maybe<Scalars['DateTime']>;
};


export type ItemSetIsTaskArgs = {
  done: Maybe<Scalars['Boolean']>;
};

export type LinkDetail = {
  readonly __typename: 'LinkDetail';
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
};

export type LinkDetailParams = {
  readonly url: Scalars['String'];
};

export type Mutation = {
  readonly __typename: 'Mutation';
  readonly login: Maybe<User>;
  readonly logout: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly editContext: Maybe<Context>;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject: Maybe<Project>;
  readonly editProject: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection: Maybe<Section>;
  readonly editSection: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
  readonly createTask: Item;
  readonly createNote: Item;
  readonly createLink: Item;
  readonly editItem: Maybe<Item>;
  readonly editTaskInfo: Maybe<Item>;
  readonly editTaskController: Maybe<Item>;
  readonly moveItem: Maybe<Item>;
  readonly deleteItem: Scalars['Boolean'];
  readonly archiveItem: Maybe<Item>;
  readonly snoozeItem: Maybe<Item>;
  readonly markItemDue: Maybe<Item>;
  readonly createUser: User;
  readonly deleteUser: Maybe<Scalars['Boolean']>;
  readonly changePassword: Maybe<User>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  user: Maybe<Scalars['ID']>;
  params: ContextParams;
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  taskList: Scalars['ID'];
  params: ProjectParams;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationCreateTaskArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
};


export type MutationCreateNoteArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateLinkArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationEditTaskControllerArgs = {
  id: Scalars['ID'];
  controller: Maybe<Scalars['TaskController']>;
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  section: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationArchiveItemArgs = {
  id: Scalars['ID'];
  archived: Maybe<Scalars['DateTime']>;
};


export type MutationSnoozeItemArgs = {
  id: Scalars['ID'];
  snoozed: Maybe<Scalars['DateTime']>;
};


export type MutationMarkItemDueArgs = {
  id: Scalars['ID'];
  due: Maybe<Scalars['DateTime']>;
};


export type MutationCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  isAdmin: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteUserArgs = {
  id: Maybe<Scalars['ID']>;
};


export type MutationChangePasswordArgs = {
  id: Maybe<Scalars['ID']>;
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
};

export type NoteDetail = {
  readonly __typename: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type PluginDetail = {
  readonly __typename: 'PluginDetail';
  readonly pluginId: Scalars['String'];
  readonly hasTaskState: Scalars['Boolean'];
  readonly wasEverListed: Scalars['Boolean'];
  readonly isCurrentlyListed: Scalars['Boolean'];
  readonly fields: Scalars['String'];
  readonly lists: ReadonlyArray<PluginList>;
};

export type PluginList = {
  readonly __typename: 'PluginList';
  readonly id: Scalars['ID'];
  readonly pluginId: Scalars['String'];
  readonly name: Scalars['String'];
  readonly url: Maybe<Scalars['String']>;
};

export type Problem = {
  readonly __typename: 'Problem';
  readonly description: Scalars['String'];
  readonly url: Scalars['String'];
};

export type Project = TaskList & {
  readonly __typename: 'Project';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type Query = {
  readonly __typename: 'Query';
  readonly user: Maybe<User>;
  readonly problems: ReadonlyArray<Problem>;
  readonly users: ReadonlyArray<User>;
  readonly taskList: Maybe<TaskList>;
  readonly pageContent: Scalars['String'];
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};


export type QueryPageContentArgs = {
  path: Scalars['String'];
};

export type Section = {
  readonly __typename: 'Section';
  readonly items: ItemSet;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type SectionParams = {
  readonly name: Scalars['String'];
};


export type TaskInfo = {
  readonly __typename: 'TaskInfo';
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
  readonly controller: Scalars['TaskController'];
};

export type TaskInfoParams = {
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
};

export type TaskList = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
};

export type User = {
  readonly __typename: 'User';
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly contexts: ReadonlyArray<Context>;
  readonly inbox: ItemSet;
  readonly isAdmin: Scalars['Boolean'];
  readonly allItems: ItemSet;
};
