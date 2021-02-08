import Knex from "knex";
import { types } from "pg";

import type { DatabaseConfig } from "../config";
import DbMigrations from "./migrations";

types.setTypeParser(types.builtins.INT8, BigInt);

export class DatabaseConnection {
  private _transaction: Knex.Transaction | null = null;

  private constructor(
    private readonly _baseKnex: Knex,
  ) {
  }

  public get knex(): Knex {
    return this._transaction ?? this._baseKnex;
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

  public async startTransaction(): Promise<void> {
    if (this.isInTransaction) {
      throw new Error("Already in a transaction.");
    }

    this._transaction = await this._baseKnex.transaction();
  }

  public async commitTransaction(): Promise<void> {
    if (!this._transaction) {
      throw new Error("There is no current transaction.");
    }

    try {
      await this._transaction.commit();
    } catch (e) {
      console.error(e);
    }
    this._transaction = null;
  }

  public async rollbackTransaction(): Promise<void> {
    if (!this._transaction) {
      throw new Error("There is no current transaction.");
    }

    try {
      await this._transaction.rollback();
    } catch (e) {
      // This expected to throw.
    }
    this._transaction = null;
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
