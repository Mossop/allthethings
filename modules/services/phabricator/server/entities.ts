import type { RevisionStatus } from "conduit-api";

import type { PhabricatorAccount } from "#schema";
import type { GraphQLType } from "#utils";

export type PhabricatorAccountEntity = Omit<
  GraphQLType<PhabricatorAccount>,
  "icon" | "enabledQueries"
> & {
  userId: string;
  phid: string;
  icon: string | null;
  userIcon: string;
};

export interface PhabricatorQueryEntity {
  id: string;
  accountId: string;
  queryId: string;
}

export interface PhabricatorRevisionEntity {
  id: string;
  accountId: string;
  revisionId: number;
  title: string;
  uri: string;
  status: RevisionStatus;
}
