import { URL, URLSearchParams } from "url";

import fetch from "node-fetch";

import type { Conduit } from "./types";

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
  let formData = new URLSearchParams();
  formData.set("api.token", apiToken);
  for (let [key, value] of Object.entries(params)) {
    formData.set(key, JSON.stringify(value));
  }

  let target = new URL(method.join("."), apiHost);
  let response = await fetch(target, {
    method: "POST",
    body: formData,
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
