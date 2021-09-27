import { upsert } from "#utils";

interface Refreshable {
  refresh: () => Promise<any>;
}

const queries = new Map<Token, Set<Refreshable>>();

export type Token = any;

export function addRefreshable(token: Token, query: Refreshable): void {
  let set = upsert(queries, token, () => new Set());
  set.add(query);
}

export function removeRefreshable(token: Token, query: Refreshable): void {
  let set = queries.get(token);
  if (!set) {
    return;
  }

  set.delete(query);
  if (set.size == 0) {
    queries.delete(token);
  }
}

export async function refresh(token: Token): Promise<void> {
  let set = queries.get(token);
  if (!set) {
    return;
  }

  await Promise.all([...set].map((query: Refreshable) => query.refresh()));
}
