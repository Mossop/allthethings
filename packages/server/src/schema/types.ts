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
  readonly __typename?: 'User';
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly contexts: ReadonlyArray<Context>;
  readonly rootProjects: ReadonlyArray<Project>;
};

export type Context = {
  readonly __typename?: 'Context';
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly rootProjects: ReadonlyArray<Project>;
};

export type Project = {
  readonly __typename?: 'Project';
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly context?: Maybe<Context>;
  readonly parent?: Maybe<Project>;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly subprojects: ReadonlyArray<Project>;
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly context?: Maybe<Context>;
};


export type QueryContextArgs = {
  id: Scalars['ID'];
};

export type CreateContextParams = {
  readonly name: Scalars['String'];
};

export type CreateProjectParams = {
  readonly name: Scalars['String'];
  readonly context?: Maybe<Scalars['ID']>;
  readonly parent?: Maybe<Scalars['ID']>;
};

export type UpdateProjectParams = {
  readonly name?: Maybe<Scalars['String']>;
  readonly context?: Maybe<Scalars['ID']>;
  readonly parent?: Maybe<Scalars['ID']>;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly updateProject?: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  params: CreateContextParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  params: CreateProjectParams;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  params: UpdateProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};
