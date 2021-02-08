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
