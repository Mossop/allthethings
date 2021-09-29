import type { FileFields, ThreadFields } from "../schema";

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

export type GoogleFileEntity = Omit<FileFields, "type">;

export type GoogleThreadEntity = Omit<ThreadFields, "type" | "labels" | "url">;

export interface GoogleLabelEntity {
  accountId: string;
  id: string;
  name: string;
}

export interface GoogleThreadLabelEntity {
  accountId: string;
  threadId: string;
  labelId: string;
}
