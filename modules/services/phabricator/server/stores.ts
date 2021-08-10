import type { ServiceTransaction } from "#server/utils";
import { transactionBuilder, defineStoreBuilder, Store } from "#server/utils";

import { Account, Query, Revision } from "./implementations";

export interface PhabricatorTransaction extends ServiceTransaction {
  readonly stores: Stores;
}

export const buildTransaction = transactionBuilder<
  PhabricatorTransaction,
  ServiceTransaction
>({
  stores: {
    enumerable: true,
    get(this: PhabricatorTransaction): Stores {
      return buildStores(this);
    },
  },
});

const buildStores = defineStoreBuilder((tx: PhabricatorTransaction) => ({
  accounts: new Store(tx, "Account", Account),
  queries: new Store(tx, "Query", Query.buildQuery),
  revisions: new Store(tx, "Revision", Revision),
}));

export type Stores = ReturnType<typeof buildStores>;
