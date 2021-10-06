import type { URL } from "url";

import type { Awaitable, RelativeDateTime } from "../../utils";
import type { Service, ServiceTransaction, ServiceItem } from "./services";
import type { IdentifiedEntity, StoreBuilder } from "./store";
import { IdentifiedEntityImpl } from "./store";

interface ItemProvider {
  store: StoreBuilder<ServiceTransaction, any, BaseItem<any>>;

  createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<ServiceItem | null>;
}

interface ListProvider {
  store: StoreBuilder<ServiceTransaction, any, BaseList<any, any>>;
}

export abstract class BaseService implements Service {
  protected abstract readonly itemProviders: ItemProvider[];
  protected abstract readonly listProviders: ListProvider[];

  protected async update(tx: ServiceTransaction): Promise<void> {
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

  public async deleteItem(tx: ServiceTransaction, id: string): Promise<void> {
    for (let provider of this.itemProviders) {
      let item = await provider.store(tx).get(id);
      await item.delete();
    }
  }

  public async getServiceItem(
    tx: ServiceTransaction,
    id: string,
  ): Promise<ServiceItem> {
    for (let provider of this.itemProviders) {
      let item = await provider.store(tx).findOne({ id });
      if (item) {
        return item;
      }
    }

    throw new Error(`Unknown item: ${id}`);
  }

  public async createItemFromURL(
    tx: ServiceTransaction,
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
> extends IdentifiedEntityImpl<Entity, ServiceTransaction> {
  public async lists(): Promise<BaseList<any, any>[]> {
    return [];
  }

  public abstract items(): Promise<BaseItem<any>[]>;

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
> extends IdentifiedEntityImpl<Entity, ServiceTransaction> {
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
> extends IdentifiedEntityImpl<Entity, ServiceTransaction> {
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
