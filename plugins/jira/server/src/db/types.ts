import type { GraphQLType } from "@allthethings/utils";

import type { JiraAccount } from "../schema";

export type JiraAccountRecord = GraphQLType<JiraAccount> & {
  userId: string;
};

export interface JiraIssueRecord {
  ownerId: string;
  issueKey: string;
  id: string;
  icon: string | null;
  summary: string;
  status: string;
}
