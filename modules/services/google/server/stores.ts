import type { ServiceTransaction } from "#server/utils";
import {
  Join,
  transactionBuilder,
  defineStoreBuilder,
  Store,
} from "#server/utils";

import { Account, File, MailSearch, Thread } from "./implementations";
import type { GoogleThreadLabelRecord } from "./types";

export interface GoogleTransaction extends ServiceTransaction {
  readonly stores: Stores;
}

export const buildTransaction = transactionBuilder<
  GoogleTransaction,
  ServiceTransaction
>({
  stores: {
    enumerable: true,
    get(this: GoogleTransaction): Stores {
      return buildStores(this);
    },
  },
});

const buildStores = defineStoreBuilder((tx: GoogleTransaction) => ({
  accounts: new Store(tx, "Account", Account),
  mailSearches: new Store(tx, "MailSearch", MailSearch),
  threads: new Store(tx, "Thread", Thread),
  files: new Store(tx, "File", File),
  threadLabels: Join.build<GoogleThreadLabelRecord>()(
    tx,
    "ThreadLabel",
    "threadId",
    "labelId",
  ),
}));

export type Stores = ReturnType<typeof buildStores>;
