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

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  password: Scalars['String'];
  contexts: Array<Context>;
  emptyContext?: Maybe<EmptyContext>;
};

export type ProjectContext = Context | EmptyContext;

export type Context = {
  __typename?: 'Context';
  id: Scalars['ID'];
  user: User;
  name: Scalars['String'];
  projects: Array<Project>;
};

export type EmptyContext = {
  __typename?: 'EmptyContext';
  user: User;
  projects: Array<Project>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  parent?: Maybe<Project>;
  context?: Maybe<ProjectContext>;
  name?: Maybe<Scalars['String']>;
  subprojects: Array<Project>;
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  context?: Maybe<Context>;
};


export type QueryContextArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login?: Maybe<User>;
  logout?: Maybe<Scalars['Boolean']>;
  createContext: Context;
  createProject: Project;
  assignContext?: Maybe<Project>;
  assignParent?: Maybe<Project>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  name: Scalars['String'];
};


export type MutationCreateProjectArgs = {
  name: Scalars['String'];
  parent?: Maybe<Scalars['ID']>;
  context?: Maybe<Scalars['ID']>;
};


export type MutationAssignContextArgs = {
  project: Scalars['ID'];
  context?: Maybe<Scalars['ID']>;
};


export type MutationAssignParentArgs = {
  project: Scalars['ID'];
  parent?: Maybe<Scalars['ID']>;
};
