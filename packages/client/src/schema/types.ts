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

export type Item = {
  readonly id: Scalars['ID'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly summary: Scalars['String'];
};

export type Task = Item & {
  readonly __typename?: 'Task';
  readonly id: Scalars['ID'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly summary: Scalars['String'];
  readonly done: Scalars['Boolean'];
  readonly link?: Maybe<Scalars['String']>;
};

export type File = Item & {
  readonly __typename?: 'File';
  readonly id: Scalars['ID'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly summary: Scalars['String'];
};

export type Note = Item & {
  readonly __typename?: 'Note';
  readonly id: Scalars['ID'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly summary: Scalars['String'];
  readonly note: Scalars['String'];
};

export type Link = Item & {
  readonly __typename?: 'Link';
  readonly id: Scalars['ID'];
  readonly icon?: Maybe<Scalars['String']>;
  readonly summary: Scalars['String'];
  readonly link: Scalars['String'];
};

export type TaskList = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
};

export type ProjectRoot = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type User = ProjectRoot & TaskList & {
  readonly __typename?: 'User';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly password: Scalars['String'];
  readonly contexts: ReadonlyArray<Context>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Context = ProjectRoot & TaskList & {
  readonly __typename?: 'Context';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type Section = {
  readonly __typename?: 'Section';
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user?: Maybe<User>;
  readonly taskList?: Maybe<TaskList>;
  readonly root?: Maybe<ProjectRoot>;
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};


export type QueryRootArgs = {
  id: Scalars['ID'];
};

export type CreateContextParams = {
  readonly name: Scalars['String'];
};

export type CreateProjectParams = {
  readonly name: Scalars['String'];
};

export type EditProjectParams = {
  readonly name?: Maybe<Scalars['String']>;
};

export type CreateSectionParams = {
  readonly name: Scalars['String'];
};

export type EditSectionParams = {
  readonly name?: Maybe<Scalars['String']>;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject?: Maybe<Project>;
  readonly editProject?: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection?: Maybe<Section>;
  readonly editSection?: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
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
  taskList?: Maybe<Scalars['ID']>;
  params: CreateProjectParams;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: EditProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  taskList?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
  params: CreateSectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: EditSectionParams;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};

export type ItemKeySpecifier = ('id' | 'icon' | 'summary' | ItemKeySpecifier)[];
export type ItemFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskKeySpecifier = ('id' | 'icon' | 'summary' | 'done' | 'link' | TaskKeySpecifier)[];
export type TaskFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	done?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FileKeySpecifier = ('id' | 'icon' | 'summary' | FileKeySpecifier)[];
export type FileFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NoteKeySpecifier = ('id' | 'icon' | 'summary' | 'note' | NoteKeySpecifier)[];
export type NoteFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	note?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkKeySpecifier = ('id' | 'icon' | 'summary' | 'link' | LinkKeySpecifier)[];
export type LinkFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	link?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskListKeySpecifier = ('subprojects' | 'sections' | 'items' | TaskListKeySpecifier)[];
export type TaskListFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectRootKeySpecifier = ('subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | ProjectRootKeySpecifier)[];
export type ProjectRootFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | 'id' | 'email' | 'password' | 'contexts' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	password?: FieldPolicy<any> | FieldReadFunction<any>,
	contexts?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ContextKeySpecifier = ('subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | 'id' | 'user' | 'stub' | 'name' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('subprojects' | 'sections' | 'items' | 'id' | 'stub' | 'name' | 'taskList' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	taskList?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SectionKeySpecifier = ('items' | 'id' | 'name' | SectionKeySpecifier)[];
export type SectionFieldPolicy = {
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'taskList' | 'root' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	taskList?: FieldPolicy<any> | FieldReadFunction<any>,
	root?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createContext' | 'deleteContext' | 'createProject' | 'moveProject' | 'editProject' | 'deleteProject' | 'createSection' | 'moveSection' | 'editSection' | 'deleteSection' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createContext?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	moveProject?: FieldPolicy<any> | FieldReadFunction<any>,
	editProject?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProject?: FieldPolicy<any> | FieldReadFunction<any>,
	createSection?: FieldPolicy<any> | FieldReadFunction<any>,
	moveSection?: FieldPolicy<any> | FieldReadFunction<any>,
	editSection?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteSection?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	Item?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier),
		fields?: ItemFieldPolicy,
	},
	Task?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TaskKeySpecifier | (() => undefined | TaskKeySpecifier),
		fields?: TaskFieldPolicy,
	},
	File?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FileKeySpecifier | (() => undefined | FileKeySpecifier),
		fields?: FileFieldPolicy,
	},
	Note?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NoteKeySpecifier | (() => undefined | NoteKeySpecifier),
		fields?: NoteFieldPolicy,
	},
	Link?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkKeySpecifier | (() => undefined | LinkKeySpecifier),
		fields?: LinkFieldPolicy,
	},
	TaskList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TaskListKeySpecifier | (() => undefined | TaskListKeySpecifier),
		fields?: TaskListFieldPolicy,
	},
	ProjectRoot?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectRootKeySpecifier | (() => undefined | ProjectRootKeySpecifier),
		fields?: ProjectRootFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	Context?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier),
		fields?: ContextFieldPolicy,
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