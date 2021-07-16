import type { GithubAccount } from "#schema";

import type { IssueState, PullRequestState } from "../operations";

export type GithubAccountRecord = Omit<GithubAccount, "__typename" | "loginUrl"> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};

export interface GithubRepositoryRecord{
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
