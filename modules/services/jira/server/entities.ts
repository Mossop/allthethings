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
  id: string;
  accountId: string;
  issueKey: string;
  icon: string | null;
  type: string;
  summary: string;
  status: string;
}

export interface JiraSearchEntity {
  id: string;
  accountId: string;
  name: string;
  query: string;
  dueOffset: string | null;
}
