import type { GoogleAccount, GoogleMailSearch } from "../../../schema";
import type { GraphQLType } from "../../../utils";
import type { FileFields, ThreadFields } from "../schema";

export type GoogleAccountEntity = Omit<
  GraphQLType<GoogleAccount>,
  "mailSearches" | "loginUrl"
> & {
  userId: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiry: number;
};

export type GoogleMailSearchEntity = Omit<
  GraphQLType<GoogleMailSearch>,
  "url" | "dueOffset"
> & {
  accountId: string;
  dueOffset: string | null;
};

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
