import type { GraphQLType } from "#utils";

import type { JiraAccount } from "../../../schema";

export type JiraAccountEntity = Omit<GraphQLType<JiraAccount>, "searches"> & {
  userId: string;
};

export interface JiraIssueEntity {
  accountId: string;
  issueKey: string;
  id: string;
  icon: string | null;
  type: string;
  summary: string;
  status: string;
}

export interface JiraSearchEntity {
  accountId: string;
  id: string;
  name: string;
  query: string;
  dueOffset: string | null;
}
