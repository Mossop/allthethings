import type { ServiceTransaction } from "#server/utils";
import { transactionBuilder, defineStoreBuilder, Store } from "#server/utils";

import { Account, Bug, Search } from "./implementations";

export interface BugzillaTransaction extends ServiceTransaction {
  readonly stores: Stores;
}

export const buildTransaction = transactionBuilder<BugzillaTransaction, ServiceTransaction>({
  stores: {
    enumerable: true,
    get(this: BugzillaTransaction): Stores {
      return buildStores(this);
    },
  },
});

const buildStores = defineStoreBuilder((tx: BugzillaTransaction) => ({
  accounts: new Store(tx, "Account", Account),
  searches: new Store(tx, "Search", Search),
  bugs: new Store(tx, "Bug", Bug),
}));

export type Stores = ReturnType<typeof buildStores>;
