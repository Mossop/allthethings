import type { Overwrite } from "#utils";

export interface IssueLikeFields {
  type: "issue" | "pr";
  number: number;
  title: string;
  url: string;
  repositoryOwner: string;
  repositoryName: string;
}

export type IssueFields = Overwrite<IssueLikeFields, {
  type: "issue";
}>;

export type PullRequestFields = Overwrite<IssueLikeFields, {
  type: "pr";
}>;
