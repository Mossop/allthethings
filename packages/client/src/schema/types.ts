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

export type Owner = {
  id: Scalars['ID'];
  user: User;
  context: Context;
  subprojects: Array<Project>;
  descend?: Maybe<Owner>;
};


export type OwnerDescendArgs = {
  stubs: Array<Scalars['String']>;
};

export type Context = {
  id: Scalars['ID'];
  projects: Array<Project>;
};

export type User = Context & Owner & {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  password: Scalars['String'];
  namedContexts: Array<NamedContext>;
  user: User;
  context: Context;
  projects: Array<Project>;
  subprojects: Array<Project>;
  descend?: Maybe<Owner>;
};


export type UserDescendArgs = {
  stubs: Array<Scalars['String']>;
};

export type NamedContext = Context & Owner & {
  __typename?: 'NamedContext';
  id: Scalars['ID'];
  user: User;
  context: Context;
  stub: Scalars['String'];
  name: Scalars['String'];
  projects: Array<Project>;
  subprojects: Array<Project>;
  descend?: Maybe<Owner>;
};


export type NamedContextDescendArgs = {
  stubs: Array<Scalars['String']>;
};

export type Project = Owner & {
  __typename?: 'Project';
  id: Scalars['ID'];
  user: User;
  context: Context;
  namedContext?: Maybe<NamedContext>;
  parent?: Maybe<Project>;
  owner: Owner;
  stub: Scalars['String'];
  name: Scalars['String'];
  subprojects: Array<Project>;
  descend?: Maybe<Owner>;
};


export type ProjectDescendArgs = {
  stubs: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  context?: Maybe<Context>;
  owner?: Maybe<Owner>;
};


export type QueryContextArgs = {
  id: Scalars['ID'];
};


export type QueryOwnerArgs = {
  id: Scalars['ID'];
};

export type CreateNamedContextParams = {
  name: Scalars['String'];
};

export type CreateProjectParams = {
  name: Scalars['String'];
  owner?: Maybe<Scalars['ID']>;
};

export type UpdateProjectParams = {
  name: Scalars['String'];
  owner?: Maybe<Scalars['ID']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login?: Maybe<User>;
  logout?: Maybe<Scalars['Boolean']>;
  createNamedContext: NamedContext;
  deleteNamedContext: Scalars['Boolean'];
  createProject: Project;
  deleteProject: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateNamedContextArgs = {
  params: CreateNamedContextParams;
};


export type MutationDeleteNamedContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  params: CreateProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};
