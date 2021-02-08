import { upsert } from "@allthethings/utils";

import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";

export type DescriptorsFor<C> = {
  [K in keyof C]: TypedPropertyDescriptor<C[K]>;
};

export interface AppContext {
  readonly db: DatabaseConnection;
}

export async function buildContext(
  config: ServerConfig,
  dbConnection: DatabaseConnection,
): Promise<DescriptorsFor<AppContext>> {
  let dbMap = new WeakMap<AppContext, DatabaseConnection>();

  return {
    db: {
      get(this: AppContext): DatabaseConnection {
        return upsert(dbMap, this, () => dbConnection.clone());
      },
    },
  };
}
