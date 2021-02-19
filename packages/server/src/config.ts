import { promises as fs } from "fs";

import { JsonDecoder } from "ts.data.json";

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ServerConfig {
  port: number;
  database: DatabaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: Record<string, any>;
}

interface ConfigFile {
  port: number;
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

const ConfigFileDecoder = JsonDecoder.object<ConfigFile>({
  port: JsonDecoder.number,
  database: JsonDecoder.optional(DatabaseConfigDecoder),
  plugins: JsonDecoder.optional(JsonDecoder.dictionary(JsonDecoder.succeed, "PluginConfig")),
}, "ConfigFile");

export async function parseConfig(path: string): Promise<ServerConfig> {
  let data = JSON.parse(await fs.readFile(path, {
    encoding: "utf8",
  }));

  let config = await ConfigFileDecoder.decodePromise(data);

  return {
    ...config,
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
