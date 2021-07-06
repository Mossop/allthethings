export interface FileFields {
  type: "file";
  ownerId: string;
  id: string;
  fileId: string;
  name: string;
  description: string | null;
  mimeType: string;
  url: string | null;
}

export interface ThreadFields {
  type: "thread";
  labels: string[];
  url: string;
  ownerId: string;
  id: string;
  threadId: string;
  subject: string;
  unread: boolean;
  starred: boolean;
}

export type GoogleFields = FileFields | ThreadFields;
