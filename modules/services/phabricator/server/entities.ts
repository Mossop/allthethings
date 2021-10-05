import type { RevisionStatus } from "conduit-api";

export interface PhabricatorAccountEntity {
  id: string;
  userId: string;
  apiKey: string;
  email: string;
  url: string;
  phid: string;
  icon: string | null;
  userIcon: string;
}

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
