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

export async function map<T, R>(
  values: Awaitable<Iterable<T>>,
  mapper: (val: T) => Awaitable<R>,
): Promise<R[]> {
  values = await values;
  let results: R[] = [];

  for (let value of values) {
    results.push(await mapper(value));
  }

  return results;
}
