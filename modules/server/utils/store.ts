import { customAlphabet } from "nanoid/async";

import type { Database, Query, Sql, Updates, WhereConditions } from "../../db";
import { insert, sql, update, upsert, where } from "../../db";
import { assert, memoized } from "../../utils";
import type { Transaction } from "./transaction";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const id = customAlphabet(ALPHABET, 28);

interface Refable {
  store: Store<any, any, any> | StoreBuilder<any, any, any>;
}

export function ref(...refs: (string | Refable)[]): Sql {
  return sql.ref(
    ...refs.map((ref: string | Refable): string => {
      return typeof ref == "string" ? ref : ref.store.table;
    }),
  );
}

export abstract class EntityImpl<Entity, Tx extends Transaction = Transaction> {
  public constructor(public readonly tx: Tx, public readonly entity: Entity) {}

  public get store(): Store<Tx, Entity, this> {
    // @ts-ignore
    return this.constructor.store(this.tx) as Store<Tx, Entity, this>;
  }

  protected get table(): string {
    return this.store.table;
  }

  protected get db(): Database {
    return this.tx.db;
  }

  public async update(fields: Partial<Entity>): Promise<void> {
    let hasUpdates = false;
    let updates: Partial<Entity> = {};

    for (let [k, v] of Object.entries(fields)) {
      if (k in this.entity && this.entity[k] !== v) {
        if (this.store.keys.includes(k)) {
          throw new Error("Cannot modify an entity's primary key.");
        }

        updates[k] = v;
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      return;
    }

    await this.store.update(
      updates,
      // @ts-ignore
      Object.fromEntries(
        this.store.keys.map((key: string): [string, unknown] => [
          key,
          this.entity[key],
        ]),
      ),
    );

    for (let [k, v] of Object.entries(updates)) {
      this.entity[k] = v;
    }
  }

  protected get where(): WhereConditions<Entity> {
    // @ts-ignore
    return Object.fromEntries(
      this.store.keys.map((key: string): [string, unknown] => [
        key,
        this.entity[key],
      ]),
    );
  }

  public async delete(): Promise<void> {
    await this.store.delete(this.where);
  }
}

interface ImplBuilder<Tx extends Transaction, Entity, Impl> {
  (tx: Tx, entity: Entity): Impl;
}

interface ImplConstructor<Tx extends Transaction, Entity, Impl> {
  new (tx: Tx, entity: Entity): Impl;
}

export interface IdentifiedEntity {
  readonly id: string;
}

export abstract class IdentifiedEntityImpl<
  Entity extends IdentifiedEntity,
  Tx extends Transaction = Transaction,
> extends EntityImpl<Entity, Tx> {
  public get id(): string {
    return this.entity.id;
  }
}

export class Store<Tx extends Transaction, Entity, Impl> {
  public constructor(
    public readonly tx: Tx,
    public readonly table: string,
    public readonly keys: string[],
    protected readonly builder: ImplBuilder<Tx, Entity, Impl>,
  ) {}

  protected get db(): Database {
    return this.tx.db;
  }

  protected build(entity: Entity): Impl {
    return this.builder(this.tx, entity);
  }

  public async create(row: Partial<Entity>): Promise<Impl>;
  public async create(rows: Partial<Entity>[]): Promise<Impl[]>;
  public async create(
    rows: Partial<Entity> | Partial<Entity>[],
  ): Promise<Impl | Impl[]> {
    if (!Array.isArray(rows)) {
      let results = await this.create([rows]);
      return results[0];
    }

    if (rows.length == 0) {
      return [];
    }

    return this.tx.segment.inSegment("Store.create", async () => {
      let results = await this.db.query<Entity>(
        sql`${insert(this.table, rows)} RETURNING *`,
      );
      return results.map((entity: Entity): Impl => this.build(entity));
    });
  }

  public async get(id: string): Promise<Impl> {
    return this.tx.segment.inSegment("Store.get", async () => {
      let entity = await this.db.first<Entity>(
        sql`SELECT * FROM ${sql.ref(this.table)} WHERE "id" = ${id}`,
      );
      return this.build(assert(entity));
    });
  }

  public async list(query: Query): Promise<Impl[]> {
    return this.tx.segment.inSegment("Store.list", async () => {
      let entities = await this.db.query<Entity>(query);

      return entities.map((entity: Entity): Impl => this.build(entity));
    });
  }

  public async find(params?: WhereConditions<Entity>): Promise<Impl[]> {
    return this.tx.segment.inSegment("Store.find", async () => {
      let entities = await this.db.query<Entity>(
        params
          ? sql`SELECT * FROM ${sql.ref(this.table)} WHERE ${where(params)}`
          : sql`SELECT * FROM ${sql.ref(this.table)}`,
      );

      return entities.map((entity: Entity): Impl => this.build(entity));
    });
  }

  public async findOne(params: WhereConditions<Entity>): Promise<Impl | null> {
    return this.tx.segment.inSegment("Store.findOne", async () => {
      let entity = await this.db.first<Entity>(
        sql`SELECT * FROM ${sql.ref(this.table)} WHERE ${where(
          params,
        )} LIMIT 1`,
      );

      return entity ? this.build(entity) : null;
    });
  }

  public async upsert(values: Partial<Entity>[]): Promise<void> {
    if (values.length == 0) {
      return;
    }

    return this.tx.segment.inSegment("Store.upsert", () =>
      this.db.update(upsert(this.table, values, this.keys)),
    );
  }

  public update(
    values: Updates<Entity>,
    conditions?: WhereConditions<Entity>,
  ): Promise<void> {
    return this.tx.segment.inSegment("Store.update", async () => {
      await this.db.update(update(this.table, values, conditions));
    });
  }

  public async count(params: WhereConditions<Entity>): Promise<number> {
    return this.tx.segment.inSegment("Store.count", async () => {
      return this.db.value<number>(
        sql`SELECT COUNT(*)::integer FROM ${sql.ref(this.table)} WHERE ${where(
          params,
        )}`,
      );
    });
  }

  public async delete(params: WhereConditions<Entity>): Promise<void> {
    return this.tx.segment.inSegment("Store.delete", async () => {
      await this.db.update(
        sql`DELETE FROM ${sql.ref(this.table)} WHERE ${where(params)}`,
      );
    });
  }
}

export interface StoreBuilder<Tx extends Transaction, Entity, Impl> {
  readonly table: string;

  (tx: Tx): Store<Tx, Entity, Impl>;
}

type Keys<T> = keyof T & string;
export function storeBuilder<Tx extends Transaction, Entity, Impl>(
  impl: ImplConstructor<Tx, Entity, Impl>,
  table: string,
  key?: Keys<Entity> | Keys<Entity>[],
): StoreBuilder<Tx, Entity, Impl> {
  let keys: string[];
  if (key === undefined) {
    keys = ["id"];
  } else if (Array.isArray(key)) {
    keys = key;
  } else {
    keys = [key];
  }

  let builder = memoized(
    (tx: Tx) =>
      new Store(
        tx,
        table,
        keys,
        (tx: Tx, entity: Entity): Impl => new impl(tx, entity),
      ),
  ) as StoreBuilder<Tx, Entity, Impl>;

  // @ts-ignore
  builder.table = table;

  return builder;
}

export function storeImplBuilder<
  Tx extends Transaction,
  Entity,
  Impl extends EntityImpl<Entity, Tx>,
>(
  build: ImplBuilder<Tx, Entity, Impl>,
  table: string,
  key?: Keys<Entity> | Keys<Entity>[],
): StoreBuilder<Tx, Entity, Impl> {
  let keys: string[];
  if (key === undefined) {
    keys = ["id"];
  } else if (Array.isArray(key)) {
    keys = key;
  } else {
    keys = [key];
  }

  let builder = memoized(
    (tx: Tx) => new Store(tx, table, keys, build),
  ) as StoreBuilder<Tx, Entity, Impl>;

  // @ts-ignore
  builder.table = table;

  return builder;
}
