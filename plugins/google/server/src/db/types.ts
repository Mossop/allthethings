import type { GraphQLType } from "@allthethings/utils";

import type { GoogleAccount, GoogleMailSearch } from "../schema";

export type GoogleAccountRecord = Omit<GraphQLType<GoogleAccount>, "mailSearches" | "loginUrl"> & {
  userId: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiry: number;
};

export type GoogleMailSearchRecord = Omit<GraphQLType<GoogleMailSearch>, "url"> & {
  ownerId: string;
};

export interface GoogleFileRecord {
  ownerId: string;
  id: string;
  fileId: string;
  name: string;
  description: string | null;
  mimeType: string;
  url: string | null;
}

export interface GoogleThreadRecord {
  ownerId: string;
  id: string;
  threadId: string;
  subject: string;
  unread: boolean;
  starred: boolean;
}

export interface GoogleLabelRecord {
  ownerId: string;
  id: string;
  name: string;
}

export interface GoogleThreadLabelRecord {
  ownerId: string;
  threadId: string;
  labelId: string;
}
