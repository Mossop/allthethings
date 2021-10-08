export interface FileFields {
  type: "file";
  accountId: string;
  name: string;
  description: string | null;
  mimeType: string;
  url: string | null;
}

export interface ThreadFields {
  type: "thread";
  labels: string[];
  url: string;
  accountId: string;
  subject: string;
  unread: boolean;
  starred: boolean;
}

export type GoogleFields = FileFields | ThreadFields;
