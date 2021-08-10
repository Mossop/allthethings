import type { GoogleAccount, GoogleMailSearch } from "#schema";
import type { FileFields, ThreadFields } from "#services/google/schema";
import type { GraphQLType } from "#utils";

export type GoogleAccountRecord = Omit<
  GraphQLType<GoogleAccount>,
  "mailSearches" | "loginUrl"
> & {
  userId: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiry: number;
};

export type GoogleMailSearchRecord = Omit<
  GraphQLType<GoogleMailSearch>,
  "url"
> & {
  accountId: string;
};

export type GoogleFileRecord = Omit<FileFields, "type">;

export type GoogleThreadRecord = Omit<ThreadFields, "type" | "labels" | "url">;

export interface GoogleLabelRecord {
  accountId: string;
  id: string;
  name: string;
}

export interface GoogleThreadLabelRecord {
  accountId: string;
  threadId: string;
  labelId: string;
}

export interface GoogleServiceConfig {
  clientId: string;
  clientSecret: string;
}
