import { URL } from "url";

import type { Knex } from "knex";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import { extendTransaction } from "#server/utils";
import type {
  Service,
  ServiceTransaction,
  Transaction,
  CreateItemParams,
  ItemList,
  Segment,
} from "#server/utils";
import type { DescriptorsFor, Logger } from "#utils";
import { memoized, waitFor } from "#utils";

import {
  Item,
  LinkDetail,
  ServiceDetail,
  ServiceList,
  TaskInfo,
} from "./implementations";
import { ServiceOwner } from "./services";
import { buildStores } from "./stores";
import type { Stores } from "./stores";
import { ItemType } from "./types";

interface QueryResponse {
  rowCount: number;
}

type Query = Knex.QueryBuilder & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __knexUid: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __knexTxId: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __knexQueryUid: string;
  sql: string;
  bindings?: unknown[];
  response?: QueryResponse;
};

async function buildTransaction(
  knex: Knex,
  segment: Segment,
): Promise<Transaction> {
  return {
    knex,

    get segment(): Segment {
      return segment.current;
    },

    get log(): Logger {
      return segment.current;
    },

    tableRef(tableName: string, alias: string = tableName) {
      return knex.ref(tableName).as(alias);
    },
  };
}

export interface CoreTransaction extends Transaction {
  readonly stores: Stores;
  readonly transaction: Transaction;
}

export const buildCoreTransaction = memoized(
  (transaction: Transaction): CoreTransaction => {
    return extendTransaction(transaction, {
      stores: {
        enumerable: true,
        get(this: CoreTransaction): Stores {
          return buildStores(this);
        },
      },

      transaction: {
        enumerable: true,
        value: transaction,
      },
    });
  },
);

type ServiceTransactionProps = Omit<
  ServiceTransaction,
  Exclude<keyof Transaction, "tableRef">
>;

export const buildServiceTransaction = memoized(
  <Tx extends ServiceTransaction>(
    service: Service<Tx>,
    transaction: Transaction,
  ): Promise<Tx> => {
    let coreTransaction = buildCoreTransaction(transaction);

    let serviceOwner = ServiceOwner.getOwner(service);

    let descriptors: DescriptorsFor<ServiceTransactionProps> = {
      rootUrl: {
        enumerable: true,
        value: serviceOwner.rootUrl,
      },

      serviceUrl: {
        enumerable: true,
        value: serviceOwner.serviceUrl,
      },

      tableRef: {
        enumerable: true,
        value(tableName: string, alias: string = tableName) {
          return transaction.knex
            .ref(tableName)
            .withSchema(serviceOwner.id)
            .as(alias);
        },
      },

      settingsPageUrl: {
        enumerable: true,
        value(page: string): URL {
          let url = new URL(`settings/${page}`, serviceOwner.rootUrl);
          url.searchParams.set("service", serviceOwner.id);
          return url;
        },
      },

      createItem: {
        enumerable: true,
        async value(
          userId: string,
          { due, done, controller, ...item }: CreateItemParams,
        ): Promise<string> {
          let user = await coreTransaction.stores.users.get(userId);
          if (!user) {
            throw new Error("Unknown user.");
          }

          if (done === true) {
            done = DateTime.now();
          } else if (done === false) {
            done = null;
          }

          let itemImpl = await Item.create(
            coreTransaction,
            user,
            ItemType.Service,
            item,
          );

          await ServiceDetail.create(coreTransaction, itemImpl, {
            serviceId: serviceOwner.id,
            hasTaskState: done !== undefined,
            taskDone: done ?? null,
            taskDue: due ?? null,
          });

          if (done !== undefined && controller) {
            await TaskInfo.create(coreTransaction, itemImpl, {
              manualDue: null,
              manualDone: null,
              controller,
            });
          }

          return itemImpl.id;
        },
      },

      setItemTaskDone: {
        enumerable: true,
        async value(
          id: string,
          done: DateTime | boolean | null,
          due?: DateTime | null,
        ): Promise<void> {
          let item = await coreTransaction.stores.items.get(id);
          if (!item) {
            throw new Error("Unknown item.");
          }

          let detail = await item.detail();
          if (!(detail instanceof ServiceDetail)) {
            throw new Error("Item is not from a service.");
          }

          if (!detail.hasTaskState) {
            return;
          }

          let currentDone = detail.taskDone;
          if (done === true) {
            done = currentDone ?? DateTime.now();
          } else if (done === false) {
            done = null;
          }

          if (due === undefined) {
            due = detail.taskDue;
          }

          await detail.edit({
            taskDone: done,
            taskDue: due,
          });

          await TaskInfo.updateTaskDetails(coreTransaction, [id]);
        },
      },

      setItemSummary: {
        enumerable: true,
        async value(id: string, summary: string): Promise<void> {
          await coreTransaction.stores.items.updateOne(id, {
            summary,
          });
        },
      },

      disconnectItem: {
        enumerable: true,
        async value(
          id: string,
          url?: string | null,
          icon?: string | null,
        ): Promise<void> {
          let item = await coreTransaction.stores.items.get(id);
          if (!item) {
            throw new Error("Unknown item.");
          }

          await coreTransaction.stores.serviceDetail.deleteOne(item.id);
          if (url) {
            await item.edit({
              type: ItemType.Link,
            });

            await LinkDetail.create(coreTransaction, item, {
              url,
              icon: icon ?? null,
            });
          } else {
            await item.edit({
              type: null,
            });
          }

          let taskInfo = await item.taskInfo();
          if (!taskInfo) {
            return;
          }

          if (taskInfo.controller != TaskController.Manual) {
            await taskInfo.edit({
              due: taskInfo.manualDue,
              controller: TaskController.Manual,
            });
          }
        },
      },

      deleteItem: {
        enumerable: true,
        async value(id: string): Promise<void> {
          let item = await coreTransaction.stores.items.get(id);
          if (!item) {
            throw new Error("Unknown item.");
          }

          await item.delete();
        },
      },

      addList: {
        enumerable: true,
        async value(list: ItemList): Promise<string> {
          let listImpl = await ServiceList.create(
            coreTransaction,
            serviceOwner.id,
            list,
          );
          return listImpl.id;
        },
      },

      updateList: {
        enumerable: true,
        async value(id: string, list: Partial<ItemList>): Promise<void> {
          let listImpl = await coreTransaction.stores.serviceList.get(id);
          if (!listImpl || listImpl.serviceId != serviceOwner.id) {
            throw new Error("Unknown list.");
          }

          await listImpl.update(list);
        },
      },

      deleteList: {
        enumerable: true,
        async value(id: string): Promise<void> {
          let listImpl = await coreTransaction.stores.serviceList.get(id);
          if (!listImpl || listImpl.serviceId != serviceOwner.id) {
            throw new Error("Unknown list.");
          }

          await listImpl.delete();
        },
      },
    };

    let serviceTransaction = Object.create(
      transaction,
      descriptors,
    ) as ServiceTransaction;
    return waitFor(service.buildTransaction(serviceTransaction));
  },
);

export async function withTransaction<R>(
  knex: Knex,
  segment: Segment,
  action: (transaction: Transaction) => Promise<R>,
): Promise<R> {
  return knex.transaction<R>(
    async (trx: Knex): Promise<R> =>
      segment.inSegment<R>(
        "transaction",
        async (segment: Segment): Promise<R> => {
          let queries = new Map<string, Segment>();

          trx.on("query", function (this: Knex, query: Query): void {
            if (query.sql == "ROLLBACK" || query.sql == "COMMIT;") {
              return;
            }

            let querySegment = segment.current.enterSegment("query", {
              sql: query.sql,
              bindings: query.bindings,
            });

            queries.set(query.__knexQueryUid, querySegment);
          });

          trx.on(
            "query-response",
            function (this: Knex, _results: unknown, query: Query): void {
              let querySegment = queries.get(query.__knexQueryUid);
              if (!querySegment) {
                segment.current.error(
                  "Received query response from an unknown query.",
                  {
                    sql: query.sql,
                    bindings: query.bindings,
                    rowCount: query.response?.rowCount ?? 0,
                  },
                );
              } else {
                querySegment.trace("Query response", {
                  rowCount: query.response?.rowCount ?? 0,
                });
                querySegment.finish();
                queries.delete(query.__knexQueryUid);
              }
            },
          );

          trx.on(
            "query-error",
            function (this: Knex, error: Error, query: Query): void {
              let querySegment = queries.get(query.__knexQueryUid);
              if (!querySegment) {
                segment.current.error(
                  `Received query error from an unknown query: ${error.message}`,
                  {
                    error,
                    sql: query.sql,
                    bindings: query.bindings,
                  },
                );
              } else {
                querySegment.error(`Query error: ${error.message}`, {
                  error,
                  sql: query.sql,
                  bindings: query.bindings,
                });

                querySegment.finish();
                queries.delete(query.__knexQueryUid);
              }
            },
          );

          try {
            let transaction = await buildTransaction(trx, segment);

            let result: R = await action(transaction);

            let coreTransaction = buildCoreTransaction(transaction);
            await Item.deleteCompleteInboxTasks(coreTransaction);

            return result;
          } catch (e) {
            segment.warn("Rolling back transaction.");
            throw e;
          }
        },
      ),
  );
}
