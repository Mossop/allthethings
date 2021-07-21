import type { URL } from "url";

import type { Duration } from "luxon";

import type { Awaitable } from "#utils";

import type { Service, ServiceTransaction, ServiceItem } from "./services";

export interface Listable<T> {
  list(): Promise<T[]>;
}

export type ItemStore<T> = Listable<T> & {
  get(id: string): Promise<T | null>;
  deleteOne(id: string): Promise<boolean>;
};

type SourceProvider<
  T,
  Tx extends ServiceTransaction = ServiceTransaction,
> = (tx: Tx) => T;

interface IItem extends ServiceItem {
  update(): Promise<void>;
  delete(): Promise<void>;
}

interface IList {
  update(): Promise<ServiceItem[]>;
  delete(): Promise<void>;
}

interface ItemProvider<Tx extends ServiceTransaction = ServiceTransaction> {
  getStore: SourceProvider<ItemStore<IItem>, Tx>;

  createItemFromURL(tx: Tx, userId: string, url: URL, isTask: boolean): Promise<ServiceItem | null>;
}

interface ListProvider<Tx extends ServiceTransaction = ServiceTransaction> {
  getStore: SourceProvider<Listable<IList>, Tx>;
}

export abstract class BaseService<
  Tx extends ServiceTransaction = ServiceTransaction,
> implements Service<Tx> {
  protected abstract readonly itemProviders: ItemProvider<Tx>[];
  protected abstract readonly listProviders: ListProvider<Tx>[];
  public abstract readonly resolvers: Record<string, unknown>;
  public abstract buildTransaction(tx: ServiceTransaction): Awaitable<Tx>;

  protected async update(tx: Tx): Promise<void> {
    let seenIds = new Set<string>();

    for (let provider of this.listProviders) {
      let lists = await provider.getStore(tx).list();
      for (let list of lists) {
        try {
          let seen = await list.update();
          for (let item of seen) {
            seenIds.add(item.id);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    for (let provider of this.itemProviders) {
      let items = await provider.getStore(tx).list();
      for (let item of items) {
        if (!seenIds.has(item.id)) {
          try {
            await item.update();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }

  public async deleteItem(tx: Tx, id: string): Promise<void> {
    for (let provider of this.itemProviders) {
      await provider.getStore(tx).deleteOne(id);
    }
  }

  public async getServiceItem(tx: Tx, id: string): Promise<ServiceItem> {
    for (let provider of this.itemProviders) {
      let item = await provider.getStore(tx).get(id);
      if (item) {
        return item;
      }
    }

    throw new Error(`Unknown item: ${id}`);
  }

  public async createItemFromURL(
    tx: Tx,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    for (let provider of this.itemProviders) {
      let newItem = await provider.createItemFromURL(tx, userId, url, isTask);
      if (newItem) {
        return newItem.id;
      }
    }

    return null;
  }
}

export abstract class Base<Tx extends ServiceTransaction = ServiceTransaction> {
  public constructor(
    public readonly tx: Tx,
  ) {
  }
}

export abstract class BaseAccount<
  Tx extends ServiceTransaction = ServiceTransaction,
> extends Base<Tx> {
  public async lists(): Promise<IList[]> {
    return [];
  }

  public abstract items(): Promise<IItem[]>;

  public async delete(): Promise<void> {
    let seenIds = new Set<string>();

    for (let list of await this.lists()) {
      let seen = await list.update();
      for (let item of seen) {
        seenIds.add(item.id);
      }
      await list.delete();
    }

    for (let item of await this.items()) {
      if (!seenIds.has(item.id)) {
        await item.update();
      }
      await item.delete();
    }
  }
}

export abstract class BaseList<
  SR,
  Tx extends ServiceTransaction = ServiceTransaction,
> extends Base<Tx> implements IList {
  public abstract get id(): string;

  protected abstract listItems(results?: SR): Promise<ServiceItem[]>;

  public abstract get name(): string;

  public get due(): Duration | null | undefined {
    return undefined;
  }

  public async url(): Promise<string | null | undefined> {
    return undefined;
  }

  public async update(results?: SR): Promise<ServiceItem[]> {
    let items = await this.listItems(results);
    await this.tx.updateList(this.id, {
      name: this.name,
      url: await this.url(),
      items: items.map((item: ServiceItem): string => item.id),
      due: this.due,
    });
    return items;
  }

  public async delete(): Promise<void> {
    await this.tx.deleteList(this.id);
  }
}

export abstract class BaseItem<
  Tx extends ServiceTransaction = ServiceTransaction,
> extends Base<Tx> implements IItem {
  public abstract get id(): string;
  public abstract fields(): Awaitable<unknown>;

  public async url(): Promise<string | null | undefined> {
    return undefined;
  }

  public async icon(): Promise<string | null | undefined> {
    return undefined;
  }

  public async update(): Promise<void> {
    return;
  }

  public async delete(): Promise<void> {
    await this.tx.disconnectItem(this.id, await this.url(), await this.icon());
  }
}
