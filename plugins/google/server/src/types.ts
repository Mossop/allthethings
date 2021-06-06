import type { GoogleFileRecord, GoogleThreadRecord } from "./db/types";

export interface GooglePluginConfig {
  clientId: string;
  clientSecret: string;
}

export type FileFields = GoogleFileRecord & {
  type: "file";
};

export type ThreadFields = GoogleThreadRecord & {
  type: "thread";
  labels: string[];
};

export type GoogleFields = FileFields | ThreadFields;
