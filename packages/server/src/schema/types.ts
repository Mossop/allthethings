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
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly descend?: Maybe<Owner>;
};


export type OwnerDescendArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type Context = {
  readonly id: Scalars['ID'];
  readonly projects: ReadonlyArray<Project>;
};

export type User = Context & Owner & {
  readonly __typename?: 'User';
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly namedContexts: ReadonlyArray<NamedContext>;
  readonly user: User;
  readonly context: Context;
  readonly projects: ReadonlyArray<Project>;
  readonly subprojects: ReadonlyArray<Project>;
  readonly descend?: Maybe<Owner>;
};


export type UserDescendArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type NamedContext = Context & Owner & {
  readonly __typename?: 'NamedContext';
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly context: Context;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly projects: ReadonlyArray<Project>;
  readonly subprojects: ReadonlyArray<Project>;
  readonly descend?: Maybe<Owner>;
};


export type NamedContextDescendArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type Project = Owner & {
  readonly __typename?: 'Project';
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly context: Context;
  readonly namedContext?: Maybe<NamedContext>;
  readonly parent?: Maybe<Project>;
  readonly owner: Owner;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly descend?: Maybe<Owner>;
};


export type ProjectDescendArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly owner?: Maybe<Owner>;
};


export type QueryOwnerArgs = {
  id: Scalars['ID'];
};

export type CreateNamedContextParams = {
  readonly name: Scalars['String'];
};

export type CreateProjectParams = {
  readonly name: Scalars['String'];
  readonly owner?: Maybe<Scalars['ID']>;
};

export type UpdateProjectParams = {
  readonly name: Scalars['String'];
  readonly owner?: Maybe<Scalars['ID']>;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createNamedContext: NamedContext;
  readonly deleteNamedContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly deleteProject: Scalars['Boolean'];
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
