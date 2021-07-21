import type { ServiceTransaction } from "#server/utils";
import { transactionBuilder, defineStoreBuilder, Store } from "#server/utils";

import { Account, Issue, Search } from "./implementations";

export interface JiraTransaction extends ServiceTransaction {
  readonly stores: Stores;
}

export const buildTransaction = transactionBuilder<JiraTransaction, ServiceTransaction>({
  stores: {
    enumerable: true,
    get(this: JiraTransaction): Stores {
      return buildStores(this);
    },
  },
});

const buildStores = defineStoreBuilder((tx: JiraTransaction) => ({
  accounts: new Store(tx, "Account", Account),
  searches: new Store(tx, "Search", Search),
  issues: new Store(tx, "Issue", Issue),
}));

export type Stores = ReturnType<typeof buildStores>;
