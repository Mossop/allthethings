import type { DateTime } from "luxon";

import type { SearchType } from "../schema";

export interface BugzillaAccountEntity {
  id: string;
  userId: string;
  username: string | null;
  password: string | null;
  icon: string | null;
  name: string;
  url: string;
}

export interface BugzillaSearchEntity {
  id: string;
  accountId: string;
  name: string;
  query: string;
  type: SearchType;
  dueOffset: string | null;
}

export interface BugzillaBugEntity {
  accountId: string;
  bugId: number;
  done: DateTime | null;
}
