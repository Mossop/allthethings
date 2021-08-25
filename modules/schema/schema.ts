/* eslint-disable */
import type { DateTime } from "luxon";
import type { DateTimeOffset } from "./types";
import type { RelativeDateTime } from "./types";
import type { TaskController } from "./types";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
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
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly icon?: Maybe<Scalars["String"]>;
  readonly url: Scalars["String"];
  readonly username?: Maybe<Scalars["String"]>;
  readonly searches: ReadonlyArray<BugzillaSearch>;
};

export type BugzillaAccountParams = {
  readonly name: Scalars["String"];
  readonly url: Scalars["String"];
  readonly username?: Maybe<Scalars["String"]>;
  readonly password?: Maybe<Scalars["String"]>;
};

export type BugzillaSearch = {
  readonly __typename: "BugzillaSearch";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly type: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type BugzillaSearchParams = {
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type Context = TaskList & {
  readonly __typename: "Context";
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly id: Scalars["ID"];
  readonly user: User;
  readonly stub: Scalars["String"];
  readonly name: Scalars["String"];
  readonly projects: ReadonlyArray<Project>;
  readonly projectById?: Maybe<Project>;
};

export type ContextItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type ContextProjectByIdArgs = {
  id: Scalars["ID"];
};

export type ContextParams = {
  readonly name: Scalars["String"];
};

export type CreatePhabricatorAccountParams = {
  readonly url: Scalars["String"];
  readonly apiKey: Scalars["String"];
  readonly queries: ReadonlyArray<Scalars["ID"]>;
};

export type FileDetail = {
  readonly __typename: "FileDetail";
  readonly filename: Scalars["String"];
  readonly mimetype: Scalars["String"];
  readonly size: Scalars["Int"];
};

export type GithubAccount = {
  readonly __typename: "GithubAccount";
  readonly id: Scalars["ID"];
  readonly user: Scalars["String"];
  readonly avatar: Scalars["String"];
  readonly loginUrl: Scalars["String"];
  readonly searches: ReadonlyArray<GithubSearch>;
};

export type GithubSearch = {
  readonly __typename: "GithubSearch";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type GithubSearchParams = {
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type GoogleAccount = {
  readonly __typename: "GoogleAccount";
  readonly id: Scalars["ID"];
  readonly email: Scalars["String"];
  readonly avatar?: Maybe<Scalars["String"]>;
  readonly mailSearches: ReadonlyArray<GoogleMailSearch>;
  readonly loginUrl: Scalars["String"];
};

export type GoogleMailSearch = {
  readonly __typename: "GoogleMailSearch";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type GoogleMailSearchParams = {
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type Item = {
  readonly __typename: "Item";
  readonly id: Scalars["ID"];
  readonly summary: Scalars["String"];
  readonly created: Scalars["DateTime"];
  readonly archived?: Maybe<Scalars["DateTime"]>;
  readonly snoozed?: Maybe<Scalars["DateTime"]>;
  readonly taskInfo?: Maybe<TaskInfo>;
  readonly detail?: Maybe<ItemDetail>;
};

export type ItemDetail = ServiceDetail | LinkDetail | NoteDetail | FileDetail;

export type ItemFilter = {
  readonly isSnoozed?: Maybe<Scalars["Boolean"]>;
  readonly isArchived?: Maybe<Scalars["Boolean"]>;
  readonly dueBefore?: Maybe<Scalars["RelativeDateTime"]>;
  readonly dueAfter?: Maybe<Scalars["RelativeDateTime"]>;
  readonly isTask?: Maybe<Scalars["Boolean"]>;
  readonly isPending?: Maybe<Scalars["Boolean"]>;
};

export type ItemParams = {
  readonly summary: Scalars["String"];
  readonly archived?: Maybe<Scalars["DateTime"]>;
  readonly snoozed?: Maybe<Scalars["DateTime"]>;
};

export type ItemSet = {
  readonly __typename: "ItemSet";
  readonly count: Scalars["Int"];
  readonly items: ReadonlyArray<Item>;
};

export type JiraAccount = {
  readonly __typename: "JiraAccount";
  readonly id: Scalars["ID"];
  readonly serverName: Scalars["String"];
  readonly userName: Scalars["String"];
  readonly url: Scalars["String"];
  readonly email: Scalars["String"];
  readonly apiToken: Scalars["String"];
  readonly searches: ReadonlyArray<JiraSearch>;
};

export type JiraAccountParams = {
  readonly url: Scalars["String"];
  readonly email: Scalars["String"];
  readonly apiToken: Scalars["String"];
};

export type JiraSearch = {
  readonly __typename: "JiraSearch";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
  readonly url: Scalars["String"];
};

export type JiraSearchParams = {
  readonly name: Scalars["String"];
  readonly query: Scalars["String"];
};

export type LinkDetail = {
  readonly __typename: "LinkDetail";
  readonly icon?: Maybe<Scalars["String"]>;
  readonly url: Scalars["String"];
};

export type LinkDetailParams = {
  readonly url: Scalars["String"];
};

export type Mutation = {
  readonly __typename: "Mutation";
  readonly archiveItem?: Maybe<Item>;
  readonly changePassword?: Maybe<User>;
  readonly createBugzillaAccount: BugzillaAccount;
  readonly createBugzillaSearch: BugzillaSearch;
  readonly createContext: Context;
  readonly createGithubSearch: GithubSearch;
  readonly createGoogleMailSearch: GoogleMailSearch;
  readonly createJiraAccount: JiraAccount;
  readonly createJiraSearch: JiraSearch;
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createPhabricatorAccount: PhabricatorAccount;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly createUser: User;
  readonly deleteBugzillaAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteBugzillaSearch?: Maybe<Scalars["Boolean"]>;
  readonly deleteContext: Scalars["Boolean"];
  readonly deleteItem: Scalars["Boolean"];
  readonly deleteJiraAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteJiraSearch?: Maybe<Scalars["Boolean"]>;
  readonly deletePhabricatorAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteProject: Scalars["Boolean"];
  readonly deleteSection: Scalars["Boolean"];
  readonly deleteUser?: Maybe<Scalars["Boolean"]>;
  readonly editContext?: Maybe<Context>;
  readonly editItem?: Maybe<Item>;
  readonly editProject?: Maybe<Project>;
  readonly editSection?: Maybe<Section>;
  readonly markTaskDone?: Maybe<Item>;
  readonly markTaskDue?: Maybe<Item>;
  readonly moveItem?: Maybe<Item>;
  readonly moveProject?: Maybe<Project>;
  readonly moveSection?: Maybe<Section>;
  readonly setTaskController?: Maybe<Item>;
  readonly snoozeItem?: Maybe<Item>;
  readonly updatePhabricatorAccount?: Maybe<PhabricatorAccount>;
};

export type MutationArchiveItemArgs = {
  id: Scalars["ID"];
  archived?: Maybe<Scalars["DateTime"]>;
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

export type MutationCreateContextArgs = {
  params: ContextParams;
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

export type MutationCreateLinkArgs = {
  section?: Maybe<Scalars["ID"]>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars["Boolean"];
};

export type MutationCreateNoteArgs = {
  section?: Maybe<Scalars["ID"]>;
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars["Boolean"];
};

export type MutationCreatePhabricatorAccountArgs = {
  params: CreatePhabricatorAccountParams;
};

export type MutationCreateProjectArgs = {
  taskList: Scalars["ID"];
  params: ProjectParams;
};

export type MutationCreateSectionArgs = {
  taskList: Scalars["ID"];
  before?: Maybe<Scalars["ID"]>;
  params: SectionParams;
};

export type MutationCreateTaskArgs = {
  section?: Maybe<Scalars["ID"]>;
  item: ItemParams;
};

export type MutationCreateUserArgs = {
  email: Scalars["String"];
  password: Scalars["String"];
  isAdmin?: Maybe<Scalars["Boolean"]>;
};

export type MutationDeleteBugzillaAccountArgs = {
  account: Scalars["ID"];
};

export type MutationDeleteBugzillaSearchArgs = {
  search: Scalars["ID"];
};

export type MutationDeleteContextArgs = {
  id: Scalars["ID"];
};

export type MutationDeleteItemArgs = {
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

export type MutationDeleteProjectArgs = {
  id: Scalars["ID"];
};

export type MutationDeleteSectionArgs = {
  id: Scalars["ID"];
};

export type MutationDeleteUserArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type MutationEditContextArgs = {
  id: Scalars["ID"];
  params: ContextParams;
};

export type MutationEditItemArgs = {
  id: Scalars["ID"];
  item: ItemParams;
};

export type MutationEditProjectArgs = {
  id: Scalars["ID"];
  params: ProjectParams;
};

export type MutationEditSectionArgs = {
  id: Scalars["ID"];
  params: SectionParams;
};

export type MutationMarkTaskDoneArgs = {
  id: Scalars["ID"];
  done?: Maybe<Scalars["DateTime"]>;
};

export type MutationMarkTaskDueArgs = {
  id: Scalars["ID"];
  due?: Maybe<Scalars["DateTime"]>;
};

export type MutationMoveItemArgs = {
  id: Scalars["ID"];
  section?: Maybe<Scalars["ID"]>;
  before?: Maybe<Scalars["ID"]>;
};

export type MutationMoveProjectArgs = {
  id: Scalars["ID"];
  taskList: Scalars["ID"];
};

export type MutationMoveSectionArgs = {
  id: Scalars["ID"];
  taskList: Scalars["ID"];
  before?: Maybe<Scalars["ID"]>;
};

export type MutationSetTaskControllerArgs = {
  id: Scalars["ID"];
  controller?: Maybe<Scalars["TaskController"]>;
};

export type MutationSnoozeItemArgs = {
  id: Scalars["ID"];
  snoozed?: Maybe<Scalars["DateTime"]>;
};

export type MutationUpdatePhabricatorAccountArgs = {
  id: Scalars["ID"];
  params: UpdatePhabricatorAccountParams;
};

export type NoteDetail = {
  readonly __typename: "NoteDetail";
  readonly note: Scalars["String"];
};

export type NoteDetailParams = {
  readonly note: Scalars["String"];
};

export type PhabricatorAccount = {
  readonly __typename: "PhabricatorAccount";
  readonly id: Scalars["ID"];
  readonly icon: Scalars["String"];
  readonly url: Scalars["String"];
  readonly email: Scalars["String"];
  readonly apiKey: Scalars["String"];
  readonly enabledQueries: ReadonlyArray<Scalars["ID"]>;
};

export type PhabricatorQuery = {
  readonly __typename: "PhabricatorQuery";
  readonly queryId: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly description: Scalars["String"];
};

export type Problem = {
  readonly __typename: "Problem";
  readonly description: Scalars["String"];
  readonly url: Scalars["String"];
};

export type Project = TaskList & {
  readonly __typename: "Project";
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly id: Scalars["ID"];
  readonly stub: Scalars["String"];
  readonly name: Scalars["String"];
  readonly taskList: Context | Project;
};

export type ProjectItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type ProjectParams = {
  readonly name: Scalars["String"];
};

export type Query = {
  readonly __typename: "Query";
  readonly githubLoginUrl: Scalars["String"];
  readonly googleLoginUrl: Scalars["String"];
  readonly pageContent: Scalars["String"];
  readonly problems: ReadonlyArray<Problem>;
  readonly schemaVersion: Scalars["String"];
  readonly taskList?: Maybe<Context | Project>;
  readonly user?: Maybe<User>;
  readonly users: ReadonlyArray<User>;
};

export type QueryPageContentArgs = {
  path: Scalars["String"];
};

export type QueryTaskListArgs = {
  id: Scalars["ID"];
};

export type Section = {
  readonly __typename: "Section";
  readonly items: ItemSet;
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
};

export type SectionItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type SectionParams = {
  readonly name: Scalars["String"];
};

export type ServiceDetail = {
  readonly __typename: "ServiceDetail";
  readonly serviceId: Scalars["String"];
  readonly hasTaskState: Scalars["Boolean"];
  readonly wasEverListed: Scalars["Boolean"];
  readonly isCurrentlyListed: Scalars["Boolean"];
  readonly fields: Scalars["String"];
  readonly lists: ReadonlyArray<ServiceList>;
};

export type ServiceList = {
  readonly __typename: "ServiceList";
  readonly id: Scalars["ID"];
  readonly serviceId: Scalars["String"];
  readonly name: Scalars["String"];
  readonly url?: Maybe<Scalars["String"]>;
};

export type TaskInfo = {
  readonly __typename: "TaskInfo";
  readonly due?: Maybe<Scalars["DateTime"]>;
  readonly done?: Maybe<Scalars["DateTime"]>;
  readonly controller: Scalars["TaskController"];
};

export type TaskInfoParams = {
  readonly due?: Maybe<Scalars["DateTime"]>;
  readonly done?: Maybe<Scalars["DateTime"]>;
};

export type TaskList = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
};

export type TaskListItemsArgs = {
  filter?: Maybe<ItemFilter>;
};

export type UpdatePhabricatorAccountParams = {
  readonly url?: Maybe<Scalars["String"]>;
  readonly apiKey?: Maybe<Scalars["String"]>;
  readonly queries?: Maybe<ReadonlyArray<Scalars["ID"]>>;
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
