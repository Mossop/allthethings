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

export interface BugRecord {
  accountId: string;
  bugId: number;
  summary: string;
  url: string;
  taskType: TaskType;
  icon: string | null;
}
