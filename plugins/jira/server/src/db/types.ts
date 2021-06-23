import type { GraphQLType } from "@allthethings/utils";

import type { JiraAccount } from "../schema";

export type JiraAccountRecord = GraphQLType<JiraAccount> & {
  userId: string;
};
