import type { Knex } from "knex";

import type { TableRef, PluginContext } from "#server-utils";
import { relatedCache } from "#utils";
import type { ItemCache } from "#utils";

interface ItemRecord<Id> {
  id: Id;
}

interface UpdatableItem<Record> {
  onRecordUpdate(record: Record): Promise<void>;
}

type Item<Id, Record> = UpdatableItem<Record> & {
  id: Id;
};

type IdFor<R> = R extends ItemRecord<infer Id> ? Id : never;

interface OwnedItemRecord<Id> extends ItemRecord<Id> {
  ownerId: string;
}

interface OwnedItem<Id, Record, Owner> extends Item<Id, Record> {
  owner: Owner;
}

interface ItemOwner {
  readonly id: string;
  readonly context: PluginContext;
}

interface OwnerStore<Instance> {
  get(context: PluginContext, id: string): Promise<Instance | null>;
}

type ItemBuilder<Owner, Record, Instance> = (owner: Owner, record: Record) => Instance;
export function classBuilder<Owner, Record, Instance>(
  cls: new (owner: Owner, record: Record) => Instance,
): ItemBuilder<Owner, Record, Instance> {
  return (owner: Owner, record: Record) => new cls(owner, record);
}

abstract class BaseTable<
  Record extends ItemRecord<unknown>,
  Instance extends UpdatableItem<Record>,
> {
  public constructor(protected readonly tableName: string) {
  }

  protected abstract build(context: PluginContext, record: Record): Promise<Instance>;

  public table(context: PluginContext): Knex.QueryBuilder<Record, Record[]> {
    return context.table<Record>(this.tableName);
  }

  public tableRef(context: PluginContext): TableRef {
    return context.tableRef(this.tableName);
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

  public async insert(context: PluginContext, record: Record): Promise<Instance> {
    await context.table<Record>(this.tableName)
      // @ts-ignore
      .insert(record);

    return this.build(context, record);
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
  ): Promise<Instance | null> {
    let records = await context.table<Record>(this.tableName)
      .where("id", record.id)
      // @ts-ignore
      .update(record)
      .returning("*") as Record[];

    if (records.length != 1) {
      return null;
    }

    let instance = await this.build(context, records[0]);
    await instance.onRecordUpdate(records[0]);
    return instance;
  }

  public async delete(context: PluginContext, id: IdFor<Record>): Promise<void> {
    await context.table<Record>(this.tableName)
      .where("id", id)
      .delete();
  }
}

export class ItemsTable<
  Record extends ItemRecord<unknown>,
  Instance extends Item<IdFor<Record>, Record> & UpdatableItem<Record>,
> extends BaseTable<Record, Instance> {
  protected readonly cache: (context: PluginContext) => ItemCache<IdFor<Record>, Instance>;

  public constructor(
    private readonly builder: ItemBuilder<PluginContext, Record, Instance>,
    tableName: string,
  ) {
    super(tableName);

    this.cache = relatedCache(
      async (context: PluginContext, id: IdFor<Record>): Promise<Instance | null> => {
        let record = await context.table<Record>(this.tableName)
          .where("id", id)
          .first("*") as unknown as Record | null;

        if (!record) {
          return null;
        }

        return this.builder(context, record);
      },
    );
  }

  public async build(context: PluginContext, record: Record): Promise<Instance> {
    // @ts-ignore
    return this.cache(context).upsertItem(record.id, () => this.builder(context, record));
  }
}

export class OwnedItemsTable<
  Owner extends ItemOwner,
  Record extends OwnedItemRecord<unknown>,
  Instance extends OwnedItem<IdFor<Record>, Record, Owner>,
> extends BaseTable<Record, Instance> {
  private cache: (owner: Owner) => ItemCache<IdFor<Record>, Instance>;

  public constructor(
    private readonly ownerStore: OwnerStore<Owner>,
    private readonly builder: ItemBuilder<Owner, Record, Instance>,
    tableName: string,
  ) {
    super(tableName);

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

      return this.builder(owner, record);
    });
  }

  protected async build(context: PluginContext, record: Record): Promise<Instance> {
    let owner = await this.ownerStore.get(context, record.ownerId);
    if (!owner) {
      throw new Error("Unexpected.");
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache(owner).upsertItem(record.id, () => this.builder(owner, record));
  }
}
