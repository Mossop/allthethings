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

export interface GithubIssueLikeEntity {
  accountId: string;
  nodeId: string;
}
