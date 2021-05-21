export const enum SearchType {
  Quicksearch = "quick",
  Advanced = "advanced",
}

export interface SearchPresence {
  search: string;
  present: boolean;
}

export interface BugRecord {
  accountId: string;
  bugId: number;
  summary: string;
  url: string;
  icon: string | null;
  status: string;
  resolution: string | null;
}
