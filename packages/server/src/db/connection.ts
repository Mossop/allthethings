import Knex from "knex";

import type { DatabaseConfig } from "../config";
import DbMigrations from "./migrations";

export type TxnFn<C, R> = (dbConnection: C) => Promise<R>;
export type Named<F> = [name: string, transactionFn: F] | [transactionFn: F];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function named<F extends (...args: any[]) => any>(args: Named<F>): [string, F] {
  if (args.length == 2) {
    return args;
  }

  let fn = args[0];
  let name = fn.name;
  if (!name) {
    throw new Error("Must provide a transaction name.");
  }

  return [name, fn];
}

export class DatabaseConnection {
  public readonly knex: Knex;
  private inInnerTransaction = false;

  private constructor(
    private readonly _baseKnex: Knex,
    private _transaction?: Knex.Transaction,
  ) {
    if (_transaction) {
      this.knex = _transaction;
    } else {
      this.knex = _baseKnex.withUserParams({
        ..._baseKnex.userParams,
      });
    }
  }

  public clone(): DatabaseConnection {
    if (this.isInTransaction) {
      throw new Error("Cannot clone while in a transaction.");
    }

    return new DatabaseConnection(this._baseKnex);
  }

  public async migrate(): Promise<void> {
    if (this.isInTransaction) {
      throw new Error("Cannot migrate while in a transaction.");
    }

    let migrateConfig = {
      migrationSource: new DbMigrations(),
    };

    await this.knex.migrate.latest(migrateConfig);
  }

  public async rollback(all: boolean = false): Promise<void> {
    if (this.isInTransaction) {
      throw new Error("Cannot rollback while in a transaction.");
    }

    let migrateConfig = {
      migrationSource: new DbMigrations(),
    };

    await this.knex.migrate.rollback(migrateConfig, all);
  }

  public get isInTransaction(): boolean {
    return !!this._transaction;
  }

  public ensureTransaction<R>(...args: Named<TxnFn<DatabaseConnection, R>>): Promise<R> {
    let [name, transactionFn] = named(args);

    if (this.isInTransaction) {
      return transactionFn(this);
    }

    return this.inTransaction(name, transactionFn);
  }

  public inTransaction<R>(...args: Named<TxnFn<DatabaseConnection, R>>): Promise<R> {
    let [,transactionFn] = named(args);

    try {
      let base = this._transaction ?? this._baseKnex;
      return base.transaction(async (trx: Knex.Transaction): Promise<R> => {
        if (this.isInTransaction) {
          this.inInnerTransaction = true;
        }
        try {
          let result = await transactionFn(new DatabaseConnection(this._baseKnex, trx));

          this.inInnerTransaction = false;
          return result;
        } catch (e) {
          this.inInnerTransaction = false;
          throw e;
        }
      });
    } finally {
      this.inInnerTransaction = false;
    }
  }

  public get ref(): Knex.RefBuilder {
    // @ts-ignore
    return (...args: unknown[]) => this.knex.ref(...args);
  }

  public get raw(): Knex.RawBuilder {
    // @ts-ignore
    return (...args: unknown[]) => this.knex.raw(...args);
  }

  public destroy(): Promise<void> {
    if (this.isInTransaction) {
      throw new Error("Cannot destroy a transaction.");
    }

    return this.knex.destroy();
  }

  public static async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
    let schema = process.env.NODE_ENV == "test" ? `test${process.pid}` : undefined;
    let auth = `${config.username}:${config.password}`;
    let host = `${config.host}:${config.port}`;

    let knexConfig: Knex.Config = {
      client: "pg",
      asyncStackTraces: ["test", "development"].includes(process.env.NODE_ENV ?? ""),
      connection: `postgres://${auth}@${host}/${config.database}`,
      searchPath: schema ? [schema] : undefined,
    };

    if (schema) {
      knexConfig["userParams"] = {
        schema,
      };
    }

    let knex = Knex(knexConfig);

    return new DatabaseConnection(knex);
  }
}
