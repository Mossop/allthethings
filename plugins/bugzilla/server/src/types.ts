export const enum SearchType {
  Quicksearch = "quick",
  Advanced = "advanced",
}

export const enum TaskType {
  None = "none",
  Manual = "manual",
  Search = "search",
  Resolved = "resolved",
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
  taskType: TaskType;
  icon: string | null;
  status: string;
  resolution: string | null;
  searches: SearchPresence[];
}
