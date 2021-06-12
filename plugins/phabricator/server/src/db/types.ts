import type { GraphQLType } from "@allthethings/utils";

import type { PhabricatorAccount } from "../schema";

export type PhabricatorAccountRecord = GraphQLType<PhabricatorAccount> & {
  userId: string;
};
