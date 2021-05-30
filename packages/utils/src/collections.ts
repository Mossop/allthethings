import type { Awaitable } from "./types";

interface MapLike<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
}

export function upsert<K, V>(map: MapLike<K, V>, key: K, builder: () => V): V {
  let result = map.get(key);
  if (result !== undefined) {
    return result;
  }

  result = builder();
  map.set(key, result);
  return result;
}

interface IdItem<I> {
  id: I;
}
type Getter<I, T extends IdItem<I>> = (id: I) => Awaitable<T | null>;
type Builder<T> = () => Awaitable<T>;

export class ItemCache<I, T extends IdItem<I>> {
  private cache = new Map<I, T>();

  public constructor(private readonly getter: Getter<I, T>) {
  }

  public async getItem(id: I): Promise<T | null> {
    let item = this.cache.get(id);
    if (item) {
      return item;
    }

    let newItem = await this.getter(id);
    if (newItem) {
      this.cache.set(id, newItem);
    }
    return newItem;
  }

  public getCachedItem(id: I): T | null {
    return this.cache.get(id) ?? null;
  }

  public addItem(item: T): void {
    this.cache.set(item.id, item);
  }

  public async upsertItem(id: I, builder: Builder<T>): Promise<T> {
    let item = this.cache.get(id);
    if (item) {
      return item;
    }

    let newItem = await builder();
    this.cache.set(id, newItem);
    return newItem;
  }

  public deleteItem(id: I): void {
    this.cache.delete(id);
  }
}
