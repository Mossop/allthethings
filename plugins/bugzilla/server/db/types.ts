import type { Bug as BugzillaAPIBug } from "bugzilla";

import type { SearchType } from "#plugins/bugzilla/schema";
import type { GraphQLType } from "#utils";

import type { BugzillaAccount, BugzillaSearch } from "../schema";

export type BugzillaAccountRecord = Omit<GraphQLType<BugzillaAccount>, "searches"> & {
  userId: string;
  password: string | null;
};

export type BugzillaSearchRecord = Omit<GraphQLType<BugzillaSearch>, "url" | "type"> & {
  ownerId: string;
  type: SearchType;
};

export type BugzillaBugRecord = Pick<BugzillaAPIBug, "summary"> & {
  ownerId: string;
  bugId: number;
  id: string;
  status: string;
  resolution: string | null;
};
