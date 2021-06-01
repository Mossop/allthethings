import type { GraphQLType } from "@allthethings/utils";

import type { GoogleAccount } from "../schema";

export type GoogleAccountRecord = GraphQLType<GoogleAccount> & {
  user: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  expiry: number;
};
