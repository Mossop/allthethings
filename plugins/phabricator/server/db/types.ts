import type { RevisionStatus } from "conduit-api";

import type { GraphQLType } from "#utils";

import type { PhabricatorAccount } from "../schema";

export type PhabricatorAccountRecord =
  Omit<GraphQLType<PhabricatorAccount>, "icon" | "enabledQueries"> & {
    userId: string;
    phid: string;
    icon: string | null;
    userIcon: string;
  };

export interface PhabricatorQueryRecord {
  id: string;
  ownerId: string;
  queryId: string;
}

export interface PhabricatorRevisionRecord {
  id: string;
  ownerId: string;
  revisionId: number;
  title: string;
  uri: string;
  status: RevisionStatus;
}
