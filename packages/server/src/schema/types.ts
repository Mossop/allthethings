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

export type ProjectOwner = {
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
};

export type Context = {
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type User = Context & ProjectOwner & {
  readonly __typename?: 'User';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly namedContexts: ReadonlyArray<NamedContext>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type NamedContext = Context & ProjectOwner & {
  readonly __typename?: 'NamedContext';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type NamedContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Project = ProjectOwner & {
  readonly __typename?: 'Project';
  readonly id: Scalars['ID'];
  readonly context: Context;
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly owner: ProjectOwner;
};

export type Section = {
  readonly __typename?: 'Section';
  readonly id: Scalars['ID'];
  readonly owner: ProjectOwner;
  readonly name: Scalars['String'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly owner?: Maybe<ProjectOwner>;
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
  readonly owner?: Maybe<Scalars['ID']>;
  readonly name: Scalars['String'];
};

export type CreateSectionParams = {
  readonly owner?: Maybe<Scalars['ID']>;
  readonly name: Scalars['String'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createNamedContext: NamedContext;
  readonly deleteNamedContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject?: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection?: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
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


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  owner?: Maybe<Scalars['ID']>;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  params: CreateSectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  owner?: Maybe<Scalars['ID']>;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};
