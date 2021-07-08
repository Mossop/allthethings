import type { FileFields, ThreadFields } from "#plugins/google/schema";
import type { GraphQLType } from "#utils";

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

export type GoogleFileRecord = Omit<FileFields, "type">;

export type GoogleThreadRecord = Omit<ThreadFields, "type" | "labels" | "url">;

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
