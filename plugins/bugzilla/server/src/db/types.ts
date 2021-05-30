import type { GraphQLType } from "@allthethings/utils";
import type { Bug as BugzillaAPIBug } from "bugzilla";

import type { BugzillaAccount, BugzillaSearch } from "../schema";
import type { SearchType } from "../types";

export type BugzillaAccountRecord = Omit<GraphQLType<BugzillaAccount>, "searches"> & {
  user: string;
  password: string | null;
};

export type BugzillaSearchRecord = Omit<GraphQLType<BugzillaSearch>, "url" | "type"> & {
  accountId: string;
  type: SearchType;
};

export type BugzillaBugRecord = Pick<BugzillaAPIBug, "summary"> & {
  accountId: string;
  bugId: number;
  itemId: string;
  status: string;
  resolution: string | null;
};
