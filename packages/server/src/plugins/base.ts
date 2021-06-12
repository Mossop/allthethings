import type { URL } from "url";

import type { Awaitable } from "@allthethings/utils";

import type { AuthedPluginContext, PluginContext, PluginItem, ServerPlugin } from "./types";

interface Store<T> {
  get(context: PluginContext, id: string): Promise<T | null>;
  list(context: PluginContext): Promise<T[]>;
  delete(context: PluginContext, id: string): Promise<void>;
}

interface IItem extends PluginItem {
  update(): Promise<void>;
  delete(): Promise<void>;
}

interface ISearch {
  update(): Promise<PluginItem[]>;
  delete(): Promise<void>;
}

interface ItemProvider {
  store: Store<IItem>;

  createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<PluginItem | null>;
}

interface SearchProvider {
  store: Store<ISearch>;
}

export abstract class BasePlugin implements ServerPlugin {
  protected readonly itemProviders: ItemProvider[] = [];
  protected readonly searchProviders: SearchProvider[] = [];

  protected async update(context: PluginContext): Promise<void> {
    let seenIds = new Set<string>();

    for (let provider of this.searchProviders) {
      let searches = await provider.store.list(context);
      for (let search of searches) {
        let seen = await search.update();
        for (let item of seen) {
          seenIds.add(item.id);
        }
      }
    }

    for (let provider of this.itemProviders) {
      let items = await provider.store.list(context);
      for (let item of items) {
        if (!seenIds.has(item.id)) {
          await item.update();
        }
      }
    }
  }

  public async deleteItem(context: PluginContext, id: string): Promise<void> {
    for (let provider of this.itemProviders) {
      await provider.store.delete(context, id);
    }
  }

  public async getPluginItem(context: PluginContext, id: string): Promise<PluginItem> {
    for (let provider of this.itemProviders) {
      let item = await provider.store.get(context, id);
      if (item) {
        return item;
      }
    }

    throw new Error(`Unknown item: ${id}`);
  }

  public async createItemFromURL(
    context: AuthedPluginContext,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    for (let provider of this.itemProviders) {
      let newItem = await provider.createItemFromURL(context, url, isTask);
      if (newItem) {
        return newItem.id;
      }
    }

    return null;
  }
}

export abstract class Base {
  public constructor(public readonly context: PluginContext) {
  }
}

export abstract class BaseAccount extends Base {
  public async searches(): Promise<ISearch[]> {
    return [];
  }

  public abstract items(): Promise<IItem[]>;

  public async delete(): Promise<void> {
    let seenIds = new Set<string>();

    for (let search of await this.searches()) {
      let seen = await search.update();
      for (let item of seen) {
        seenIds.add(item.id);
      }
      await search.delete();
    }

    for (let item of await this.items()) {
      if (!seenIds.has(item.id)) {
        await item.update();
      }
      await item.delete();
    }
  }
}

export abstract class BaseSearch<SR> extends Base implements ISearch {
  public abstract get id(): string;

  protected abstract listItems(results?: SR): Promise<PluginItem[]>;

  public abstract get name(): string;

  public get url(): string | null | undefined {
    return undefined;
  }

  public async update(results?: SR): Promise<PluginItem[]> {
    let items = await this.listItems(results);
    await this.context.updateList(this.id, {
      name: this.name,
      url: this.url,
      items: items.map((item: PluginItem): string => item.id),
    });
    return items;
  }

  public async delete(): Promise<void> {
    await this.context.deleteList(this.id);
  }
}

export abstract class BaseItem extends Base implements IItem {
  public abstract get id(): string;
  public abstract fields(): Awaitable<unknown>;

  public get url(): string | null | undefined {
    return undefined;
  }

  public get icon(): string | null | undefined {
    return undefined;
  }

  public async update(): Promise<void> {
    return;
  }

  public async delete(): Promise<void> {
    await this.context.disconnectItem(this.id, this.url, this.icon);
  }
}
