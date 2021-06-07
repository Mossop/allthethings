import type { GraphQLType } from "@allthethings/utils";

import type { GoogleAccount, GoogleMailSearch } from "../schema";

export type GoogleAccountRecord = Omit<GraphQLType<GoogleAccount>, "mailSearches"> & {
  user: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  expiry: number;
};

export type GoogleMailSearchRecord = Omit<GraphQLType<GoogleMailSearch>, "url"> & {
  accountId: string;
};

export interface GoogleFileRecord {
  accountId: string;
  fileId: string;
  itemId: string;
  name: string;
  description: string | null;
  mimeType: string;
  url: string | null;
}

export interface GoogleThreadRecord {
  accountId: string;
  threadId: string;
  itemId: string;
  subject: string;
  url: string;
  unread: boolean;
  starred: boolean;
}

export interface GoogleLabelRecord {
  accountId: string;
  labelId: string;
  name: string;
}

export interface GoogleThreadLabelRecord {
  accountId: string;
  threadId: string;
  labelId: string;
}
