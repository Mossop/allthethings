import type { GraphQLType } from "@allthethings/utils";

import type { PhabricatorAccount } from "../schema";

export type PhabricatorAccountRecord = Omit<GraphQLType<PhabricatorAccount>, "enabledQueries"> & {
  userId: string;
  phid: string;
};

export interface PhabricatorQueryRecord {
  id: string;
  ownerId: string;
  queryId: string;
}
