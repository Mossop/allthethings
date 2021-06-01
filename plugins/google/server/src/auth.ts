/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import { OAuth2Client } from "google-auth-library";

import type { GoogleAccountRecord } from "./db/types";
import type { GooglePluginConfig } from "./types";

export function createAuthClient(
  config: GooglePluginConfig,
  pluginUrl: URL,
  credentials?: GoogleAccountRecord,
): OAuth2Client {
  let callbackUrl = new URL("oauth", pluginUrl);

  let client = new OAuth2Client(
    config.clientId,
    config.clientSecret,
    callbackUrl.toString(),
  );

  if (credentials) {
    client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiry * 1000,
    });
  }

  return client;
}

export function generateAuthUrl(client: OAuth2Client, userId: string): string {
  return client.generateAuthUrl({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    state: userId,
  });
}
