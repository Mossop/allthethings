/* eslint-disable */
import type {
  FieldPolicy,
  FieldReadFunction,
  TypePolicies,
  TypePolicy,
} from "@apollo/client/cache";
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
export type MutationKeySpecifier = (
  | "createGithubSearch"
  | "createJiraAccount"
  | "createJiraSearch"
  | "createPhabricatorAccount"
  | "deleteGithubSearch"
  | "deleteJiraAccount"
  | "deleteJiraSearch"
  | "deletePhabricatorAccount"
  | "editGithubSearch"
  | "editJiraSearch"
  | "updatePhabricatorAccount"
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  createGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  createJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  createPhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  editGithubSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  editJiraSearch?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePhabricatorAccount?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type QueryKeySpecifier = (
  | "githubLoginUrl"
  | "schemaVersion"
  | "user"
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  githubLoginUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  schemaVersion?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | "email"
  | "githubAccounts"
  | "id"
  | "isAdmin"
  | "jiraAccounts"
  | "phabricatorAccounts"
  | "phabricatorQueries"
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  githubAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  jiraAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  phabricatorAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  phabricatorQueries?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StrictTypedTypePolicies = {
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
  Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | MutationKeySpecifier
      | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
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
  Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | QueryKeySpecifier
      | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
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
  possibleTypes: {},
};
export default result;
