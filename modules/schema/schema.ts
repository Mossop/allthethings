/* eslint-disable */
import type { DateTime } from "luxon";
import type { DateTimeOffset } from "./types";
import type { RelativeDateTime } from "./types";
import type { TaskController } from "./types";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
  DateTimeOffset: DateTimeOffset;
  RelativeDateTime: RelativeDateTime;
  TaskController: TaskController;
};

export type BugzillaAccount = {
  readonly __typename: "BugzillaAccount";
  readonly icon?: Maybe<Scalars["String"]>;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly searches: ReadonlyArray<BugzillaSearch>;
  readonly url: Scalars["String"];
  readonly username?: Maybe<Scalars["String"]>;
};

export type BugzillaAccountParams = {
  readonly name: Scalars["String"];
  readonly password?: Maybe<Scalars["String"]>;
  readonly url: Scalars["String"];
  readonly username?: Maybe<Scalars["String"]>;
};

export type BugzillaSearch = {
  readonly __typename: "BugzillaSearch";
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly type: Scalars["String"];
  readonly url: Scalars["String"];
};

export type BugzillaSearchParams = {
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type Context = TaskList & {
  readonly __typename: "Context";
  readonly id: Scalars["ID"];
  readonly items: ItemSet;
  readonly name: Scalars["String"];
  readonly projectById?: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly stub: Scalars["String"];
  readonly subprojects: ReadonlyArray<Project>;
  readonly user: User;
};

export type ContextItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type ContextProjectByIdArgs = {
  id: Scalars["ID"];
};

export type CreatePhabricatorAccountParams = {
  readonly apiKey: Scalars["String"];
  readonly queries: ReadonlyArray<Scalars["ID"]>;
  readonly url: Scalars["String"];
};

export type FileDetail = {
  readonly __typename: "FileDetail";
  readonly filename: Scalars["String"];
  readonly mimetype: Scalars["String"];
  readonly size: Scalars["Int"];
};

export type GithubAccount = {
  readonly __typename: "GithubAccount";
  readonly avatar: Scalars["String"];
  readonly id: Scalars["ID"];
  readonly loginUrl: Scalars["String"];
  readonly searches: ReadonlyArray<GithubSearch>;
  readonly user: Scalars["String"];
};

export type GithubSearch = {
  readonly __typename: "GithubSearch";
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type GithubSearchParams = {
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type GoogleAccount = {
  readonly __typename: "GoogleAccount";
  readonly avatar?: Maybe<Scalars["String"]>;
  readonly email: Scalars["String"];
  readonly id: Scalars["ID"];
  readonly loginUrl: Scalars["String"];
  readonly mailSearches: ReadonlyArray<GoogleMailSearch>;
};

export type GoogleMailSearch = {
  readonly __typename: "GoogleMailSearch";
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type GoogleMailSearchParams = {
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type Item = {
  readonly __typename: "Item";
  readonly archived?: Maybe<Scalars["DateTime"]>;
  readonly created: Scalars["DateTime"];
  readonly detail?: Maybe<ItemDetail>;
  readonly id: Scalars["ID"];
  readonly snoozed?: Maybe<Scalars["DateTime"]>;
  readonly summary: Scalars["String"];
  readonly taskInfo?: Maybe<TaskInfo>;
};

export type ItemDetail = FileDetail | LinkDetail | NoteDetail | ServiceDetail;

export type ItemFilter = {
  readonly dueAfter?: Maybe<Scalars["RelativeDateTime"]>;
  readonly dueBefore?: Maybe<Scalars["RelativeDateTime"]>;
  readonly isArchived?: Maybe<Scalars["Boolean"]>;
  readonly isPending?: Maybe<Scalars["Boolean"]>;
  readonly isSnoozed?: Maybe<Scalars["Boolean"]>;
  readonly isTask?: Maybe<Scalars["Boolean"]>;
};

export type ItemSet = {
  readonly __typename: "ItemSet";
  readonly count: Scalars["Int"];
  readonly items: ReadonlyArray<Item>;
};

export type JiraAccount = {
  readonly __typename: "JiraAccount";
  readonly apiToken: Scalars["String"];
  readonly email: Scalars["String"];
  readonly id: Scalars["ID"];
  readonly searches: ReadonlyArray<JiraSearch>;
  readonly serverName: Scalars["String"];
  readonly url: Scalars["String"];
  readonly userName: Scalars["String"];
};

export type JiraAccountParams = {
  readonly apiToken: Scalars["String"];
  readonly email: Scalars["String"];
  readonly url: Scalars["String"];
};

export type JiraSearch = {
  readonly __typename: "JiraSearch";
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type JiraSearchParams = {
  readonly dueOffset?: Maybe<Scalars["DateTimeOffset"]>;
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type LinkDetail = {
  readonly __typename: "LinkDetail";
  readonly icon?: Maybe<Scalars["String"]>;
  readonly url: Scalars["String"];
};

export type Mutation = {
  readonly __typename: "Mutation";
  readonly changePassword?: Maybe<User>;
  readonly createBugzillaAccount: BugzillaAccount;
  readonly createBugzillaSearch: BugzillaSearch;
  readonly createGithubSearch: GithubSearch;
  readonly createGoogleMailSearch: GoogleMailSearch;
  readonly createJiraAccount: JiraAccount;
  readonly createJiraSearch: JiraSearch;
  readonly createPhabricatorAccount: PhabricatorAccount;
  readonly createUser: User;
  readonly deleteBugzillaAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteBugzillaSearch?: Maybe<Scalars["Boolean"]>;
  readonly deleteGithubSearch: Scalars["Boolean"];
  readonly deleteGoogleMailSearch: Scalars["Boolean"];
  readonly deleteJiraAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteJiraSearch?: Maybe<Scalars["Boolean"]>;
  readonly deletePhabricatorAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteUser?: Maybe<Scalars["Boolean"]>;
  readonly editBugzillaSearch?: Maybe<BugzillaSearch>;
  readonly editGithubSearch?: Maybe<GithubSearch>;
  readonly editGoogleMailSearch?: Maybe<GoogleMailSearch>;
  readonly editJiraSearch?: Maybe<JiraSearch>;
  readonly markTaskDone?: Maybe<Item>;
  readonly markTaskDue?: Maybe<Item>;
  readonly setTaskController?: Maybe<Item>;
  readonly updatePhabricatorAccount?: Maybe<PhabricatorAccount>;
};

export type MutationChangePasswordArgs = {
  currentPassword: Scalars["String"];
  newPassword: Scalars["String"];
};

export type MutationCreateBugzillaAccountArgs = {
  params: BugzillaAccountParams;
};

export type MutationCreateBugzillaSearchArgs = {
  account: Scalars["ID"];
  params: BugzillaSearchParams;
};

export type MutationCreateGithubSearchArgs = {
  account: Scalars["ID"];
  params: GithubSearchParams;
};

export type MutationCreateGoogleMailSearchArgs = {
  account: Scalars["ID"];
  params: GoogleMailSearchParams;
};

export type MutationCreateJiraAccountArgs = {
  params: JiraAccountParams;
};

export type MutationCreateJiraSearchArgs = {
  account: Scalars["ID"];
  params: JiraSearchParams;
};

export type MutationCreatePhabricatorAccountArgs = {
  params: CreatePhabricatorAccountParams;
};

export type MutationCreateUserArgs = {
  email: Scalars["String"];
  isAdmin?: Maybe<Scalars["Boolean"]>;
  password: Scalars["String"];
};

export type MutationDeleteBugzillaAccountArgs = {
  account: Scalars["ID"];
};

export type MutationDeleteBugzillaSearchArgs = {
  search: Scalars["ID"];
};

export type MutationDeleteGithubSearchArgs = {
  search: Scalars["ID"];
};

export type MutationDeleteGoogleMailSearchArgs = {
  id: Scalars["ID"];
};

export type MutationDeleteJiraAccountArgs = {
  account: Scalars["ID"];
};

export type MutationDeleteJiraSearchArgs = {
  search: Scalars["ID"];
};

export type MutationDeletePhabricatorAccountArgs = {
  account: Scalars["ID"];
};

export type MutationDeleteUserArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type MutationEditBugzillaSearchArgs = {
  params: BugzillaSearchParams;
  search: Scalars["ID"];
};

export type MutationEditGithubSearchArgs = {
  params: GithubSearchParams;
  search: Scalars["ID"];
};

export type MutationEditGoogleMailSearchArgs = {
  id: Scalars["ID"];
  params: GoogleMailSearchParams;
};

export type MutationEditJiraSearchArgs = {
  params: JiraSearchParams;
  search: Scalars["ID"];
};

export type MutationMarkTaskDoneArgs = {
  done?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
};

export type MutationMarkTaskDueArgs = {
  due?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
};

export type MutationSetTaskControllerArgs = {
  controller?: Maybe<Scalars["TaskController"]>;
  id: Scalars["ID"];
};

export type MutationUpdatePhabricatorAccountArgs = {
  id: Scalars["ID"];
  params: UpdatePhabricatorAccountParams;
};

export type NoteDetail = {
  readonly __typename: "NoteDetail";
  readonly note: Scalars["String"];
};

export type PhabricatorAccount = {
  readonly __typename: "PhabricatorAccount";
  readonly apiKey: Scalars["String"];
  readonly email: Scalars["String"];
  readonly enabledQueries: ReadonlyArray<Scalars["ID"]>;
  readonly icon: Scalars["String"];
  readonly id: Scalars["ID"];
  readonly url: Scalars["String"];
};

export type PhabricatorQuery = {
  readonly __typename: "PhabricatorQuery";
  readonly description: Scalars["String"];
  readonly name: Scalars["String"];
  readonly queryId: Scalars["ID"];
};

export type Problem = {
  readonly __typename: "Problem";
  readonly description: Scalars["String"];
  readonly url: Scalars["String"];
};

export type Project = TaskList & {
  readonly __typename: "Project";
  readonly id: Scalars["ID"];
  readonly items: ItemSet;
  readonly name: Scalars["String"];
  readonly sections: ReadonlyArray<Section>;
  readonly stub: Scalars["String"];
  readonly subprojects: ReadonlyArray<Project>;
  readonly taskList: Context | Project;
};

export type ProjectItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type Query = {
  readonly __typename: "Query";
  readonly githubLoginUrl: Scalars["String"];
  readonly googleLoginUrl: Scalars["String"];
  readonly problems: ReadonlyArray<Problem>;
  readonly schemaVersion: Scalars["String"];
  readonly taskList?: Maybe<Context | Project>;
  readonly user?: Maybe<User>;
  readonly users: ReadonlyArray<User>;
};

export type QueryTaskListArgs = {
  id: Scalars["ID"];
};

export type Section = {
  readonly __typename: "Section";
  readonly id: Scalars["ID"];
  readonly items: ItemSet;
  readonly name: Scalars["String"];
};

export type SectionItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type ServiceDetail = {
  readonly __typename: "ServiceDetail";
  readonly fields: Scalars["String"];
  readonly hasTaskState: Scalars["Boolean"];
  readonly isCurrentlyListed: Scalars["Boolean"];
  readonly lists: ReadonlyArray<ServiceList>;
  readonly serviceId: Scalars["String"];
  readonly wasEverListed: Scalars["Boolean"];
};

export type ServiceList = {
  readonly __typename: "ServiceList";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly serviceId: Scalars["String"];
  readonly url?: Maybe<Scalars["String"]>;
};

export type TaskInfo = {
  readonly __typename: "TaskInfo";
  readonly controller: Scalars["TaskController"];
  readonly done?: Maybe<Scalars["DateTime"]>;
  readonly due?: Maybe<Scalars["DateTime"]>;
};

export type TaskList = {
  readonly items: ItemSet;
  readonly sections: ReadonlyArray<Section>;
  readonly subprojects: ReadonlyArray<Project>;
};

export type TaskListItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type UpdatePhabricatorAccountParams = {
  readonly apiKey?: Maybe<Scalars["String"]>;
  readonly queries?: Maybe<ReadonlyArray<Scalars["ID"]>>;
  readonly url?: Maybe<Scalars["String"]>;
};

export type User = {
  readonly __typename: "User";
  readonly bugzillaAccounts: ReadonlyArray<BugzillaAccount>;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars["String"];
  readonly githubAccounts: ReadonlyArray<GithubAccount>;
  readonly googleAccounts: ReadonlyArray<GoogleAccount>;
  readonly id: Scalars["ID"];
  readonly inbox: ItemSet;
  readonly isAdmin: Scalars["Boolean"];
  readonly jiraAccounts: ReadonlyArray<JiraAccount>;
  readonly phabricatorAccounts: ReadonlyArray<PhabricatorAccount>;
  readonly phabricatorQueries: ReadonlyArray<PhabricatorQuery>;
};

export type UserInboxArgs = {
  filter?: Maybe<ItemFilter>;
};
