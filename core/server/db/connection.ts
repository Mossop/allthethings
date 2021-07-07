import type { Awaitable } from "#utils";
import { waitFor } from "#utils";
import type { Knex } from "knex";
import { knex } from "knex";
import { DateTime } from "luxon";
import { customAlphabet } from "nanoid/async";
import { types } from "pg";

import type { DatabaseConfig } from "../config";
import PluginManager from "../plugins";
import DbMigrations from "./migrations";

export function parseDate(val: string): DateTime {
  return DateTime.fromSQL(val).toUTC();
}

types.setTypeParser(types.builtins.INT8, BigInt);
types.setTypeParser(types.builtins.TIMESTAMPTZ, parseDate);

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const id = customAlphabet(ALPHABET, 28);

type Callback = () => Awaitable<void>;

export class DatabaseConnection {
  private _transaction: Knex.Transaction | null = null;
  private _commitListeners: Callback[];

  private constructor(
    private readonly _baseKnex: Knex,
  ) {
    this._commitListeners = [];
  }

  public onCommit(callback: Callback): void {
    if (!this._transaction) {
      throw new Error("There is no current transaction.");
    }

    this._commitListeners.push(callback);
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

    await this.knex.raw("CREATE SCHEMA IF NOT EXISTS ??", ["public"]);

    let migrateConfig = {
      tableName: "allthethings_migrations",
      migrationSource: DbMigrations,
    };

    await this.knex.migrate.latest(migrateConfig);

    await PluginManager.applyDbMigrations(this.knex);
  }

  public async rollback(all: boolean = false): Promise<void> {
    if (this.isInTransaction) {
      throw new Error("Cannot rollback while in a transaction.");
    }

    await PluginManager.rollbackDbMigrations(this.knex, all);
    await this.knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", ["public"]);
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

    for (let callback of this._commitListeners) {
      await waitFor(callback());
    }

    try {
      await this._transaction.commit();
    } catch (e) {
      console.error(e);
    }
    this._transaction = null;
  }

  public async rollbackTransaction(error?: Error): Promise<void> {
    if (!this._transaction) {
      throw new Error("There is no current transaction.");
    }

    if (error) {
      console.error("Rolling back transaction", error);
    } else {
      console.log("Rolling back transaction");
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

    return new DatabaseConnection(knex(knexConfig));
  }
}
