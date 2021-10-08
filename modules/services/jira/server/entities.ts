export interface JiraAccountEntity {
  id: string;
  userId: string;
  apiToken: string;
  email: string;
  serverName: string;
  url: string;
  userName: string;
}

export interface JiraIssueEntity {
  accountId: string;
  issueKey: string;
}

export interface JiraSearchEntity {
  id: string;
  accountId: string;
  name: string;
  query: string;
  dueOffset: string | null;
}
