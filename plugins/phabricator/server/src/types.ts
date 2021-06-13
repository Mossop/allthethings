import type { RevisionStatus } from "conduit-api";

export type { RevisionStatus } from "conduit-api";

export interface RevisionFields {
  accountId: string;
  revisionId: number;
  title: string;
  uri: string;
  status: RevisionStatus;
}
