export enum SearchType {
  Quicksearch = "quick",
  Advanced = "advanced",
}

export interface BugFields {
  accountId: string;
  bugId: number;
  summary: string;
  url: string;
  icon: string | null;
  status: string;
  resolution: string | null;
}
