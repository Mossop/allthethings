import type { RevisionStatus } from "conduit-api";

import type { PhabricatorAccount } from "#schema";
import type { GraphQLType } from "#utils";

export type PhabricatorAccountRecord =
  Omit<GraphQLType<PhabricatorAccount>, "icon" | "enabledQueries"> & {
    userId: string;
    phid: string;
    icon: string | null;
    userIcon: string;
  };

export interface PhabricatorQueryRecord {
  id: string;
  accountId: string;
  queryId: string;
}

export interface PhabricatorRevisionRecord {
  id: string;
  accountId: string;
  revisionId: number;
  title: string;
  uri: string;
  status: RevisionStatus;
}
