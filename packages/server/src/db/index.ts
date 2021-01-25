import type { ServerConfig } from "../config";
import { DatabaseConnection } from "./connection";

export * from "./implementations";
export { dataSources } from "./datasources";
export type { AppDataSources } from "./datasources";

export async function createDbConnection(config: ServerConfig): Promise<DatabaseConnection> {
  let db = await DatabaseConnection.connect(config.database);
  await db.migrate();
  return db;
}
