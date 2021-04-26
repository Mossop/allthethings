/* eslint-disable */
import type { DateTime } from 'luxon';
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
  DateTime: DateTime;
};

export type Context = ProjectRoot & TaskList & {
  readonly __typename: 'Context';
  readonly remainingTasks: Scalars['Int'];
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

export type ContextParams = {
  readonly name: Scalars['String'];
};


export type FileDetail = {
  readonly __typename: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type Inbox = {
  readonly __typename: 'Inbox';
  readonly id: Scalars['ID'];
  readonly items: ReadonlyArray<Item>;
};

export type Item = {
  readonly __typename: 'Item';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly created: Scalars['DateTime'];
  readonly archived?: Maybe<Scalars['DateTime']>;
  readonly snoozed?: Maybe<Scalars['DateTime']>;
  readonly taskInfo?: Maybe<TaskInfo>;
  readonly detail?: Maybe<ItemDetail>;
};

export type ItemDetail = PluginDetail | LinkDetail | NoteDetail | FileDetail;

export type ItemParams = {
  readonly summary: Scalars['String'];
  readonly archived?: Maybe<Scalars['DateTime']>;
  readonly snoozed?: Maybe<Scalars['DateTime']>;
};

export type LinkDetail = {
  readonly __typename: 'LinkDetail';
  readonly icon?: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
};

export type LinkDetailParams = {
  readonly url: Scalars['String'];
};

export type Mutation = {
  readonly __typename: 'Mutation';
  readonly login?: Maybe<User>;
  readonly logout?: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly editContext?: Maybe<Context>;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject?: Maybe<Project>;
  readonly editProject?: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection?: Maybe<Section>;
  readonly editSection?: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
  readonly createTask: Item;
  readonly createNote: Item;
  readonly createLink: Item;
  readonly editItem?: Maybe<Item>;
  readonly editTaskInfo?: Maybe<Item>;
  readonly moveItem?: Maybe<Item>;
  readonly deleteItem: Scalars['Boolean'];
  readonly archiveItem?: Maybe<Item>;
  readonly snoozeItem?: Maybe<Item>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  params: ContextParams;
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  taskList?: Maybe<Scalars['ID']>;
  params: ProjectParams;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  taskList?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationCreateTaskArgs = {
  list?: Maybe<Scalars['ID']>;
  item: ItemParams;
  taskInfo: TaskInfoParams;
};


export type MutationCreateNoteArgs = {
  list?: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  taskInfo?: Maybe<TaskInfoParams>;
};


export type MutationCreateLinkArgs = {
  list?: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo?: Maybe<TaskInfoParams>;
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  parent?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationArchiveItemArgs = {
  id: Scalars['ID'];
  archived?: Maybe<Scalars['DateTime']>;
};


export type MutationSnoozeItemArgs = {
  id: Scalars['ID'];
  snoozed?: Maybe<Scalars['DateTime']>;
};

export type NoteDetail = {
  readonly __typename: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type PluginDetail = {
  readonly __typename: 'PluginDetail';
  readonly pluginId: Scalars['String'];
  readonly fields: Scalars['String'];
};

export type Project = TaskList & {
  readonly __typename: 'Project';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type ProjectRoot = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Query = {
  readonly __typename: 'Query';
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

export type Section = {
  readonly __typename: 'Section';
  readonly remainingTasks: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type SectionParams = {
  readonly name: Scalars['String'];
};

export type TaskInfo = {
  readonly __typename: 'TaskInfo';
  readonly due?: Maybe<Scalars['DateTime']>;
  readonly done?: Maybe<Scalars['DateTime']>;
};

export type TaskInfoParams = {
  readonly due?: Maybe<Scalars['DateTime']>;
  readonly done?: Maybe<Scalars['DateTime']>;
};

export type TaskList = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
};

export type User = ProjectRoot & TaskList & {
  readonly __typename: 'User';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly contexts: ReadonlyArray<Context>;
  readonly inbox: Inbox;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ContextKeySpecifier = ('remainingTasks' | 'subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | 'id' | 'user' | 'stub' | 'name' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
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
export type FileDetailKeySpecifier = ('filename' | 'mimetype' | 'size' | FileDetailKeySpecifier)[];
export type FileDetailFieldPolicy = {
	filename?: FieldPolicy<any> | FieldReadFunction<any>,
	mimetype?: FieldPolicy<any> | FieldReadFunction<any>,
	size?: FieldPolicy<any> | FieldReadFunction<any>
};
export type InboxKeySpecifier = ('id' | 'items' | InboxKeySpecifier)[];
export type InboxFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ItemKeySpecifier = ('id' | 'summary' | 'created' | 'archived' | 'snoozed' | 'taskInfo' | 'detail' | ItemKeySpecifier)[];
export type ItemFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	created?: FieldPolicy<any> | FieldReadFunction<any>,
	archived?: FieldPolicy<any> | FieldReadFunction<any>,
	snoozed?: FieldPolicy<any> | FieldReadFunction<any>,
	taskInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	detail?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkDetailKeySpecifier = ('icon' | 'url' | LinkDetailKeySpecifier)[];
export type LinkDetailFieldPolicy = {
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createContext' | 'editContext' | 'deleteContext' | 'createProject' | 'moveProject' | 'editProject' | 'deleteProject' | 'createSection' | 'moveSection' | 'editSection' | 'deleteSection' | 'createTask' | 'createNote' | 'createLink' | 'editItem' | 'editTaskInfo' | 'moveItem' | 'deleteItem' | 'archiveItem' | 'snoozeItem' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	createContext?: FieldPolicy<any> | FieldReadFunction<any>,
	editContext?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteContext?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	moveProject?: FieldPolicy<any> | FieldReadFunction<any>,
	editProject?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProject?: FieldPolicy<any> | FieldReadFunction<any>,
	createSection?: FieldPolicy<any> | FieldReadFunction<any>,
	moveSection?: FieldPolicy<any> | FieldReadFunction<any>,
	editSection?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteSection?: FieldPolicy<any> | FieldReadFunction<any>,
	createTask?: FieldPolicy<any> | FieldReadFunction<any>,
	createNote?: FieldPolicy<any> | FieldReadFunction<any>,
	createLink?: FieldPolicy<any> | FieldReadFunction<any>,
	editItem?: FieldPolicy<any> | FieldReadFunction<any>,
	editTaskInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	moveItem?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteItem?: FieldPolicy<any> | FieldReadFunction<any>,
	archiveItem?: FieldPolicy<any> | FieldReadFunction<any>,
	snoozeItem?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NoteDetailKeySpecifier = ('note' | NoteDetailKeySpecifier)[];
export type NoteDetailFieldPolicy = {
	note?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PluginDetailKeySpecifier = ('pluginId' | 'fields' | PluginDetailKeySpecifier)[];
export type PluginDetailFieldPolicy = {
	pluginId?: FieldPolicy<any> | FieldReadFunction<any>,
	fields?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('remainingTasks' | 'subprojects' | 'sections' | 'items' | 'id' | 'stub' | 'name' | 'taskList' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	taskList?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectRootKeySpecifier = ('remainingTasks' | 'subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | ProjectRootKeySpecifier)[];
export type ProjectRootFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('user' | 'taskList' | 'root' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	taskList?: FieldPolicy<any> | FieldReadFunction<any>,
	root?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SectionKeySpecifier = ('remainingTasks' | 'items' | 'id' | 'name' | SectionKeySpecifier)[];
export type SectionFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskInfoKeySpecifier = ('due' | 'done' | TaskInfoKeySpecifier)[];
export type TaskInfoFieldPolicy = {
	due?: FieldPolicy<any> | FieldReadFunction<any>,
	done?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskListKeySpecifier = ('remainingTasks' | 'subprojects' | 'sections' | 'items' | TaskListKeySpecifier)[];
export type TaskListFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('remainingTasks' | 'subprojects' | 'sections' | 'items' | 'projects' | 'projectById' | 'id' | 'email' | 'contexts' | 'inbox' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	remainingTasks?: FieldPolicy<any> | FieldReadFunction<any>,
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	contexts?: FieldPolicy<any> | FieldReadFunction<any>,
	inbox?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	Context?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier),
		fields?: ContextFieldPolicy,
	},
	FileDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FileDetailKeySpecifier | (() => undefined | FileDetailKeySpecifier),
		fields?: FileDetailFieldPolicy,
	},
	Inbox?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | InboxKeySpecifier | (() => undefined | InboxKeySpecifier),
		fields?: InboxFieldPolicy,
	},
	Item?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier),
		fields?: ItemFieldPolicy,
	},
	LinkDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LinkDetailKeySpecifier | (() => undefined | LinkDetailKeySpecifier),
		fields?: LinkDetailFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	NoteDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NoteDetailKeySpecifier | (() => undefined | NoteDetailKeySpecifier),
		fields?: NoteDetailFieldPolicy,
	},
	PluginDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PluginDetailKeySpecifier | (() => undefined | PluginDetailKeySpecifier),
		fields?: PluginDetailFieldPolicy,
	},
	Project?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier),
		fields?: ProjectFieldPolicy,
	},
	ProjectRoot?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectRootKeySpecifier | (() => undefined | ProjectRootKeySpecifier),
		fields?: ProjectRootFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Section?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SectionKeySpecifier | (() => undefined | SectionKeySpecifier),
		fields?: SectionFieldPolicy,
	},
	TaskInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TaskInfoKeySpecifier | (() => undefined | TaskInfoKeySpecifier),
		fields?: TaskInfoFieldPolicy,
	},
	TaskList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TaskListKeySpecifier | (() => undefined | TaskListKeySpecifier),
		fields?: TaskListFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	}
};

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "ItemDetail": [
      "PluginDetail",
      "LinkDetail",
      "NoteDetail",
      "FileDetail"
    ],
    "ProjectRoot": [
      "Context",
      "User"
    ],
    "TaskList": [
      "Context",
      "Project",
      "User"
    ]
  }
};
      export default result;
    