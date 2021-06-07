import type { ItemCache } from "@allthethings/utils";
import { relatedCache } from "@allthethings/utils";
import type { Knex } from "knex";

import type { TableRef } from "./db";
import type { PluginContext } from "./types";

interface ItemRecord<Id> {
  id: Id;
}

interface Item<Id> {
  id: Id;
}

type IdFor<R> = R extends ItemRecord<infer Id> ? Id : never;

interface OwnedItemRecord<Id> extends ItemRecord<Id> {
  ownerId: string;
}

interface OwnedItem<Id, Owner> extends Item<Id> {
  owner: Owner;
}

interface ItemOwner {
  readonly id: string;
  readonly context: PluginContext;
}

interface OwnerStore<Instance> {
  get(context: PluginContext, id: string): Promise<Instance | null>;
}

type ItemBuilder<Owner, Record, Instance> = new (owner: Owner, record: Record) => Instance;

export class ItemsTable<Record extends ItemRecord<unknown>, Instance extends Item<IdFor<Record>>> {
  protected readonly cache: (context: PluginContext) => ItemCache<IdFor<Record>, Instance>;

  public constructor(
    private readonly builder: ItemBuilder<PluginContext, Record, Instance>,
    private readonly tableName: string,
  ) {
    this.cache = relatedCache(
      async (context: PluginContext, id: IdFor<Record>): Promise<Instance | null> => {
        let record = await context.table<Record>(this.tableName)
          .where("id", id)
          .first("*") as unknown as Record | null;

        if (!record) {
          return null;
        }

        return new this.builder(context, record);
      },
    );
  }

  public table(context: PluginContext): Knex.QueryBuilder<Record, Record[]> {
    return context.table<Record>(this.tableName);
  }

  public build(context: PluginContext, record: Record): Instance {
    // @ts-ignore
    return this.cache(context).upsertItem(record.id, () => new this.builder(context, record));
  }

  public async get(context: PluginContext, id: IdFor<Record>): Promise<Instance | null> {
    // @ts-ignore
    return this.first(context, { id });
  }

  public async list(context: PluginContext, params: Partial<Record> = {}): Promise<Instance[]> {
    let records = await context.table<Record>(this.tableName)
      .where(params) as Record[];

    return records.map((record: Record): Instance => this.build(context, record));
  }

  public async insert(context: PluginContext, record: Record): Promise<Instance> {
    await context.table<Record>(this.tableName)
      // @ts-ignore
      .insert(record);

    return this.cache(context).addItem(new this.builder(context, record));
  }

  public async first(
    context: PluginContext,
    params: Partial<Record> = {},
  ): Promise<Instance | null> {
    let record = await context.table<Record>(this.tableName)
      .where(params)
      .first("*") as Record | null;

    if (!record) {
      return null;
    }

    return this.build(context, record);
  }

  public async update(
    context: PluginContext,
    record: Partial<Omit<Record, "id">> & ItemRecord<IdFor<Record>>,
  ): Promise<void> {
    await context.table<Record>(this.tableName)
      .where("id", record.id)
      // @ts-ignore
      .update(record);
  }

  public async delete(context: PluginContext, params: Partial<Record>): Promise<void> {
    await context.table<Record>(this.tableName)
      .where(params)
      .delete();
  }
}

export class OwnedItemsTable<
  Owner extends ItemOwner,
  Record extends OwnedItemRecord<unknown>,
  Instance extends OwnedItem<IdFor<Record>, Owner>,
> {
  private cache: (owner: Owner) => ItemCache<IdFor<Record>, Instance>;

  public constructor(
    private readonly ownerStore: OwnerStore<Owner>,
    private readonly builder: ItemBuilder<Owner, Record, Instance>,
    private readonly tableName: string,
  ) {
    this.cache = relatedCache(async (owner: Owner, id: IdFor<Record>): Promise<Instance | null> => {
      let record = await owner.context.table<Record>(this.tableName)
        // @ts-ignore
        .where({
          id,
          ownerId: owner.id,
        })
        .first("*") as unknown as Record | null;

      if (!record) {
        return null;
      }

      return new this.builder(owner, record);
    });
  }

  public table(context: PluginContext): Knex.QueryBuilder<Record, Record[]> {
    return context.table<Record>(this.tableName);
  }

  public tableRef(context: PluginContext): TableRef {
    return context.tableRef(this.tableName);
  }

  private async build(context: PluginContext, record: Record): Promise<Instance> {
    let owner = await this.ownerStore.get(context, record.ownerId);
    if (!owner) {
      throw new Error("Unexpected.");
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache(owner).upsertItem(record.id, () => new this.builder(owner, record));
  }

  public async get(context: PluginContext, id: IdFor<Record>): Promise<Instance | null> {
    // @ts-ignore
    return this.first(context, { id });
  }

  public async list(context: PluginContext, params: Partial<Record> = {}): Promise<Instance[]> {
    let records = await context.table<Record>(this.tableName)
      .where(params) as Record[];

    return Promise.all(
      records.map((record: Record): Promise<Instance> => this.build(context, record)),
    );
  }

  public async first(
    context: PluginContext,
    params: Partial<Record> = {},
  ): Promise<Instance | null> {
    let record = await context.table<Record>(this.tableName)
      .where(params)
      .first("*") as Record | null;

    if (!record) {
      return null;
    }

    return this.build(context, record);
  }

  public async insert(owner: Owner, record: Omit<Record, "owner">): Promise<Instance> {
    // @ts-ignore
    let fullRecord: Record = {
      ...record,
      ownerId: owner.id,
    };

    await owner.context.table<Record>(this.tableName)
      // @ts-ignore
      .insert(fullRecord);

    return this.cache(owner).addItem(new this.builder(owner, fullRecord));
  }

  public async update(
    instance: Instance,
    record: Partial<Omit<Record, "id" | "owner">>,
  ): Promise<void> {
    // @ts-ignore
    let fullRecord: Record = {
      ...record,
      id: instance.id,
      ownerId: instance.owner.id,
    };

    await instance.owner.context.table<Record>(this.tableName)
      .where("id", instance.id)
      // @ts-ignore
      .update(fullRecord);
  }

  public async delete(context: PluginContext, params: Partial<Record>): Promise<void> {
    await context.table<Record>(this.tableName)
      .where(params)
      .delete();
  }
}
