import { URL } from "url";

import formurlencoded from "form-urlencoded";
import fetch from "node-fetch";

import type { Conduit, PaginatedApiMethod } from "./types";

export * from "./types";

class ConduitError extends Error {
  public constructor(
    public readonly code: string,
    public readonly info: string,
  ) {
    super(`${code}: ${info}`);
  }
}

async function callApi(
  apiHost: URL,
  apiToken: string,
  method: string[],
  params: Record<string, unknown> = {},
): Promise<unknown> {
  let target = new URL(method.join("."), apiHost);
  let response = await fetch(target, {
    method: "POST",
    body: formurlencoded({
      "api.token": apiToken,
      ...params,
    }),
  });

  let json = await response.json();
  if (json.error_code) {
    throw new ConduitError(json.error_code, json.error_info);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return json.result;
}

function api(apiHost: URL, apiToken: string, method: string[]): unknown {
  return new Proxy(callApi.bind(null, apiHost, apiToken, method), {
    has(): boolean {
      return true;
    },

    set(): boolean {
      return false;
    },

    get(target: unknown, prop: string): unknown {
      return api(apiHost, apiToken, [...method, prop]);
    },
  });
}

export default function conduit(host: URL | string, apiToken: string): Conduit {
  if (!(host instanceof URL)) {
    host = new URL(host);
  }

  return api(new URL("api/", host), apiToken, []) as Conduit;
}

export async function requestAll<R, A>(method: PaginatedApiMethod<R, A>, args: A): Promise<R[]> {
  let results: R[] = [];

  let result = await method(args);
  results = result.data;
  while (result.cursor.after) {
    result = await method({
      ...args,
      after: result.cursor.after,
    });

    results = [...results, ...result.data];
  }

  return results;
}
