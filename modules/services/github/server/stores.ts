import type { ServiceTransaction } from "#server/utils";
import { Join, transactionBuilder, defineStoreBuilder, Store } from "#server/utils";

import { Account, IssueLike, Label, Repository, Search } from "./implementations";
import type { IssueLikeLabelsRecord } from "./types";

export interface GithubTransaction extends ServiceTransaction {
  readonly stores: Stores;
}

export const buildTransaction = transactionBuilder<GithubTransaction, ServiceTransaction>({
  stores: {
    enumerable: true,
    get(this: GithubTransaction): Stores {
      return buildStores(this);
    },
  },
});

const buildStores = defineStoreBuilder((tx: GithubTransaction) => ({
  accounts: new Store(tx, "Account", Account),
  repositories: new Store(tx, "Repository", Repository),
  labels: new Store(tx, "Label", Label),
  searches: new Store(tx, "Search", Search),
  issueLikes: new Store(tx, "IssueLike", IssueLike),
  issueLikeLabels: Join.build<IssueLikeLabelsRecord>()(tx, "IssueLikeLabels", "issueLike", "label"),
}));

export type Stores = ReturnType<typeof buildStores>;
