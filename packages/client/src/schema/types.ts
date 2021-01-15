/* eslint-disable */
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
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
};

export type Context = {
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
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  owner?: Maybe<Owner>;
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

export type OwnerKeySpecifier = ('id' | 'user' | 'context' | 'subprojects' | OwnerKeySpecifier)[];
export type OwnerFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContextKeySpecifier = ('projects' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	projects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('id' | 'email' | 'password' | 'namedContexts' | 'user' | 'context' | 'projects' | 'subprojects' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	password?: FieldPolicy<any> | FieldReadFunction<any>,
	namedContexts?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NamedContextKeySpecifier = ('id' | 'user' | 'context' | 'stub' | 'name' | 'projects' | 'subprojects' | NamedContextKeySpecifier)[];
export type NamedContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('id' | 'user' | 'context' | 'namedContext' | 'parent' | 'owner' | 'stub' | 'name' | 'subprojects' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	namedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	parent?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'owner' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createNamedContext' | 'deleteNamedContext' | 'createProject' | 'deleteProject' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProject?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	Owner?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OwnerKeySpecifier | (() => undefined | OwnerKeySpecifier),
		fields?: OwnerFieldPolicy,
	},
	Context?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier),
		fields?: ContextFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	NamedContext?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NamedContextKeySpecifier | (() => undefined | NamedContextKeySpecifier),
		fields?: NamedContextFieldPolicy,
	},
	Project?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier),
		fields?: ProjectFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	}
};