import type { JiraAccount } from "#schema";
import type { GraphQLType } from "#utils";

export type JiraAccountRecord = Omit<GraphQLType<JiraAccount>, "searches"> & {
  userId: string;
};

export interface JiraIssueRecord {
  accountId: string;
  issueKey: string;
  id: string;
  icon: string | null;
  type: string;
  summary: string;
  status: string;
}

export interface JiraSearchRecord {
  accountId: string;
  id: string;
  name: string;
  query: string;
  dueOffset: string | null;
}
