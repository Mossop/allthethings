import type { GithubAccount } from "#schema";

export type GithubAccountRecord = Omit<GithubAccount, "__typename" | "loginUrl"> & {
  userId: string;
  token: string;
  user: string;
  avatar: string;
};
