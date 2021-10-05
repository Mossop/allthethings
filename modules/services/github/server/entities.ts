import type { IssueState, PullRequestState } from "./operations";

export interface GithubAccountEntity {
  id: string;
  userId: string;
  token: string;
  user: string;
  avatar: string;
}

export interface GithubSearchEntity {
  id: string;
  accountId: string;
  name: string;
  query: string;
  dueOffset: string | null;
}

export interface GithubRepositoryEntity {
  id: string;
  accountId: string;
  nodeId: string;
  owner: string;
  name: string;
  url: string;
}

export interface GithubIssueLikeEntity {
  id: string;
  repositoryId: string;
  nodeId: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  url: string;
  state: IssueState | PullRequestState;
}

export interface GithubLabelEntity {
  id: string;
  repositoryId: string;
  nodeId: string;
  name: string;
  color: string;
  url: string;
}

export interface IssueLikeLabelEntity {
  repositoryId: string;
  issueLike: string;
  label: string;
}
