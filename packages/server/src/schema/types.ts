/* eslint-disable */
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
};

export type Item = {
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
};

export type Task = Item & {
  readonly __typename?: 'Task';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly done: Scalars['Boolean'];
  readonly link?: Maybe<Scalars['String']>;
};

export type File = Item & {
  readonly __typename?: 'File';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type Note = Item & {
  readonly __typename?: 'Note';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly note: Scalars['String'];
};

export type Link = Item & {
  readonly __typename?: 'Link';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly link: Scalars['String'];
};

export type TaskList = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
};

export type ProjectRoot = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type User = ProjectRoot & TaskList & {
  readonly __typename?: 'User';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly contexts: ReadonlyArray<Context>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Context = ProjectRoot & TaskList & {
  readonly __typename?: 'Context';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type Section = {
  readonly __typename?: 'Section';
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly taskList?: Maybe<TaskList>;
  readonly root?: Maybe<ProjectRoot>;
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};


export type QueryRootArgs = {
  id: Scalars['ID'];
};

export type CreateContextParams = {
  readonly name: Scalars['String'];
};

export type EditContextParams = {
  readonly name?: Maybe<Scalars['String']>;
};

export type CreateProjectParams = {
  readonly name: Scalars['String'];
};

export type EditProjectParams = {
  readonly name?: Maybe<Scalars['String']>;
};

export type CreateSectionParams = {
  readonly name: Scalars['String'];
};

export type EditSectionParams = {
  readonly name?: Maybe<Scalars['String']>;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly editContext?: Maybe<Context>;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject?: Maybe<Project>;
  readonly editProject?: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection?: Maybe<Section>;
  readonly editSection?: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  params: CreateContextParams;
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: EditContextParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  taskList?: Maybe<Scalars['ID']>;
  params: CreateProjectParams;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: EditProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  taskList?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
  params: CreateSectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: EditSectionParams;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};
