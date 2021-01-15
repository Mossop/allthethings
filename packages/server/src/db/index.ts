import { MongoClient } from "mongodb";

export * from "./implementations";
export { dataSources } from "./datasources";
export type { DataSources } from "./datasources";

async function getSchemaVersion(client: MongoClient): Promise<number> {
  let doc = await client.db().collection("schema").findOne({
    key: "version",
  });

  if (doc) {
    let value = parseInt(doc.value);
    return Number.isNaN(value) ? 0 : value;
  }

  return 0;
}

async function setSchemaVersion(client: MongoClient, version: number): Promise<void> {
  await client.db().collection("schema").findOneAndReplace({
    key: "version",
  }, {
    key: "version",
    value: version,
  }, {
    upsert: true,
  });
}

export async function connect(): Promise<MongoClient> {
  let client = await MongoClient.connect("mongodb://localhost:27017/allthethings", {
    useUnifiedTopology: true,
  });

  let schemaVersion = await getSchemaVersion(client);
  if (schemaVersion < 1) {
    await client.db().collection("users").createIndex({ email: 1 }, { unique: true });
    await client.db().collection("contexts").createIndex({ user: 1, name: 1 }, { unique: true });
    await setSchemaVersion(client, 1);
  }

  return client;
}
