import type { ClientBase, QueryResult } from "pg";
import { Pool } from "pg";

import type { Events, Payload } from "#utils";
import { TypedEmitter } from "#utils";

import type { Sql } from "./sql";

export interface DatabaseConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  database: string;
}

export type Query = Sql | string;
function fromQuery(param: Query): {
  queryString: string;
  parameters: readonly unknown[];
} {
  let query: string;
  let parameters: readonly unknown[] = [];

  if (typeof param == "string") {
    query = param;
  } else {
    ({ query, parameters } = param);
  }

  return { queryString: query, parameters };
}

class QueryError extends Error {
  public constructor(
    public readonly databaseError: Error,
    public readonly query: string,
    public readonly parameters: readonly unknown[],
  ) {
    super(databaseError.message);
  }

  public get errorMeta(): Pick<QueryError, "query" | "parameters"> {
    return {
      query: this.query,
      parameters: this.parameters,
    };
  }
}

interface DbEventMap {
  query: [database: Database, query: QueryInstance];
  result: [database: Database, query: QueryInstance, result: QueryResult];
  error: [database: Database, query: QueryInstance, error: Error];
}

export interface QueryInstance {
  readonly id: number;
  readonly query: string;
  readonly parameters: readonly unknown[];
}

let queryUid = 0;

export abstract class Database extends TypedEmitter<DbEventMap> {
  protected constructor(protected readonly parent: Database | null = null) {
    super();

    this.on("error", () => {
      // If there are no registered error listeners then emitting an error event crashes node.
    });
  }

  protected override emit<E extends Events<DbEventMap>>(
    message: E,
    ...payload: Payload<DbEventMap, E>
  ): void {
    super.emit(message, ...payload);
    this.parent?.emit(message, ...payload);
  }

  protected abstract executeQuery<R>(
    query: string,
    params: readonly unknown[],
  ): Promise<QueryResult<R>>;

  public abstract inTransaction<R>(
    runner: (db: Database) => Promise<R>,
  ): Promise<R>;

  protected async performQuery<R>(
    query: string,
    params: readonly unknown[],
  ): Promise<QueryResult<R>> {
    let instance: QueryInstance = {
      id: queryUid++,
      query,
      parameters: params,
    };

    this.emit("query", this, instance);

    try {
      let result = await this.executeQuery<R>(query, params);
      this.emit("result", this, instance, result);
      return result;
    } catch (e) {
      this.emit("error", this, instance, e);
      throw new QueryError(e, query, params);
    }
  }

  public async update(query: Query): Promise<void> {
    let { queryString, parameters } = fromQuery(query);

    await this.performQuery(queryString, parameters);
  }

  public async query<R = Record<string, any>>(query: Query): Promise<R[]> {
    let { queryString, parameters } = fromQuery(query);

    let result = await this.performQuery<R>(queryString, parameters);
    return result.rows;
  }

  public async pluck<R = any>(query: Query): Promise<R[]> {
    let { queryString, parameters } = fromQuery(query);
    let result = await this.performQuery<Record<string, R>>(
      queryString,
      parameters,
    );

    if (result.fields.length == 0) {
      throw new Error("No columns returned");
    } else if (result.fields.length > 1) {
      throw new Error("Too many columns returned");
    }

    return result.rows.map(
      (row: Record<string, R>): R => row[result.fields[0].name],
    );
  }

  public async first<R = Record<string, any>>(query: Query): Promise<R | null> {
    let results = await this.query<R>(query);
    return results[0] ?? null;
  }

  public async value<R = any>(query: Query): Promise<R> {
    let { queryString, parameters } = fromQuery(query);
    let result = await this.performQuery<Record<string, R>>(
      queryString,
      parameters,
    );
    if (result.rows.length == 0) {
      throw new Error("No rows returned");
    } else if (result.rows.length > 1) {
      throw new Error("Too many rows returned");
    }

    if (result.fields.length == 0) {
      throw new Error("No columns returned");
    } else if (result.fields.length > 1) {
      throw new Error("Too many columns returned");
    }

    return result.rows[0][result.fields[0].name];
  }
}

class Client extends Database {
  public constructor(private readonly client: ClientBase) {
    super();
  }

  protected executeQuery<R>(
    query: string,
    params: unknown[],
  ): Promise<QueryResult<R>> {
    return this.client.query(query, params);
  }

  public async inTransaction<R>(
    runner: (db: Database) => Promise<R>,
  ): Promise<R> {
    return runner(new Client(this.client));
  }
}

export class Connection extends Database {
  public constructor(private readonly pool: Pool) {
    super();
  }

  protected executeQuery<R>(
    query: string,
    params: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query(query, params);
  }

  public async inTransaction<R>(
    runner: (db: Database) => Promise<R>,
  ): Promise<R> {
    let client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      let result = await runner(new Client(client));

      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");

      throw e;
    } finally {
      client.release();
    }
  }

  public async disconnect(): Promise<void> {
    return this.pool.end();
  }
}

export async function connect({
  username,
  ...config
}: DatabaseConfig): Promise<Connection> {
  let pool = new Pool({
    ...config,
    user: username,
  });

  return new Connection(pool);
}
