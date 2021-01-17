export type Comparator<T> = (a: T, b: T) => number;

export function sorted<T>(list: readonly T[], comparator: Comparator<T>): T[] {
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

export function nameSorted<T extends Named>(list: readonly T[]): T[] {
  return sorted(list, keyedComparator("name", stringComparator));
}
