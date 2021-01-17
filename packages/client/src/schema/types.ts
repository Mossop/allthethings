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
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly projectByStubs?: Maybe<Project>;
};


export type OwnerProjectByStubsArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type Context = {
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly projectByStubs?: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};


export type ContextProjectByStubsArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type User = Context & Owner & {
  readonly __typename?: 'User';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly projectByStubs?: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly namedContexts: ReadonlyArray<NamedContext>;
};


export type UserProjectByStubsArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type NamedContext = Context & Owner & {
  readonly __typename?: 'NamedContext';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly projectByStubs?: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type NamedContextProjectByStubsArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};


export type NamedContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Project = Owner & {
  readonly __typename?: 'Project';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly projectByStubs?: Maybe<Project>;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly owner: Owner;
};


export type ProjectProjectByStubsArgs = {
  stubs: ReadonlyArray<Scalars['String']>;
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly owner?: Maybe<Owner>;
  readonly context?: Maybe<Context>;
};


export type QueryOwnerArgs = {
  id: Scalars['ID'];
};


export type QueryContextArgs = {
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
