export type Comparator<T> = (a: T, b: T) => number;

export function sorted<T>(list: Iterable<T>, comparator: Comparator<T>): T[] {
  let result = [...list];
  result.sort(comparator);
  return result;
}

export const numericComparator = (a: number, b: number): number => a - b;
export const stringComparator = (a: string, b: string): number => a.localeCompare(b);

export function keyedComparator<T, K extends keyof T>(
  key: K,
  comparator: Comparator<T[K]>,
): Comparator<T> {
  return (a: T, b: T): number => comparator(a[key], b[key]);
}

interface Named {
  name: string;
}

export function nameSorted<T extends Named>(list: Iterable<T>): T[] {
  return sorted(list, keyedComparator("name", stringComparator));
}

export function indexOf<T extends { id: string }>(items: T[], item: T | string): number | null {
  let id = typeof item == "string" ? item : item.id;
  let index = items.findIndex((val: T): boolean => val.id == id);
  return index >= 0 ? index : null;
}

export function item<T>(items: T[], index: number): T | null {
  if (index < 0 || index >= items.length) {
    return null;
  }

  return items[index];
}
