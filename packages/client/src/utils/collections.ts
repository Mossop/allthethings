export function upsert<K, V>(map: Map<K, V>, key: K, builder: () => V): V {
  let result = map.get(key);
  if (result !== undefined) {
    return result;
  }

  result = builder();
  map.set(key, result);
  return result;
}
