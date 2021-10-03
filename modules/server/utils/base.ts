import type { URL } from "url";

import type { Awaitable, RelativeDateTime } from "../../utils";
import type { Service, ServiceTransaction, ServiceItem } from "./services";
import type { IdentifiedEntity, StoreBuilder } from "./store";
import { IdentifiedEntityImpl } from "./store";

interface ItemProvider<Tx extends ServiceTransaction = ServiceTransaction> {
  store: StoreBuilder<Tx, any, BaseItem<any, Tx>>;

  createItemFromURL(
    tx: Tx,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<ServiceItem | null>;
}

interface ListProvider<Tx extends ServiceTransaction = ServiceTransaction> {
  store: StoreBuilder<Tx, any, BaseList<any, any, Tx>>;
}

export abstract class BaseService<
  Tx extends ServiceTransaction = ServiceTransaction,
> implements Service<Tx>
{
  protected abstract readonly itemProviders: ItemProvider<Tx>[];
  protected abstract readonly listProviders: ListProvider<Tx>[];
  public abstract buildTransaction(tx: ServiceTransaction): Awaitable<Tx>;

  public get resolvers(): Record<string, unknown> {
    return {};
  }

  protected async update(tx: Tx): Promise<void> {
    let seenIds = new Set<string>();

    for (let provider of this.listProviders) {
      let lists = await provider.store(tx).find();
      for (let list of lists) {
        try {
          let seen = await list.updateList();
          for (let item of seen) {
            seenIds.add(item.id);
          }
        } catch (error) {
          tx.segment.error("Error updating lists", { error });
        }
      }
    }

    for (let provider of this.itemProviders) {
      let items = await provider.store(tx).find();
      for (let item of items) {
        if (!seenIds.has(item.id)) {
          try {
            await item.updateItem();
          } catch (error) {
            tx.segment.error("Error updating items", { error });
          }
        }
      }
    }
  }

  public async deleteItem(tx: Tx, id: string): Promise<void> {
    for (let provider of this.itemProviders) {
      let item = await provider.store(tx).get(id);
      await item.delete();
    }
  }

  public async getServiceItem(tx: Tx, id: string): Promise<ServiceItem> {
    for (let provider of this.itemProviders) {
      let item = await provider.store(tx).findOne({ id });
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

export abstract class BaseAccount<
  Entity extends IdentifiedEntity,
  Tx extends ServiceTransaction = ServiceTransaction,
> extends IdentifiedEntityImpl<Entity, Tx> {
  public async lists(): Promise<BaseList<any, any, Tx>[]> {
    return [];
  }

  public abstract items(): Promise<BaseItem<any, Tx>[]>;

  public override async delete(): Promise<void> {
    let seenIds = new Set<string>();

    for (let list of await this.lists()) {
      let seen = await list.updateList();
      for (let item of seen) {
        seenIds.add(item.id);
      }
      await list.delete();
    }

    for (let item of await this.items()) {
      if (!seenIds.has(item.id)) {
        await item.updateItem();
      }
      await item.delete();
    }

    await super.delete();
  }
}

export abstract class BaseList<
  Entity extends IdentifiedEntity,
  SR,
  Tx extends ServiceTransaction = ServiceTransaction,
> extends IdentifiedEntityImpl<Entity, Tx> {
  protected abstract listItems(results?: SR): Promise<ServiceItem[]>;

  public abstract get name(): string;

  public get dueOffset(): RelativeDateTime | null | undefined {
    return undefined;
  }

  public async url(): Promise<string | null | undefined> {
    return undefined;
  }

  public async updateList(results?: SR): Promise<ServiceItem[]> {
    return this.tx.segment.inSegment("Update List", async () => {
      let items = await this.listItems(results);
      await this.tx.updateList(this.id, {
        name: this.name,
        url: await this.url(),
        items: items.map((item: ServiceItem): string => item.id),
        due: this.dueOffset,
      });
      return items;
    });
  }

  public override async delete(): Promise<void> {
    await this.tx.deleteList(this.id);
  }
}

export abstract class BaseItem<
  Entity extends IdentifiedEntity,
  Tx extends ServiceTransaction = ServiceTransaction,
> extends IdentifiedEntityImpl<Entity, Tx> {
  public abstract fields(): Awaitable<unknown>;

  public async url(): Promise<string | null | undefined> {
    return undefined;
  }

  public async icon(): Promise<string | null | undefined> {
    return undefined;
  }

  public async updateItem(): Promise<void> {
    return;
  }

  public override async delete(): Promise<void> {
    await this.tx.disconnectItem(this.id, await this.url(), await this.icon());
    await super.delete();
  }
}
