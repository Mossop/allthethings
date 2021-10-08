import type { DateTime } from "luxon";

export interface GoogleAccountEntity {
  id: string;
  userId: string;
  email: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiry: number;
}

export interface GoogleMailSearchEntity {
  id: string;
  accountId: string;
  name: string;
  query: string;
  dueOffset: string | null;
}

export interface GoogleFileEntity {
  accountId: string;
  fileId: string;
}

export interface GoogleThreadEntity {
  accountId: string;
  threadId: string;
  done: DateTime | null;
}

export interface GoogleLabelEntity {
  accountId: string;
  id: string;
  name: string;
}
