import type { GithubAccount, GithubSearch } from "#schema";
import type { GraphQLType } from "#utils";

import type { IssueState, PullRequestState } from "../operations";

export type GithubAccountRecord = Omit<GithubAccount, "__typename" | "loginUrl" | "searches"> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};

export type GithubSearchRecord = Omit<GraphQLType<GithubSearch>, "url"> & {
  ownerId: string;
};

export interface GithubRepositoryRecord {
  id: string;
  ownerId: string;
  nodeId: string;
  owner: string;
  name: string;
  url: string;
}

export interface GithubIssueLikeRecord {
  id: string;
  ownerId: string;
  nodeId: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  url: string;
  state: IssueState | PullRequestState;
}

export interface GithubLabelRecord {
  id: string;
  ownerId: string;
  nodeId: string;
  name: string;
  color: string;
  url: string;
}

export interface IssueLikeLabelsRecord {
  ownerId: string;
  issueLike: string;
  label: string;
}
