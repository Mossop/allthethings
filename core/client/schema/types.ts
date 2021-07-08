/* eslint-disable */
import type { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type ContextKeySpecifier = ('subprojects' | 'sections' | 'items' | 'rootItems' | 'id' | 'user' | 'stub' | 'name' | 'projects' | 'projectById' | ContextKeySpecifier)[];
export type ContextFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	rootItems?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	stub?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	projectById?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FileDetailKeySpecifier = ('filename' | 'mimetype' | 'size' | FileDetailKeySpecifier)[];
export type FileDetailFieldPolicy = {
	filename?: FieldPolicy<any> | FieldReadFunction<any>,
	mimetype?: FieldPolicy<any> | FieldReadFunction<any>,
	size?: FieldPolicy<any> | FieldReadFunction<any>
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
export type ItemSetKeySpecifier = ('count' | 'items' | 'snoozed' | 'archived' | 'due' | 'isTask' | ItemSetKeySpecifier)[];
export type ItemSetFieldPolicy = {
	count?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	snoozed?: FieldPolicy<any> | FieldReadFunction<any>,
	archived?: FieldPolicy<any> | FieldReadFunction<any>,
	due?: FieldPolicy<any> | FieldReadFunction<any>,
	isTask?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LinkDetailKeySpecifier = ('icon' | 'url' | LinkDetailKeySpecifier)[];
export type LinkDetailFieldPolicy = {
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('login' | 'logout' | 'createContext' | 'editContext' | 'deleteContext' | 'createProject' | 'moveProject' | 'editProject' | 'deleteProject' | 'createSection' | 'moveSection' | 'editSection' | 'deleteSection' | 'createTask' | 'createNote' | 'createLink' | 'editItem' | 'editTaskInfo' | 'editTaskController' | 'moveItem' | 'deleteItem' | 'archiveItem' | 'snoozeItem' | 'markItemDue' | 'createUser' | 'deleteUser' | 'changePassword' | MutationKeySpecifier)[];
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
	editTaskController?: FieldPolicy<any> | FieldReadFunction<any>,
	moveItem?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteItem?: FieldPolicy<any> | FieldReadFunction<any>,
	archiveItem?: FieldPolicy<any> | FieldReadFunction<any>,
	snoozeItem?: FieldPolicy<any> | FieldReadFunction<any>,
	markItemDue?: FieldPolicy<any> | FieldReadFunction<any>,
	createUser?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteUser?: FieldPolicy<any> | FieldReadFunction<any>,
	changePassword?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NoteDetailKeySpecifier = ('note' | NoteDetailKeySpecifier)[];
export type NoteDetailFieldPolicy = {
	note?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PluginDetailKeySpecifier = ('pluginId' | 'hasTaskState' | 'wasEverListed' | 'isCurrentlyListed' | 'fields' | 'lists' | PluginDetailKeySpecifier)[];
export type PluginDetailFieldPolicy = {
	pluginId?: FieldPolicy<any> | FieldReadFunction<any>,
	hasTaskState?: FieldPolicy<any> | FieldReadFunction<any>,
	wasEverListed?: FieldPolicy<any> | FieldReadFunction<any>,
	isCurrentlyListed?: FieldPolicy<any> | FieldReadFunction<any>,
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	lists?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PluginListKeySpecifier = ('id' | 'pluginId' | 'name' | 'url' | PluginListKeySpecifier)[];
export type PluginListFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	pluginId?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProblemKeySpecifier = ('description' | 'url' | ProblemKeySpecifier)[];
export type ProblemFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
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
export type QueryKeySpecifier = ('user' | 'problems' | 'users' | 'taskList' | 'pageContent' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	problems?: FieldPolicy<any> | FieldReadFunction<any>,
	users?: FieldPolicy<any> | FieldReadFunction<any>,
	taskList?: FieldPolicy<any> | FieldReadFunction<any>,
	pageContent?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SectionKeySpecifier = ('items' | 'id' | 'name' | SectionKeySpecifier)[];
export type SectionFieldPolicy = {
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskInfoKeySpecifier = ('due' | 'done' | 'controller' | TaskInfoKeySpecifier)[];
export type TaskInfoFieldPolicy = {
	due?: FieldPolicy<any> | FieldReadFunction<any>,
	done?: FieldPolicy<any> | FieldReadFunction<any>,
	controller?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TaskListKeySpecifier = ('subprojects' | 'sections' | 'items' | TaskListKeySpecifier)[];
export type TaskListFieldPolicy = {
	subprojects?: FieldPolicy<any> | FieldReadFunction<any>,
	sections?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('id' | 'email' | 'contexts' | 'inbox' | 'isAdmin' | 'allItems' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	contexts?: FieldPolicy<any> | FieldReadFunction<any>,
	inbox?: FieldPolicy<any> | FieldReadFunction<any>,
	isAdmin?: FieldPolicy<any> | FieldReadFunction<any>,
	allItems?: FieldPolicy<any> | FieldReadFunction<any>
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
	Item?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier),
		fields?: ItemFieldPolicy,
	},
	ItemSet?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemSetKeySpecifier | (() => undefined | ItemSetKeySpecifier),
		fields?: ItemSetFieldPolicy,
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
	PluginList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PluginListKeySpecifier | (() => undefined | PluginListKeySpecifier),
		fields?: PluginListFieldPolicy,
	},
	Problem?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProblemKeySpecifier | (() => undefined | ProblemKeySpecifier),
		fields?: ProblemFieldPolicy,
	},
	Project?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier),
		fields?: ProjectFieldPolicy,
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
    "TaskList": [
      "Context",
      "Project"
    ]
  }
};
      export default result;
    