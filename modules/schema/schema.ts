/* eslint-disable */
import type { DateTime } from "luxon";
import type { DateTimeOffset } from "./types";
import type { RelativeDateTime } from "./types";
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
};

export type CreatePhabricatorAccountParams = {
  readonly apiKey: Scalars["String"];
  readonly queries: ReadonlyArray<Scalars["ID"]>;
  readonly url: Scalars["String"];
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

export type Mutation = {
  readonly __typename: "Mutation";
  readonly createJiraAccount: JiraAccount;
  readonly createJiraSearch: JiraSearch;
  readonly createPhabricatorAccount: PhabricatorAccount;
  readonly deleteJiraAccount?: Maybe<Scalars["Boolean"]>;
  readonly deleteJiraSearch?: Maybe<Scalars["Boolean"]>;
  readonly deletePhabricatorAccount?: Maybe<Scalars["Boolean"]>;
  readonly editJiraSearch?: Maybe<JiraSearch>;
  readonly updatePhabricatorAccount?: Maybe<PhabricatorAccount>;
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

export type MutationDeleteJiraAccountArgs = {
  account: Scalars["ID"];
};

export type MutationDeleteJiraSearchArgs = {
  search: Scalars["ID"];
};

export type MutationDeletePhabricatorAccountArgs = {
  account: Scalars["ID"];
};

export type MutationEditJiraSearchArgs = {
  params: JiraSearchParams;
  search: Scalars["ID"];
};

export type MutationUpdatePhabricatorAccountArgs = {
  id: Scalars["ID"];
  params: UpdatePhabricatorAccountParams;
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

export type Query = {
  readonly __typename: "Query";
  readonly schemaVersion: Scalars["String"];
  readonly user?: Maybe<User>;
};

export type UpdatePhabricatorAccountParams = {
  readonly apiKey?: Maybe<Scalars["String"]>;
  readonly queries?: Maybe<ReadonlyArray<Scalars["ID"]>>;
  readonly url?: Maybe<Scalars["String"]>;
};

export type User = {
  readonly __typename: "User";
  readonly email: Scalars["String"];
  readonly id: Scalars["ID"];
  readonly isAdmin: Scalars["Boolean"];
  readonly jiraAccounts: ReadonlyArray<JiraAccount>;
  readonly phabricatorAccounts: ReadonlyArray<PhabricatorAccount>;
  readonly phabricatorQueries: ReadonlyArray<PhabricatorQuery>;
};
