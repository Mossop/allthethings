import type { GithubAccount, GithubSearch } from "#schema";
import type { GraphQLType, Overwrite } from "#utils";

import type {
  IssueState,
  PullRequestState,
  IssueFieldsFragment,
  LabelFieldsFragment,
  PrFieldsFragment,
  RepositoryFieldsFragment,
} from "./operations";

export type GithubAccountRecord = Omit<
  GithubAccount,
  "__typename" | "loginUrl" | "searches"
> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};

export type GithubSearchRecord = Overwrite<
  Omit<GraphQLType<GithubSearch>, "url">,
  {
    accountId: string;
    dueOffset: string | null;
  }
>;

export interface GithubRepositoryRecord {
  id: string;
  accountId: string;
  nodeId: string;
  owner: string;
  name: string;
  url: string;
}

export interface GithubIssueLikeRecord {
  id: string;
  repositoryId: string;
  nodeId: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  url: string;
  state: IssueState | PullRequestState;
}

export interface GithubLabelRecord {
  id: string;
  repositoryId: string;
  nodeId: string;
  name: string;
  color: string;
  url: string;
}

export interface IssueLikeLabelsRecord {
  repositoryId: string;
  issueLike: string;
  label: string;
}

export interface GithubServiceConfig {
  clientId: string;
  clientSecret: string;
}

export type IssueApiResult = IssueFieldsFragment;
export type PrApiResult = PrFieldsFragment;

export type IssueLikeApiResult = IssueApiResult | PrApiResult;
export type RepositoryApiResult = RepositoryFieldsFragment;
export type LabelApiResult = LabelFieldsFragment;
