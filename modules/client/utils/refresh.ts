import { upsert } from "#utils";

interface Pollable {
  poll: () => Promise<any>;
}

const queries = new Map<Token, Set<Pollable>>();

export type Token = any;

export const Refresh = {
  addQuery(token: Token, query: Pollable): void {
    let set = upsert(queries, token, () => new Set());
    set.add(query);
  },

  removeQuery(token: Token, query: Pollable): void {
    let set = queries.get(token);
    if (!set) {
      return;
    }

    set.delete(query);
    if (set.size == 0) {
      queries.delete(token);
    }
  },

  async refresh(token: Token): Promise<void> {
    let set = queries.get(token);
    if (!set) {
      return;
    }

    await Promise.all([...set].map((query: Pollable) => query.poll()));
  },
};
