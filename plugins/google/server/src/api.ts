/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type { drive_v3 } from "@googleapis/drive";
import { drive } from "@googleapis/drive";
import type { gmail_v1 } from "@googleapis/gmail";
import { gmail } from "@googleapis/gmail";
import type { people_v1 } from "@googleapis/people";
import { people } from "@googleapis/people";
import { decode as b64Decode } from "base-64";
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

const B64_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const GML_CHARSET = "BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz";

function *range(max: number): Iterable<number> {
  for (let i = 0; i < max; i++) {
    yield i;
  }
}

function *reversedRange(max: number): Iterable<number> {
  for (let i = max - 1; i >= 0; i--) {
    yield i;
  }
}

export function decodeWebId(id: string): string {
  let charsetLength = B64_CHARSET.length;

  let resultIndexes: number[] = [];
  for (let i of range(id.length)) {
    let offset = 0;

    for (let j of range(resultIndexes.length)) {
      let index = GML_CHARSET.length * resultIndexes[j] + offset;

      if (index >= charsetLength) {
        let rest = index % charsetLength;
        offset = Math.floor((index - rest) / charsetLength);
        index = rest;
      } else {
        offset = 0;
      }

      resultIndexes[j] = index;
    }

    while (offset) {
      let rest = offset % charsetLength;
      resultIndexes.push(rest);
      offset = Math.floor((offset - rest) / charsetLength);
    }

    offset = GML_CHARSET.indexOf(id[i]);

    let j = 0;
    while (offset) {
      if (j >= resultIndexes.length) {
        resultIndexes.push(0);
      }

      let index = resultIndexes[j] + offset;

      if (index >= charsetLength) {
        let rest = index % charsetLength;
        offset = Math.floor((index - rest) / charsetLength);
        index = rest;
      } else {
        offset = 0;
      }

      resultIndexes[j] = index;
      j += 1;
    }
  }

  let resultCharacters: string[] = [];
  for (let i of reversedRange(resultIndexes.length)) {
    let idx = resultIndexes[i];
    resultCharacters.push(B64_CHARSET[idx]);
  }

  while (resultCharacters.length % 4 != 0) {
    resultCharacters.push("=");
  }

  return b64Decode(resultCharacters.join(""));
}

export async function getAccountInfo(authClient: OAuth2Client): Promise<people_v1.Schema$Person> {
  let api = people({
    version: "v1",
    auth: authClient,
  });

  let { data: info } = await api.people.get({
    resourceName: "people/me",
    personFields: "photos",
  });

  return info;
}

export async function getThread(
  authClient: OAuth2Client,
  threadId: string,
): Promise<gmail_v1.Schema$Thread | null> {
  let api = gmail({
    version: "v1",
    auth: authClient,
  });

  try {
    let { data: thread } = await api.users.threads.get({
      userId: "me",
      id: threadId,
    });

    return thread;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export interface GoogleAPILabel {
  id: string;
  name: string;
}

function isLabel(label: gmail_v1.Schema$Label): label is GoogleAPILabel {
  if (!label.id || !label.name) {
    return false;
  }
  return label.type == "user";
}

export async function getLabels(authClient: OAuth2Client): Promise<GoogleAPILabel[]> {
  let api = gmail({
    version: "v1",
    auth: authClient,
  });

  try {
    let { data: { labels } } = await api.users.labels.list({
      userId: "me",
    });

    if (!labels) {
      return [];
    }

    return labels.filter(isLabel);
  } catch (e) {
    return [];
  }
}

type Present<T, F extends keyof T> = Omit<T, F> & {
  [K in F]-?: NonNullable<T[K]>;
};

export type GoogleAPIFile = Present<Pick<drive_v3.Schema$File,
  "id" |
  "name" |
  "mimeType" |
  "description" |
  "iconLink" |
  "webViewLink"
>, "id" | "name" | "mimeType">;

const fileFields: (keyof GoogleAPIFile | "trashed")[] = [
  "id",
  "name",
  "mimeType",
  "description",
  "iconLink",
  "webViewLink",
  "trashed",
];

export async function getFile(
  authClient: OAuth2Client,
  fileId: string,
): Promise<GoogleAPIFile | null> {
  let api = drive({
    version: "v3",
    auth: authClient,
  });

  try {
    let { data } = await api.files.get({
      fileId,
      supportsAllDrives: true,
      fields: fileFields.join(", "),
    });

    if (data.trashed) {
      return null;
    }

    if (!data.id || !data.name || !data.mimeType) {
      return null;
    }

    // @ts-ignore
    return data;
  } catch (e) {
    return null;
  }
}
