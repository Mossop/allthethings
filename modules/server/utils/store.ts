import type { Knex } from "knex";

import type { Awaitable } from "#utils";
import { upsert, waitFor } from "#utils";

import { id as newId } from "./db";
import type { TableRef, Transaction } from "./transaction";

export interface Identified {
  readonly id: string;
}

export type Identifiable<T> = T & Identified;

export interface RecordHolder<Record> {
  readonly updateRecord: (record: Record) => void;
}

export type ImplBuilder<
  Record,
  Impl extends RecordHolder<Record>,
  Tx extends Transaction,
> = (new (tx: Tx, record: Record) => Impl) | ((tx: Tx, record: Record) => Impl);

function isConstructor<
  Record,
  Impl extends RecordHolder<Record>,
  Tx extends Transaction,
>(builder: ImplBuilder<Record, Impl, Tx>): builder is (new (tx: Tx, record: Record) => Impl) {
  return !!builder.prototype;
}

function buildImpl<
  Record,
  Impl extends RecordHolder<Record>,
  Tx extends Transaction,
>(builder: ImplBuilder<Record, Impl, Tx>, tx: Tx, record: Record): Impl {
  if (isConstructor(builder)) {
    return new builder(tx, record);
  } else {
    return builder(tx, record);
  }
}

type Mapper<Tx extends Transaction, A, B> = (tx: Tx, record: A) => B;

type TxInit<R, Tx extends Transaction> = (tx: Tx) => R;

type RecordFilter = (builder: Knex.QueryBuilder, knex: Knex) => Knex.QueryBuilder;

export class BaseRecordHolder<Record, Tx extends Transaction> implements RecordHolder<Record> {
  public constructor(
    protected readonly tx: Tx,
    protected record: Record,
  ) {
  }

  public updateRecord(record: Record): void {
    this.record = record;
  }
}

export class BaseStore<Tx extends Transaction, Record, Repr, Insert = Record> {
  public constructor(
    protected readonly tx: Tx,
    protected readonly tableName: string,
    protected readonly mapper: Mapper<Tx, Record, Repr>,
    protected readonly recordsFilter: RecordFilter = (b: Knex.QueryBuilder) => b,
  ) {
  }

  protected build(record: Awaitable<Record>): Promise<Repr>;
  protected build(record: Awaitable<Record | null | undefined>): Promise<Repr | null>;
  protected build(records: Awaitable<Record[]>): Promise<Repr[]>;
  protected async build(
    record: Awaitable<null | undefined | Record | Record[]>,
  ): Promise<null | Repr | Repr[]> {
    record = await waitFor(record);
    if (record === null || record === undefined) {
      return null;
    }

    if (Array.isArray(record)) {
      return record.map((record: Record): Repr => this.mapper(this.tx, record));
    }

    return this.mapper(this.tx, record);
  }

  public table(): Knex.QueryBuilder {
    return this.tx.knex.table<Record, Record[]>(this.tableRef());
  }

  public records(): Knex.QueryBuilder {
    return this.recordsFilter(this.table(), this.tx.knex);
  }

  public tableRef(name?: string): TableRef {
    return this.tx.tableRef(this.tableName, name);
  }

  public async first(params: Partial<Record>): Promise<Repr | null> {
    return this.build(this.records()
      .where(params)
      .first(`${this.tableName}.*`) as Promise<Record | undefined>);
  }

  public async insert(records: Insert[]): Promise<Repr[]> {
    return this.build(this.table()
      .insert(records)
      .returning("*"));
  }

  public async list(params: Partial<Record> = {}): Promise<Repr[]> {
    return this.build(this.records()
      .where(params)
      .select(`${this.tableName}.*`) as Promise<Record[]>);
  }

  public async update(
    params: Partial<Insert>,
    where: Partial<Record> = {},
  ): Promise<Repr[]> {
    return this.build(this.table()
      .where(where)
      .update(params).returning("*") as Promise<Record[]>);
  }

  public async delete(params: Partial<Record> = {}): Promise<Record[]> {
    return this.table()
      .where(params)
      .delete()
      .returning("*") as Promise<Record[]>;
  }
}

type JoinInit<Record> = <
  Tx extends Transaction,
  SourceKey extends string & keyof Record,
  TargetKey extends string & keyof Record,
>(tx: Tx,
  tableName: string,
  sourceKey: SourceKey,
  targetKey: TargetKey,
  recordsFilter?: RecordFilter,
) => Join<Record, Tx, SourceKey, TargetKey>;

export class Join<
  Record,
  Tx extends Transaction,
  SourceKey extends string & keyof Record,
  TargetKey extends string & keyof Record,
> extends BaseStore<Tx, Record, Record> {
  public constructor(
    tx: Tx,
    tableName: string,
    protected readonly sourceKey: SourceKey,
    protected readonly targetKey: TargetKey,
    recordsFilter?: RecordFilter,
  ) {
    super(tx, tableName, (tx: Tx, rec: Record): Record => rec, recordsFilter);
  }

  public static build<Record>(): JoinInit<Record> {
    return <
      Tx extends Transaction,
      SourceKey extends string & keyof Record,
      TargetKey extends string & keyof Record,
    >(
      tx: Tx,
      tableName: string,
      sourceKey: SourceKey,
      targetKey: TargetKey,
      recordsFilter?: RecordFilter,
    ) => new Join(tx, tableName, sourceKey, targetKey, recordsFilter);
  }

  public async getItems(id: Record[SourceKey]): Promise<Record[]> {
    return this.records()
      .where(this.sourceKey, id)
      .select(`${this.tableName}.*`) as Promise<Record[]>;
  }

  public async getItemIds(id: Record[SourceKey]): Promise<Record[TargetKey][]> {
    return this.records()
      .where(this.sourceKey, id)
      .pluck(this.targetKey);
  }

  public async setItems(
    id: Record[SourceKey],
    items: Record[TargetKey][],
    shared: Omit<Record, SourceKey | TargetKey>,
  ): Promise<void> {
    await this.table()
      .where({
        ...shared,
        [this.sourceKey]: id,
      })
      .whereNotIn(this.targetKey, items)
      .delete();

    await this.addItems(id, items, shared);
  }

  public async addItems(
    id: Record[SourceKey],
    items: Record[TargetKey][],
    shared: Omit<Record, SourceKey | TargetKey>,
  ): Promise<void> {
    if (items.length == 0) {
      return;
    }

    let records = items.map((item: Record[TargetKey]): unknown => ({
      ...shared,
      [this.sourceKey]: id,
      [this.targetKey]: item,
    }));

    await this.table().insert(records).onConflict([this.sourceKey, this.targetKey]).merge();
  }

  public async deleteItems(
    id: Record[SourceKey],
    items: Record[TargetKey][],
  ): Promise<void> {
    await this.table()
      .where(this.sourceKey, id)
      .whereIn(this.targetKey, items)
      .delete();
  }
}

export class Store<
  Record extends Identified = Identified,
  Impl extends RecordHolder<Record> = RecordHolder<Record>,
  Insert extends Identified = Record,
  Tx extends Transaction = Transaction,
> extends BaseStore<Tx, Record, Impl, Insert> {
  protected cache: Map<string, Impl> = new Map();

  public constructor(
    tx: Tx,
    tableName: string,
    builder: ImplBuilder<Record, Impl, Tx>,
    recordsFilter?: RecordFilter,
  ) {
    super(tx, tableName, (tx: Tx, record: Record): Impl => {
      let existing = this.cache.get(record.id);
      if (existing) {
        existing.updateRecord(record);
      } else {
        existing = buildImpl(builder, tx, record);
        this.cache.set(record.id, existing);
      }

      return existing;
    }, recordsFilter);
  }

  public withInsert<I extends Identified>(): Store<Record, Impl, I, Tx> {
    // @ts-ignore
    return this;
  }

  public async get(id: string): Promise<Impl | null> {
    let existing = this.cache.get(id);
    if (existing) {
      return existing;
    }

    return this.first(
      // @ts-ignore
      { id },
    );
  }

  public async getAll(ids: string[]): Promise<Impl[]> {
    let found: Impl[] = [];
    let toGet: string[] = [];
    for (let id of ids) {
      let existing = this.cache.get(id);
      if (existing) {
        found.push(existing);
      } else {
        toGet.push(id);
      }
    }

    if (toGet.length) {
      return [
        ...found,
        ...await this.build(
          this.records()
            .whereIn("id", toGet)
            .select(`${this.tableName}.*`) as Promise<Record[]>,
        ),
      ];
    }

    return found;
  }

  public async insertOne(record: Omit<Insert, "id">, id?: string): Promise<Impl> {
    let results = await this.insert([
      // @ts-ignore
      {
        ...record,
        id: id ?? await newId(),
      },
    ]);

    if (results.length != 1) {
      throw new Error("Unexpected database failure.");
    }

    return results[0];
  }

  public async updateOne(id: string, params: Partial<Omit<Insert, "id">>): Promise<Impl | null> {
    // @ts-ignore
    let results = await this.update(params, { id });
    return results.length ? results[0] : null;
  }

  public async deleteOne(id: string): Promise<boolean> {
    // @ts-ignore
    let deleted = await this.delete({ id });
    return deleted.length == 1;
  }

  public override async delete(params: Partial<Record> = {}): Promise<Record[]> {
    let records = await super.delete(params);

    for (let record of records) {
      this.cache.delete(record.id);
    }

    return records;
  }
}

export function defineStoreBuilder<Tx extends Transaction, R>(build: TxInit<R, Tx>): TxInit<R, Tx> {
  let cache = new WeakMap<Tx, R>();

  return (tx: Tx): R => {
    return upsert(cache, tx, () => build(tx));
  };
}
