import type { DateTime } from "luxon";

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
  accountId: string;
  revisionId: number;
  done: DateTime | null;
}
