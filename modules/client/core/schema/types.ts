/* eslint-disable */
import type {
  FieldPolicy,
  FieldReadFunction,
  TypePolicies,
  TypePolicy,
} from "@apollo/client/cache";
export type BugzillaAccountKeySpecifier = (
  | "id"
  | "name"
  | "icon"
  | "url"
  | "username"
  | "searches"
  | BugzillaAccountKeySpecifier
)[];
export type BugzillaAccountFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  username?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type BugzillaSearchKeySpecifier = (
  | "id"
  | "name"
  | "type"
  | "query"
  | "url"
  | BugzillaSearchKeySpecifier
)[];
export type BugzillaSearchFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextKeySpecifier = (
  | "subprojects"
  | "sections"
  | "items"
  | "rootItems"
  | "id"
  | "user"
  | "stub"
  | "name"
  | "projects"
  | "projectById"
  | ContextKeySpecifier
)[];
export type ContextFieldPolicy = {
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  rootItems?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  stub?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  projects?: FieldPolicy<any> | FieldReadFunction<any>;
  projectById?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileDetailKeySpecifier = (
  | "filename"
  | "mimetype"
  | "size"
  | FileDetailKeySpecifier
)[];
export type FileDetailFieldPolicy = {
  filename?: FieldPolicy<any> | FieldReadFunction<any>;
  mimetype?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GithubAccountKeySpecifier = (
  | "id"
  | "user"
  | "avatar"
  | "loginUrl"
  | "searches"
  | GithubAccountKeySpecifier
)[];
export type GithubAccountFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  loginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GithubSearchKeySpecifier = (
  | "id"
  | "name"
  | "query"
  | "url"
  | GithubSearchKeySpecifier
)[];
export type GithubSearchFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GoogleAccountKeySpecifier = (
  | "id"
  | "email"
  | "avatar"
  | "mailSearches"
  | "loginUrl"
  | GoogleAccountKeySpecifier
)[];
export type GoogleAccountFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  mailSearches?: FieldPolicy<any> | FieldReadFunction<any>;
  loginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GoogleMailSearchKeySpecifier = (
  | "id"
  | "name"
  | "query"
  | "url"
  | GoogleMailSearchKeySpecifier
)[];
export type GoogleMailSearchFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ItemKeySpecifier = (
  | "id"
  | "summary"
  | "created"
  | "archived"
  | "snoozed"
  | "taskInfo"
  | "detail"
  | ItemKeySpecifier
)[];
export type ItemFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  summary?: FieldPolicy<any> | FieldReadFunction<any>;
  created?: FieldPolicy<any> | FieldReadFunction<any>;
  archived?: FieldPolicy<any> | FieldReadFunction<any>;
  snoozed?: FieldPolicy<any> | FieldReadFunction<any>;
  taskInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  detail?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ItemSetKeySpecifier = ("count" | "items" | ItemSetKeySpecifier)[];
export type ItemSetFieldPolicy = {
  count?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JiraAccountKeySpecifier = (
  | "id"
  | "serverName"
  | "userName"
  | "url"
  | "email"
  | "apiToken"
  | "searches"
  | JiraAccountKeySpecifier
)[];
export type JiraAccountFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  serverName?: FieldPolicy<any> | FieldReadFunction<any>;
  userName?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  apiToken?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JiraSearchKeySpecifier = (
  | "id"
  | "name"
  | "query"
  | "url"
  | JiraSearchKeySpecifier
)[];
export type JiraSearchFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LinkDetailKeySpecifier = (
  | "icon"
  | "url"
  | LinkDetailKeySpecifier
)[];
export type LinkDetailFieldPolicy = {
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | "archiveItem"
  | "changePassword"
  | "createBugzillaAccount"
  | "createBugzillaSearch"
  | "createContext"
  | "createGithubSearch"
  | "createGoogleMailSearch"
  | "createJiraAccount"
  | "createJiraSearch"
  | "createLink"
  | "createNote"
  | "createPhabricatorAccount"
  | "createProject"
  | "createSection"
  | "createTask"
  | "createUser"
  | "deleteBugzillaAccount"
  | "deleteBugzillaSearch"
  | "deleteContext"
  | "deleteItem"
  | "deleteJiraAccount"
  | "deleteJiraSearch"
  | "deletePhabricatorAccount"
  | "deleteProject"
  | "deleteSection"
  | "deleteUser"
  | "editContext"
  | "editItem"
  | "editProject"
  | "editSection"
  | "editTaskController"
  | "editTaskInfo"
  | "markItemDue"
  | "moveItem"
  | "moveProject"
  | "moveSection"
  | "snoozeItem"
  | "updatePhabricatorAccount"
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  archiveItem?: FieldPolicy<any> | FieldReadFunction<any>;
  changePassword?: FieldPolicy<any> | FieldReadFunction<any>;
  createBugzillaAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createBugzillaSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createGoogleMailSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createLink?: FieldPolicy<any> | FieldReadFunction<any>;
  createNote?: FieldPolicy<any> | FieldReadFunction<any>;
  createPhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createProject?: FieldPolicy<any> | FieldReadFunction<any>;
  createSection?: FieldPolicy<any> | FieldReadFunction<any>;
  createTask?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteBugzillaAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteBugzillaSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteContext?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteItem?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteProject?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteSection?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  editContext?: FieldPolicy<any> | FieldReadFunction<any>;
  editItem?: FieldPolicy<any> | FieldReadFunction<any>;
  editProject?: FieldPolicy<any> | FieldReadFunction<any>;
  editSection?: FieldPolicy<any> | FieldReadFunction<any>;
  editTaskController?: FieldPolicy<any> | FieldReadFunction<any>;
  editTaskInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  markItemDue?: FieldPolicy<any> | FieldReadFunction<any>;
  moveItem?: FieldPolicy<any> | FieldReadFunction<any>;
  moveProject?: FieldPolicy<any> | FieldReadFunction<any>;
  moveSection?: FieldPolicy<any> | FieldReadFunction<any>;
  snoozeItem?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NoteDetailKeySpecifier = ("note" | NoteDetailKeySpecifier)[];
export type NoteDetailFieldPolicy = {
  note?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PhabricatorAccountKeySpecifier = (
  | "id"
  | "icon"
  | "url"
  | "email"
  | "apiKey"
  | "enabledQueries"
  | PhabricatorAccountKeySpecifier
)[];
export type PhabricatorAccountFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  apiKey?: FieldPolicy<any> | FieldReadFunction<any>;
  enabledQueries?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PhabricatorQueryKeySpecifier = (
  | "queryId"
  | "name"
  | "description"
  | PhabricatorQueryKeySpecifier
)[];
export type PhabricatorQueryFieldPolicy = {
  queryId?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProblemKeySpecifier = (
  | "description"
  | "url"
  | ProblemKeySpecifier
)[];
export type ProblemFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProjectKeySpecifier = (
  | "subprojects"
  | "sections"
  | "items"
  | "id"
  | "stub"
  | "name"
  | "taskList"
  | ProjectKeySpecifier
)[];
export type ProjectFieldPolicy = {
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  stub?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  taskList?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | "githubLoginUrl"
  | "googleLoginUrl"
  | "pageContent"
  | "problems"
  | "schemaVersion"
  | "taskList"
  | "user"
  | "users"
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  githubLoginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  googleLoginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  pageContent?: FieldPolicy<any> | FieldReadFunction<any>;
  problems?: FieldPolicy<any> | FieldReadFunction<any>;
  schemaVersion?: FieldPolicy<any> | FieldReadFunction<any>;
  taskList?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SectionKeySpecifier = (
  | "items"
  | "id"
  | "name"
  | SectionKeySpecifier
)[];
export type SectionFieldPolicy = {
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceDetailKeySpecifier = (
  | "serviceId"
  | "hasTaskState"
  | "wasEverListed"
  | "isCurrentlyListed"
  | "fields"
  | "lists"
  | ServiceDetailKeySpecifier
)[];
export type ServiceDetailFieldPolicy = {
  serviceId?: FieldPolicy<any> | FieldReadFunction<any>;
  hasTaskState?: FieldPolicy<any> | FieldReadFunction<any>;
  wasEverListed?: FieldPolicy<any> | FieldReadFunction<any>;
  isCurrentlyListed?: FieldPolicy<any> | FieldReadFunction<any>;
  fields?: FieldPolicy<any> | FieldReadFunction<any>;
  lists?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceListKeySpecifier = (
  | "id"
  | "serviceId"
  | "name"
  | "url"
  | ServiceListKeySpecifier
)[];
export type ServiceListFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  serviceId?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskInfoKeySpecifier = (
  | "due"
  | "done"
  | "controller"
  | TaskInfoKeySpecifier
)[];
export type TaskInfoFieldPolicy = {
  due?: FieldPolicy<any> | FieldReadFunction<any>;
  done?: FieldPolicy<any> | FieldReadFunction<any>;
  controller?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskListKeySpecifier = (
  | "subprojects"
  | "sections"
  | "items"
  | TaskListKeySpecifier
)[];
export type TaskListFieldPolicy = {
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | "allItems"
  | "bugzillaAccounts"
  | "contexts"
  | "email"
  | "githubAccounts"
  | "googleAccounts"
  | "id"
  | "inbox"
  | "isAdmin"
  | "jiraAccounts"
  | "phabricatorAccounts"
  | "phabricatorQueries"
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  allItems?: FieldPolicy<any> | FieldReadFunction<any>;
  bugzillaAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  contexts?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  githubAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  googleAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  inbox?: FieldPolicy<any> | FieldReadFunction<any>;
  isAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  jiraAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  phabricatorAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  phabricatorQueries?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TypedTypePolicies = TypePolicies & {
  BugzillaAccount?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | BugzillaAccountKeySpecifier
      | (() => undefined | BugzillaAccountKeySpecifier);
    fields?: BugzillaAccountFieldPolicy;
  };
  BugzillaSearch?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | BugzillaSearchKeySpecifier
      | (() => undefined | BugzillaSearchKeySpecifier);
    fields?: BugzillaSearchFieldPolicy;
  };
  Context?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ContextKeySpecifier
      | (() => undefined | ContextKeySpecifier);
    fields?: ContextFieldPolicy;
  };
  FileDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | FileDetailKeySpecifier
      | (() => undefined | FileDetailKeySpecifier);
    fields?: FileDetailFieldPolicy;
  };
  GithubAccount?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | GithubAccountKeySpecifier
      | (() => undefined | GithubAccountKeySpecifier);
    fields?: GithubAccountFieldPolicy;
  };
  GithubSearch?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | GithubSearchKeySpecifier
      | (() => undefined | GithubSearchKeySpecifier);
    fields?: GithubSearchFieldPolicy;
  };
  GoogleAccount?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | GoogleAccountKeySpecifier
      | (() => undefined | GoogleAccountKeySpecifier);
    fields?: GoogleAccountFieldPolicy;
  };
  GoogleMailSearch?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | GoogleMailSearchKeySpecifier
      | (() => undefined | GoogleMailSearchKeySpecifier);
    fields?: GoogleMailSearchFieldPolicy;
  };
  Item?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier);
    fields?: ItemFieldPolicy;
  };
  ItemSet?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ItemSetKeySpecifier
      | (() => undefined | ItemSetKeySpecifier);
    fields?: ItemSetFieldPolicy;
  };
  JiraAccount?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | JiraAccountKeySpecifier
      | (() => undefined | JiraAccountKeySpecifier);
    fields?: JiraAccountFieldPolicy;
  };
  JiraSearch?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | JiraSearchKeySpecifier
      | (() => undefined | JiraSearchKeySpecifier);
    fields?: JiraSearchFieldPolicy;
  };
  LinkDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | LinkDetailKeySpecifier
      | (() => undefined | LinkDetailKeySpecifier);
    fields?: LinkDetailFieldPolicy;
  };
  Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | MutationKeySpecifier
      | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
  };
  NoteDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | NoteDetailKeySpecifier
      | (() => undefined | NoteDetailKeySpecifier);
    fields?: NoteDetailFieldPolicy;
  };
  PhabricatorAccount?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | PhabricatorAccountKeySpecifier
      | (() => undefined | PhabricatorAccountKeySpecifier);
    fields?: PhabricatorAccountFieldPolicy;
  };
  PhabricatorQuery?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | PhabricatorQueryKeySpecifier
      | (() => undefined | PhabricatorQueryKeySpecifier);
    fields?: PhabricatorQueryFieldPolicy;
  };
  Problem?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ProblemKeySpecifier
      | (() => undefined | ProblemKeySpecifier);
    fields?: ProblemFieldPolicy;
  };
  Project?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ProjectKeySpecifier
      | (() => undefined | ProjectKeySpecifier);
    fields?: ProjectFieldPolicy;
  };
  Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | QueryKeySpecifier
      | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
  };
  Section?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | SectionKeySpecifier
      | (() => undefined | SectionKeySpecifier);
    fields?: SectionFieldPolicy;
  };
  ServiceDetail?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ServiceDetailKeySpecifier
      | (() => undefined | ServiceDetailKeySpecifier);
    fields?: ServiceDetailFieldPolicy;
  };
  ServiceList?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ServiceListKeySpecifier
      | (() => undefined | ServiceListKeySpecifier);
    fields?: ServiceListFieldPolicy;
  };
  TaskInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | TaskInfoKeySpecifier
      | (() => undefined | TaskInfoKeySpecifier);
    fields?: TaskInfoFieldPolicy;
  };
  TaskList?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | TaskListKeySpecifier
      | (() => undefined | TaskListKeySpecifier);
    fields?: TaskListFieldPolicy;
  };
  User?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier);
    fields?: UserFieldPolicy;
  };
};

export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {
    ItemDetail: ["ServiceDetail", "LinkDetail", "NoteDetail", "FileDetail"],
    TaskList: ["Context", "Project"],
  },
};
export default result;
