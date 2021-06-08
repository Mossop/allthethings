import type { GraphQLType } from "@allthethings/utils";
import type { Bug as BugzillaAPIBug } from "bugzilla";

import type { BugzillaAccount, BugzillaSearch } from "../schema";
import type { SearchType } from "../types";

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
