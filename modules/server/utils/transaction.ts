import type { Database } from "#db";
import type { DescriptorsFor } from "#utils";

import type { Logger } from "./logging";
import type { Segment } from "./segment";

export interface Transaction {
  readonly db: Database;
  readonly segment: Segment;
  readonly log: Logger;
}

export function extendTransaction<
  Tx1 extends Transaction,
  Tx2 extends Transaction,
>(tx: Tx1, properties: DescriptorsFor<Omit<Tx2, keyof Tx1>>): Tx2 {
  return Object.create(tx, properties) as Tx2;
}

export function transactionBuilder<
  Tx extends Transaction,
  STx extends Transaction = Transaction,
>(properties: DescriptorsFor<Omit<Tx, keyof STx>>): (tx: STx) => Tx {
  return (tx: STx) => extendTransaction(tx, properties);
}
