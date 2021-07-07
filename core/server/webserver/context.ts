import { upsert } from "#utils";
import type Koa from "koa";

import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";

export type DescriptorsFor<C> = {
  [K in keyof C]: TypedPropertyDescriptor<C[K]>;
};

interface ExtraContext {
  readonly db: DatabaseConnection;
}

export type WebServerContext = ExtraContext & Koa.DefaultContext;

export async function buildWebServerContext(
  config: ServerConfig,
  dbConnection: DatabaseConnection,
): Promise<DescriptorsFor<ExtraContext>> {
  let dbMap = new WeakMap<ExtraContext, DatabaseConnection>();

  return {
    db: {
      get(this: WebServerContext): DatabaseConnection {
        return upsert(dbMap, this, () => dbConnection.clone());
      },
    },
  };
}
