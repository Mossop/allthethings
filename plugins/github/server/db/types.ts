import type { GithubAccount } from "#schema";

export type GithubAccountRecord = Omit<GithubAccount, "__typename" | "loginUrl"> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};

export interface GithubIssueLikeRecord {
  id: string;
  ownerId: string;
  nodeId: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  url: string;
  repositoryOwner: string;
  repositoryName: string;
}
