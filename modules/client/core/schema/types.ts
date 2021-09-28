/* eslint-disable */
import type {
  FieldPolicy,
  FieldReadFunction,
  TypePolicies,
  TypePolicy,
} from "@apollo/client/cache";
export type BugzillaAccountKeySpecifier = (
  | "icon"
  | "id"
  | "name"
  | "searches"
  | "url"
  | "username"
  | BugzillaAccountKeySpecifier
)[];
export type BugzillaAccountFieldPolicy = {
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  username?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type BugzillaSearchKeySpecifier = (
  | "dueOffset"
  | "id"
  | "name"
  | "query"
  | "type"
  | "url"
  | BugzillaSearchKeySpecifier
)[];
export type BugzillaSearchFieldPolicy = {
  dueOffset?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextKeySpecifier = (
  | "id"
  | "items"
  | "name"
  | "projectById"
  | "projects"
  | "sections"
  | "stub"
  | "subprojects"
  | "user"
  | ContextKeySpecifier
)[];
export type ContextFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  projectById?: FieldPolicy<any> | FieldReadFunction<any>;
  projects?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  stub?: FieldPolicy<any> | FieldReadFunction<any>;
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | "avatar"
  | "id"
  | "loginUrl"
  | "searches"
  | "user"
  | GithubAccountKeySpecifier
)[];
export type GithubAccountFieldPolicy = {
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  loginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GithubSearchKeySpecifier = (
  | "dueOffset"
  | "id"
  | "name"
  | "query"
  | "url"
  | GithubSearchKeySpecifier
)[];
export type GithubSearchFieldPolicy = {
  dueOffset?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GoogleAccountKeySpecifier = (
  | "avatar"
  | "email"
  | "id"
  | "loginUrl"
  | "mailSearches"
  | GoogleAccountKeySpecifier
)[];
export type GoogleAccountFieldPolicy = {
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  loginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  mailSearches?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GoogleMailSearchKeySpecifier = (
  | "dueOffset"
  | "id"
  | "name"
  | "query"
  | "url"
  | GoogleMailSearchKeySpecifier
)[];
export type GoogleMailSearchFieldPolicy = {
  dueOffset?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  query?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ItemKeySpecifier = (
  | "archived"
  | "created"
  | "detail"
  | "id"
  | "snoozed"
  | "summary"
  | "taskInfo"
  | ItemKeySpecifier
)[];
export type ItemFieldPolicy = {
  archived?: FieldPolicy<any> | FieldReadFunction<any>;
  created?: FieldPolicy<any> | FieldReadFunction<any>;
  detail?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  snoozed?: FieldPolicy<any> | FieldReadFunction<any>;
  summary?: FieldPolicy<any> | FieldReadFunction<any>;
  taskInfo?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ItemSetKeySpecifier = ("count" | "items" | ItemSetKeySpecifier)[];
export type ItemSetFieldPolicy = {
  count?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JiraAccountKeySpecifier = (
  | "apiToken"
  | "email"
  | "id"
  | "searches"
  | "serverName"
  | "url"
  | "userName"
  | JiraAccountKeySpecifier
)[];
export type JiraAccountFieldPolicy = {
  apiToken?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  searches?: FieldPolicy<any> | FieldReadFunction<any>;
  serverName?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  userName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JiraSearchKeySpecifier = (
  | "dueOffset"
  | "id"
  | "name"
  | "query"
  | "url"
  | JiraSearchKeySpecifier
)[];
export type JiraSearchFieldPolicy = {
  dueOffset?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | "changePassword"
  | "createBugzillaAccount"
  | "createBugzillaSearch"
  | "createGithubSearch"
  | "createGoogleMailSearch"
  | "createJiraAccount"
  | "createJiraSearch"
  | "createPhabricatorAccount"
  | "createUser"
  | "deleteBugzillaAccount"
  | "deleteBugzillaSearch"
  | "deleteGithubSearch"
  | "deleteGoogleMailSearch"
  | "deleteJiraAccount"
  | "deleteJiraSearch"
  | "deletePhabricatorAccount"
  | "deleteUser"
  | "editBugzillaSearch"
  | "editGithubSearch"
  | "editGoogleMailSearch"
  | "editJiraSearch"
  | "markTaskDone"
  | "markTaskDue"
  | "setTaskController"
  | "updatePhabricatorAccount"
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  changePassword?: FieldPolicy<any> | FieldReadFunction<any>;
  createBugzillaAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createBugzillaSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createGoogleMailSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createPhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteBugzillaAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteBugzillaSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteGoogleMailSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  editBugzillaSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  editGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  editGoogleMailSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  editJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  markTaskDone?: FieldPolicy<any> | FieldReadFunction<any>;
  markTaskDue?: FieldPolicy<any> | FieldReadFunction<any>;
  setTaskController?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NoteDetailKeySpecifier = ("note" | NoteDetailKeySpecifier)[];
export type NoteDetailFieldPolicy = {
  note?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PhabricatorAccountKeySpecifier = (
  | "apiKey"
  | "email"
  | "enabledQueries"
  | "icon"
  | "id"
  | "url"
  | PhabricatorAccountKeySpecifier
)[];
export type PhabricatorAccountFieldPolicy = {
  apiKey?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  enabledQueries?: FieldPolicy<any> | FieldReadFunction<any>;
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PhabricatorQueryKeySpecifier = (
  | "description"
  | "name"
  | "queryId"
  | PhabricatorQueryKeySpecifier
)[];
export type PhabricatorQueryFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  queryId?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | "id"
  | "items"
  | "name"
  | "sections"
  | "stub"
  | "subprojects"
  | "taskList"
  | ProjectKeySpecifier
)[];
export type ProjectFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  stub?: FieldPolicy<any> | FieldReadFunction<any>;
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
  taskList?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | "githubLoginUrl"
  | "googleLoginUrl"
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
  problems?: FieldPolicy<any> | FieldReadFunction<any>;
  schemaVersion?: FieldPolicy<any> | FieldReadFunction<any>;
  taskList?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SectionKeySpecifier = (
  | "id"
  | "items"
  | "name"
  | SectionKeySpecifier
)[];
export type SectionFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceDetailKeySpecifier = (
  | "fields"
  | "hasTaskState"
  | "isCurrentlyListed"
  | "lists"
  | "serviceId"
  | "wasEverListed"
  | ServiceDetailKeySpecifier
)[];
export type ServiceDetailFieldPolicy = {
  fields?: FieldPolicy<any> | FieldReadFunction<any>;
  hasTaskState?: FieldPolicy<any> | FieldReadFunction<any>;
  isCurrentlyListed?: FieldPolicy<any> | FieldReadFunction<any>;
  lists?: FieldPolicy<any> | FieldReadFunction<any>;
  serviceId?: FieldPolicy<any> | FieldReadFunction<any>;
  wasEverListed?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceListKeySpecifier = (
  | "id"
  | "name"
  | "serviceId"
  | "url"
  | ServiceListKeySpecifier
)[];
export type ServiceListFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  serviceId?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskInfoKeySpecifier = (
  | "controller"
  | "done"
  | "due"
  | TaskInfoKeySpecifier
)[];
export type TaskInfoFieldPolicy = {
  controller?: FieldPolicy<any> | FieldReadFunction<any>;
  done?: FieldPolicy<any> | FieldReadFunction<any>;
  due?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskListKeySpecifier = (
  | "items"
  | "sections"
  | "subprojects"
  | TaskListKeySpecifier
)[];
export type TaskListFieldPolicy = {
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  sections?: FieldPolicy<any> | FieldReadFunction<any>;
  subprojects?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
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
export type StrictTypedTypePolicies = {
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
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;

export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {
    ItemDetail: ["FileDetail", "LinkDetail", "NoteDetail", "ServiceDetail"],
    TaskList: ["Context", "Project"],
  },
};
export default result;
