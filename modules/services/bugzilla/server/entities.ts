import type { Bug as BugzillaAPIBug } from "bugzilla";

import type { BugzillaAccount, BugzillaSearch } from "#schema";
import type { SearchType } from "#services/bugzilla/schema";
import type { GraphQLType } from "#utils";

export type BugzillaAccountEntity = Required<
  Omit<GraphQLType<BugzillaAccount>, "searches">
> & {
  userId: string;
  password: string | null;
};

export type BugzillaSearchEntity = Required<
  Omit<GraphQLType<BugzillaSearch>, "url" | "type" | "dueOffset">
> & {
  accountId: string;
  type: SearchType;
  dueOffset: string | null;
};

export type BugzillaBugEntity = Pick<BugzillaAPIBug, "summary"> & {
  accountId: string;
  bugId: number;
  id: string;
  status: string;
  resolution: string | null;
};
