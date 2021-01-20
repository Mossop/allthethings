/* eslint-disable */
import type { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
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

export type EditProjectParams = {
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
  readonly editProject?: Maybe<Project>;
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


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: EditProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};

export type OwnerKeySpecifier = ('id' | 'context' | 'subprojects' | 'projectByStubs' | OwnerKeySpecifier)[];
export type OwnerFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectByStubs?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContextKeySpecifier = ('id' | 'context' | 'subprojects' | 'projectByStubs' | 'projects' | 'projectById' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectByStubs?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('id' | 'context' | 'subprojects' | 'projectByStubs' | 'projects' | 'projectById' | 'email' | 'password' | 'namedContexts' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectByStubs?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	password?: FieldPolicy<any> | FieldReadFunction<any>,
	namedContexts?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NamedContextKeySpecifier = ('id' | 'context' | 'subprojects' | 'projectByStubs' | 'projects' | 'projectById' | 'user' | 'stub' | 'name' | NamedContextKeySpecifier)[];
export type NamedContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectByStubs?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('id' | 'context' | 'subprojects' | 'projectByStubs' | 'stub' | 'name' | 'owner' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectByStubs?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'owner' | 'context' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createNamedContext' | 'deleteNamedContext' | 'createProject' | 'editProject' | 'deleteProject' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	editProject?: FieldPolicy<any> | FieldReadFunction<any>,
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