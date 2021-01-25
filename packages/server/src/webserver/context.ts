import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";

export type DescriptorsFor<C> = {
  [K in keyof C]: TypedPropertyDescriptor<C[K]>;
};

export interface AppContext {
  readonly db: DatabaseConnection;
  readonly inTransaction: <T>(fn: () => Promise<T>) => Promise<T>;
}

export async function buildContext(
  config: ServerConfig,
  dbConnection: DatabaseConnection,
): Promise<DescriptorsFor<AppContext>> {
  let dbMap = new WeakMap<AppContext, DatabaseConnection>();

  return {
    db: {
      get(this: AppContext): DatabaseConnection {
        let db = dbMap.get(this);
        if (!db) {
          return dbConnection;
        }
        return db;
      },
    },

    inTransaction: {
      get(this: AppContext) {
        return <T>(fn: () => Promise<T>): Promise<T> => {
          let current = this.db;
          return current.inTransaction("txn", (db: DatabaseConnection): Promise<T> => {
            dbMap.set(this, db);
            try {
              return fn();
            } finally {
              dbMap.set(this, current);
            }
          });
        };
      },
    },
  };
}
