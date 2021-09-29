import type { GithubAccount, GithubSearch } from "../../../schema";
import type { GraphQLType, Overwrite } from "../../../utils";
import type { IssueState, PullRequestState } from "./operations";

export type GithubAccountEntity = Omit<
  GithubAccount,
  "__typename" | "loginUrl" | "searches"
> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};

export type GithubSearchEntity = Overwrite<
  Omit<GraphQLType<GithubSearch>, "url">,
  {
    accountId: string;
    dueOffset: string | null;
  }
>;

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
