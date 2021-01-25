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

export type ProjectOwnerKeySpecifier = ('id' | 'context' | 'subprojects' | 'sections' | ProjectOwnerKeySpecifier)[];
export type ProjectOwnerFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContextKeySpecifier = ('id' | 'context' | 'subprojects' | 'sections' | 'projects' | 'projectById' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('id' | 'context' | 'subprojects' | 'sections' | 'projects' | 'projectById' | 'email' | 'password' | 'namedContexts' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	password?: FieldPolicy<any> | FieldReadFunction<any>,
	namedContexts?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NamedContextKeySpecifier = ('id' | 'context' | 'subprojects' | 'sections' | 'projects' | 'projectById' | 'user' | 'stub' | 'name' | NamedContextKeySpecifier)[];
export type NamedContextFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('id' | 'context' | 'subprojects' | 'sections' | 'stub' | 'name' | 'owner' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SectionKeySpecifier = ('id' | 'owner' | 'name' | SectionKeySpecifier)[];
export type SectionFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'owner' | 'context' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	owner?: FieldPolicy<any> | FieldReadFunction<any>,
	context?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createNamedContext' | 'deleteNamedContext' | 'createProject' | 'moveProject' | 'deleteProject' | 'createSection' | 'moveSection' | 'deleteSection' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteNamedContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	moveProject?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProject?: FieldPolicy<any> | FieldReadFunction<any>,
	createSection?: FieldPolicy<any> | FieldReadFunction<any>,
	moveSection?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteSection?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	ProjectOwner?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectOwnerKeySpecifier | (() => undefined | ProjectOwnerKeySpecifier),
		fields?: ProjectOwnerFieldPolicy,
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
	Section?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SectionKeySpecifier | (() => undefined | SectionKeySpecifier),
		fields?: SectionFieldPolicy,
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