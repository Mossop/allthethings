import type { Knex } from "knex";

import type { DescriptorsFor } from "#utils";

export type TableRef = Pick<Knex.Ref<string, {[K in string]: string}>, "as"> & Knex.Raw<string>;

export interface Transaction {
  readonly knex: Knex;
  tableRef(tableName: string, alias?: string): TableRef;
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
