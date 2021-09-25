import { URL } from "url";

import { DateTime } from "luxon";

import type { Database, QueryInstance } from "#db";
import { TaskController } from "#schema";
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

import { ItemType } from "./entities";
import {
  Item,
  LinkDetail,
  ServiceDetail,
  ServiceList,
  TaskInfo,
  User,
} from "./implementations";
import { ServiceOwner } from "./services";

async function buildTransaction(
  database: Database,
  segment: Segment,
): Promise<Transaction> {
  return {
    db: database,

    get segment(): Segment {
      return segment.current;
    },

    get log(): Logger {
      return segment.current;
    },
  };
}

type ServiceTransactionProps = Omit<
  ServiceTransaction,
  Exclude<keyof Transaction, "tableRef">
>;

export const buildServiceTransaction = memoized(
  <Tx extends ServiceTransaction>(
    service: Service<Tx>,
    tx: Transaction,
  ): Promise<Tx> => {
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
          let user = await User.store(tx).get(userId);

          if (done === true) {
            done = DateTime.now();
          } else if (done === false) {
            done = null;
          }

          let itemImpl = await Item.create(tx, user, ItemType.Service, item);

          await ServiceDetail.create(tx, itemImpl, {
            serviceId: serviceOwner.id,
            hasTaskState: done !== undefined,
            taskDone: done ?? null,
            taskDue: due ?? null,
          });

          if (done !== undefined && controller) {
            await TaskInfo.create(tx, itemImpl, {
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
          let item = await Item.store(tx).get(id);

          let detail = await item.detail;
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

          await detail.update({
            taskDone: done,
            taskDue: due,
          });

          await TaskInfo.updateTaskDetails(tx, [id]);
        },
      },

      setItemSummary: {
        enumerable: true,
        async value(id: string, summary: string): Promise<void> {
          let item = await Item.store(tx).get(id);
          await item.update({ summary });
        },
      },

      disconnectItem: {
        enumerable: true,
        async value(
          id: string,
          url?: string | null,
          icon?: string | null,
        ): Promise<void> {
          let item = await Item.store(tx).get(id);
          let detail = item.detail;
          if (
            !(detail instanceof ServiceDetail) ||
            detail.serviceId != serviceOwner.id
          ) {
            throw new Error("Item is not from this service.");
          }
          await detail.delete();

          if (url) {
            await item.update({
              type: ItemType.Link,
            });

            await LinkDetail.create(tx, item, {
              url,
              icon: icon ?? null,
            });
          } else {
            await item.update({
              type: null,
            });
          }

          let taskInfo = await item.taskInfo;
          if (!taskInfo) {
            return;
          }

          if (taskInfo.controller != TaskController.Manual) {
            await taskInfo.update({
              due: taskInfo.manualDue,
              controller: TaskController.Manual,
            });
          }
        },
      },

      deleteItem: {
        enumerable: true,
        async value(id: string): Promise<void> {
          let item = await Item.store(tx).get(id);
          await item.delete();
        },
      },

      addList: {
        enumerable: true,
        async value(list: ItemList): Promise<string> {
          let listImpl = await ServiceList.create(tx, serviceOwner.id, list);
          return listImpl.id;
        },
      },

      updateList: {
        enumerable: true,
        async value(id: string, list: Partial<ItemList>): Promise<void> {
          let listImpl = await ServiceList.store(tx).get(id);
          if (listImpl.serviceId != serviceOwner.id) {
            throw new Error("Unknown list.");
          }

          await listImpl.updateList(list);
        },
      },

      deleteList: {
        enumerable: true,
        async value(id: string): Promise<void> {
          let listImpl = await ServiceList.store(tx).get(id);
          if (listImpl.serviceId != serviceOwner.id) {
            throw new Error("Unknown list.");
          }

          await listImpl.delete();
        },
      },
    };

    let serviceTransaction = Object.create(
      tx,
      descriptors,
    ) as ServiceTransaction;
    return waitFor(service.buildTransaction(serviceTransaction));
  },
);

export async function withTransaction<R>(
  db: Database,
  segment: Segment,
  operation: string,
  action: (transaction: Transaction) => Promise<R>,
): Promise<R> {
  return segment.inSegment<R>(
    operation,
    async (segment: Segment): Promise<R> => {
      return db.inTransaction<R>(async (db: Database): Promise<R> => {
        let querySegments = new WeakMap<QueryInstance, Segment>();

        db.on("query", (db: Database, query: QueryInstance) => {
          let inner = segment.current.enterSegment("DB Query", {
            query: query.query,
            parameters: query.parameters,
          });
          querySegments.set(query, inner);
        });

        db.on("result", (db: Database, query: QueryInstance) => {
          let inner = querySegments.get(query);
          if (!inner) {
            segment.current.error("Saw a query result while not in a query");
          } else {
            querySegments.delete(query);
            inner.finish();
          }
        });

        db.on("error", (db: Database, query: QueryInstance) => {
          let inner = querySegments.get(query);
          if (!inner) {
            segment.current.error("Saw a query error while not in a query");
          } else {
            querySegments.delete(query);
            inner.finish();
          }
        });

        try {
          let tx = await buildTransaction(db, segment);
          let result: R = await action(tx);
          await Item.deleteCompleteInboxTasks(tx);

          return result;
        } catch (e) {
          segment.warn("Rolling back transaction.");
          throw e;
        }
      });
    },
  );
}
