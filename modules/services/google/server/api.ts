/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import { decode as b64Decode, encode as b64Encode } from "base-64";
import type { drive_v3, gmail_v1, people_v1 } from "googleapis";
import { google, Auth } from "googleapis";
import { GaxiosError } from "googleapis-common";

import type { ServiceTransaction } from "#server/utils";

import { GoogleService } from ".";
import type { GoogleAccountEntity } from "./entities";
import type { Account } from "./implementations";

export async function getAccountInfo(
  authClient: Auth.OAuth2Client,
): Promise<people_v1.Schema$Person> {
  let api = google.people({
    version: "v1",
    auth: authClient,
  });

  let { data: info } = await api.people.get({
    resourceName: "people/me",
    personFields: "photos",
  });

  return info;
}

function isNonNull<T>(item: T | null): item is T {
  return !!item;
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

type Present<T, F extends keyof T> = Omit<T, F> &
  {
    [K in F]-?: NonNullable<T[K]>;
  };

export type GoogleAPIFile = Present<
  Pick<
    drive_v3.Schema$File,
    "id" | "name" | "mimeType" | "description" | "iconLink" | "webViewLink"
  >,
  "id" | "name" | "mimeType"
>;

const fileFields: (keyof GoogleAPIFile | "trashed")[] = [
  "id",
  "name",
  "mimeType",
  "description",
  "iconLink",
  "webViewLink",
  "trashed",
];

export class GoogleApi {
  private readonly client: Auth.OAuth2Client;

  public constructor(
    private readonly account: Account,
    credentials: GoogleAccountEntity,
  ) {
    this.client = GoogleApi.createAuthClient(account.tx.serviceUrl);

    this.client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiry * 1000,
    });

    this.watchTokens();
  }

  public static createAuthClient(serviceUrl: URL): Auth.OAuth2Client {
    let callbackUrl = new URL("oauth", serviceUrl);

    return new Auth.OAuth2Client(
      GoogleService.config.clientId,
      GoogleService.config.clientSecret,
      callbackUrl.toString(),
    );
  }

  private watchTokens(): void {
    this.client.on("tokens", (credentials: Auth.Credentials): void => {
      let {
        access_token: accessToken,
        expiry_date: expiry,
        refresh_token: refreshToken,
      } = credentials;

      if (!accessToken || !expiry) {
        this.account.tx.segment.error("Got bad access tokens", {
          accessToken,
          refreshToken,
          expiry,
        });
        GoogleService.service.setProblem(
          this.account,
          "Google API returned invalid access tokens.",
        );
      } else if (refreshToken) {
        GoogleService.service.clearProblem(this.account);
        void this.account.update({
          accessToken,
          refreshToken,
          expiry: Math.floor(expiry / 1000),
        });
      } else {
        void this.account.update({
          accessToken,
          expiry: Math.floor(expiry / 1000),
        });
      }
    });
  }

  public static generateAuthUrl(
    tx: ServiceTransaction,
    userId: string,
  ): string {
    let client = GoogleApi.createAuthClient(tx.serviceUrl);

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

  public generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
      state: this.account.userId,
      login_hint: this.account.email,
    });
  }

  private async apiCall<T>(fn: () => Promise<T>): Promise<T> {
    try {
      let result = await fn();
      GoogleService.service.clearProblem(this.account);
      return result;
    } catch (error) {
      GoogleService.service.setProblem(this.account, error.message);
      this.account.tx.segment.error("Google service error", { error });
      throw error;
    }
  }

  public async getAccountInfo(): Promise<people_v1.Schema$Person> {
    return getAccountInfo(this.client);
  }

  public async getThread(
    threadId: string,
  ): Promise<gmail_v1.Schema$Thread | null> {
    let api = google.gmail({
      version: "v1",
      auth: this.client,
    });

    return this.apiCall(async () => {
      try {
        let { data: thread } = await api.users.threads.get({
          userId: "me",
          id: threadId,
        });

        return thread;
      } catch (e) {
        if (e instanceof GaxiosError && e.response?.status == 404) {
          return null;
        }
        throw e;
      }
    });
  }

  public async listThreads(query: string): Promise<gmail_v1.Schema$Thread[]> {
    let api = google.gmail({
      version: "v1",
      auth: this.client,
    });

    let threads: Promise<gmail_v1.Schema$Thread | null>[] = [];

    let pageToken: string | null | undefined = undefined;
    while (pageToken !== null) {
      let { data: response } = await this.apiCall(() =>
        api.users.threads.list({
          userId: "me",
          q: query,
          pageToken: pageToken!,
        }),
      );

      for (let thread of response.threads ?? []) {
        if (thread.id) {
          threads.push(this.getThread(thread.id));
        }
      }

      pageToken = response.nextPageToken ?? null;
    }

    let results = await Promise.all(threads);
    return results.filter(isNonNull);
  }

  public async getLabels(): Promise<GoogleAPILabel[]> {
    let api = google.gmail({
      version: "v1",
      auth: this.client,
    });

    let {
      data: { labels },
    } = await this.apiCall(() =>
      api.users.labels.list({
        userId: "me",
      }),
    );

    if (!labels) {
      return [];
    }

    return labels.filter(isLabel);
  }

  public async getFile(fileId: string): Promise<GoogleAPIFile | null> {
    let api = google.drive({
      version: "v3",
      auth: this.client,
    });

    return this.apiCall(async (): Promise<GoogleAPIFile | null> => {
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
        if (e instanceof GaxiosError && e.response?.status == 404) {
          return null;
        }

        throw e;
      }
    });
  }
}

const B64_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const GML_CHARSET = "BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz";

function* range(max: number): Iterable<number> {
  for (let i = 0; i < max; i++) {
    yield i;
  }
}

function* reversedRange(max: number): Iterable<number> {
  for (let i = max - 1; i >= 0; i--) {
    yield i;
  }
}

// https://arsenalrecon.com/2019/07/digging-deeper-into-gmail-urls-introducing-gmail-url-decoder/
export function decodeWebId(id: string): string {
  let result = modifyCharset(id, GML_CHARSET, B64_CHARSET);
  if (result.length % 4 != 0) {
    result += "=".repeat(4 - (result.length % 4));
  }
  return b64Decode(result);
}

export function encodeWebId(id: string): string {
  let data = b64Encode(id);
  let pos = data.indexOf("=");
  if (pos >= 0) {
    data = data.substring(0, pos);
  }

  return modifyCharset(data, B64_CHARSET, GML_CHARSET);
}

export function modifyCharset(
  id: string,
  sourceCharset: string,
  targetCharset: string,
): string {
  let charsetLength = targetCharset.length;

  let resultIndexes: number[] = [];
  for (let i of range(id.length)) {
    let offset = 0;

    for (let j of range(resultIndexes.length)) {
      let index = sourceCharset.length * resultIndexes[j] + offset;

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

    offset = sourceCharset.indexOf(id[i]);

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
    resultCharacters.push(targetCharset[idx]);
  }

  return resultCharacters.join("");
}
