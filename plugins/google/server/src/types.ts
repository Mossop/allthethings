export interface GooglePluginConfig {
  clientId: string;
  clientSecret: string;
}

export interface FileFields {
  type: "file";
  accountId: string;
  fileId: string;
  name: string;
  description: string | null;
  mimeType: string;
  url: string | null;
}

export type GoogleFields = FileFields;
