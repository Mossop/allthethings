import type { Awaitable } from "./types";
import { isPromise } from "./utils";

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

export interface IdItem<I> {
  id: I;
}
type ItemGetter<I, T extends IdItem<I>> = (id: I) => Awaitable<T | null>;

export class ItemCache<I, T extends IdItem<I>> {
  protected cache = new Map<I, T>();

  public constructor(private readonly getter: ItemGetter<I, T>) {
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

  public clear(): void {
    this.cache.clear();
  }

  public getCachedItem(id: I): T | null {
    return this.cache.get(id) ?? null;
  }

  public addItem(item: T): T {
    this.cache.set(item.id, item);
    return item;
  }

  public upsertItem(id: I, builder: () => T): T;
  public upsertItem(id: I, builder: () => Promise<T>): Promise<T>;
  public upsertItem(id: I, builder: () => T | Promise<T>): T | Promise<T> {
    let item = this.cache.get(id);
    if (item) {
      return item;
    }

    let built = builder();
    if (isPromise(built)) {
      return built.then((item: T): T => {
        this.cache.set(id, item);
        return item;
      });
    }

    this.cache.set(id, built);
    return built;
  }

  public deleteItem(id: I): void {
    this.cache.delete(id);
  }
}

type RelatedItemGetter<S, I, T extends IdItem<I>> = (source: S, id: I) => Awaitable<T | null>;

class RelatedItemCache<S, I, T extends IdItem<I>> extends ItemCache<I, T> {
  public constructor(
    private readonly source: S,
    getter: RelatedItemGetter<S, I, T>,
  ) {
    super((id: I) => getter(source, id));
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function related<S extends object, T>(builder: (source: S) => T): (source: S) => T {
  let map = new WeakMap<S, T>();

  return (source: S): T => {
    let item = map.get(source);
    if (item) {
      return item;
    }

    item = builder(source);
    map.set(source, item);
    return item;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function relatedCache<S extends object, I, T extends IdItem<I>>(
  getter: RelatedItemGetter<S, I, T>,
): (source: S) => ItemCache<I, T> {
  return related((source: S): ItemCache<I, T> => {
    return new RelatedItemCache<S, I, T>(source, getter);
  });
}
