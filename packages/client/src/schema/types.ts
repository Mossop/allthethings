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

export type User = {
  __typename?: 'User';
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

export type UserKeySpecifier = ('email' | 'password' | 'contexts' | 'emptyContext' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	password?: FieldPolicy<any> | FieldReadFunction<any>,
	contexts?: FieldPolicy<any> | FieldReadFunction<any>,
	emptyContext?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContextKeySpecifier = ('id' | 'user' | 'name' | 'projects' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EmptyContextKeySpecifier = ('user' | 'projects' | EmptyContextKeySpecifier)[];
export type EmptyContextFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('id' | 'parent' | 'context' | 'name' | 'subprojects' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	parent?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'context' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createContext' | 'createProject' | 'assignContext' | 'assignParent' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	assignContext?: FieldPolicy<any> | FieldReadFunction<any>,
	assignParent?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	Context?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier),
		fields?: ContextFieldPolicy,
	},
	EmptyContext?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EmptyContextKeySpecifier | (() => undefined | EmptyContextKeySpecifier),
		fields?: EmptyContextFieldPolicy,
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