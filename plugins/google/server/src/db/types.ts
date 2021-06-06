import type { GraphQLType } from "@allthethings/utils";

import type { GoogleAccount } from "../schema";

export type GoogleAccountRecord = GraphQLType<GoogleAccount> & {
  user: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  expiry: number;
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

export interface GoogleThreadLabel {
  accountId: string;
  threadId: string;
  labelId: string;
}
