import { promises as fs } from "fs";

import { JsonDecoder } from "ts.data.json";

export enum Protocol {
  Http = "http",
  Https = "https",
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ServerConfig {
  protocol: Protocol;
  hostname: string;
  port: number;
  admin?: Admin;
  database: DatabaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: Record<string, any>;
}

interface Admin {
  email: string;
  password: string;
}

interface ConfigFile {
  protocol?: Protocol;
  hostname: string;
  port: number;
  admin?: Admin;
  database?: Partial<DatabaseConfig>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: Record<string, any>;
}

const DatabaseConfigDecoder = JsonDecoder.object<Partial<DatabaseConfig>>({
  host: JsonDecoder.optional(JsonDecoder.string),
  port: JsonDecoder.optional(JsonDecoder.number),
  database: JsonDecoder.optional(JsonDecoder.string),
  username: JsonDecoder.optional(JsonDecoder.string),
  password: JsonDecoder.optional(JsonDecoder.string),
}, "DatabaseConfig");

const AdminDecoder = JsonDecoder.object<Admin>({
  email: JsonDecoder.string,
  password: JsonDecoder.string,
}, "Admin");

const ConfigFileDecoder = JsonDecoder.object<ConfigFile>({
  protocol: JsonDecoder.optional(JsonDecoder.enumeration<Protocol>(Protocol, "protocol")),
  hostname: JsonDecoder.string,
  port: JsonDecoder.number,
  admin: JsonDecoder.optional(AdminDecoder),
  database: JsonDecoder.optional(DatabaseConfigDecoder),
  plugins: JsonDecoder.optional(JsonDecoder.dictionary(JsonDecoder.succeed, "PluginConfig")),
}, "ConfigFile");

export async function parseConfig(path: string): Promise<ServerConfig> {
  let data = JSON.parse(await fs.readFile(path, {
    encoding: "utf8",
  }));

  let config = await ConfigFileDecoder.decodeToPromise(data);

  return {
    ...config,
    protocol: config.protocol ?? Protocol.Https,
    plugins: config.plugins ?? {},
    database: {
      host: "localhost",
      port: 5432,
      database: "allthethings",
      username: "allthethings",
      password: "allthethings",
      ...config.database ?? {},
    },
  };
}
