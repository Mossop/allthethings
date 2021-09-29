import type { Overwrite } from "../../../utils";

/** The possible states of an issue. */
export enum IssueState {
  /** An issue that has been closed */
  Closed = "CLOSED",
  /** An issue that is still open */
  Open = "OPEN",
}

/** The possible states of a pull request. */
export enum PullRequestState {
  /** A pull request that has been closed without being merged. */
  Closed = "CLOSED",
  /** A pull request that has been closed by being merged. */
  Merged = "MERGED",
  /** A pull request that is still open. */
  Open = "OPEN",
}

export interface LabelFields {
  name: string;
  color: string;
  url: string;
}

export interface RepositoryFields {
  name: string;
  owner: string;
  url: string;
}

export interface IssueLikeFields {
  type: "issue" | "pr";
  number: number;
  title: string;
  url: string;
  state: IssueState | PullRequestState;
  repository: RepositoryFields;
  labels: LabelFields[];
}

export type IssueFields = Overwrite<
  IssueLikeFields,
  {
    type: "issue";
    state: IssueState;
  }
>;

export type PullRequestFields = Overwrite<
  IssueLikeFields,
  {
    type: "pr";
    state: PullRequestState;
  }
>;
