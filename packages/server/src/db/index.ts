import type { ServerConfig } from "../config";
import { DatabaseConnection } from "./connection";

export * from "./implementations";
export { AppDataSources } from "./datasources";

export async function createDbConnection(config: ServerConfig): Promise<DatabaseConnection> {
  return DatabaseConnection.connect(config.database);
}
