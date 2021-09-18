import { promises as fs } from "fs";
import { URL } from "url";

import { JsonDecoder } from "ts.data.json";

import type { DatabaseConfig } from "#db";

export interface ServerConfig {
  rootUrl: URL;
  port: number;
  admin?: Admin;
  database: DatabaseConfig;
  services: Record<string, any>;
}

interface Admin {
  email: string;
  password: string;
}

interface ConfigFile {
  rootUrl: URL;
  port: number;
  admin?: Admin;
  database: Partial<DatabaseConfig>;
  services: Record<string, any>;
}

const DatabaseConfigDecoder = JsonDecoder.object<Partial<DatabaseConfig>>(
  {
    host: JsonDecoder.optional(JsonDecoder.string),
    port: JsonDecoder.optional(JsonDecoder.number),
    database: JsonDecoder.optional(JsonDecoder.string),
    username: JsonDecoder.optional(JsonDecoder.string),
    password: JsonDecoder.optional(JsonDecoder.string),
  },
  "DatabaseConfig",
);

const AdminDecoder = JsonDecoder.object<Admin>(
  {
    email: JsonDecoder.string,
    password: JsonDecoder.string,
  },
  "Admin",
);

const ConfigFileDecoder = JsonDecoder.object<ConfigFile>(
  {
    rootUrl: JsonDecoder.string.map((url: string): URL => {
      if (!url.endsWith("/")) {
        url += "/";
      }
      return new URL(url);
    }),
    port: JsonDecoder.number,
    admin: JsonDecoder.optional(AdminDecoder),
    database: JsonDecoder.failover({}, DatabaseConfigDecoder),
    services: JsonDecoder.failover(
      {},
      JsonDecoder.dictionary(JsonDecoder.succeed, "ServiceConfig"),
    ),
  },
  "ConfigFile",
);

export async function parseConfig(path: string): Promise<ServerConfig> {
  let data = JSON.parse(
    await fs.readFile(path, {
      encoding: "utf8",
    }),
  );

  let config = await ConfigFileDecoder.decodeToPromise(data);

  return {
    ...config,
    database: {
      host: config.database.host ?? "localhost",
      port: config.database.port ?? 5432,
      database: config.database.database ?? "allthethings",
      username: config.database.username ?? "allthethings",
      password: config.database.password ?? "allthethings",
    },
  };
}
