import { URL } from "url";

import type { Database, QueryInstance } from "../../db";
import { sql, values, In } from "../../db";
import type { DescriptorsFor, Logger } from "../../utils";
import { memoized } from "../../utils";
import { id, ref, TaskController } from "../utils";
import type {
  Service,
  ServiceTransaction,
  Transaction,
  CreateItemParams,
  ItemList,
  Segment,
  UpdateItemParams,
} from "../utils";
import type {
  ItemEntity,
  ServiceDetailEntity,
  TaskInfoEntity,
} from "./entities";
import { ItemType } from "./entities";
import { Item, ServiceDetail, ServiceList, TaskInfo } from "./implementations";
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
  (service: Service, tx: Transaction): ServiceTransaction => {
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

      createItems: {
        enumerable: true,
        async value(params: CreateItemParams[]): Promise<string[]> {
          if (!params.length) {
            return [];
          }

          let ids: string[] = [];
          let entities: Omit<ItemEntity, "created">[] = [];
          let details: ServiceDetailEntity[] = [];
          let taskInfos: TaskInfoEntity[] = [];

          for (let param of params) {
            let itemId = await id();

            ids.push(itemId);

            entities.push({
              id: itemId,
              userId: param.userId,
              sectionId: null,
              sectionIndex: 0,

              summary: param.summary,
              archived: null,
              snoozed: null,
              type: ItemType.Service,
            });

            let taskDone = param.done ?? null;
            let taskDue = param.due ?? null;

            details.push({
              id: itemId,
              serviceId: serviceOwner.id,
              hasTaskState: param.done !== undefined,
              taskDone,
              taskDue,
              fields: param.fields,
            });

            if (param.controller) {
              taskInfos.push({
                id: itemId,
                due:
                  param.controller == TaskController.Service ? taskDue : null,
                done:
                  param.controller == TaskController.Service ? taskDone : null,
                manualDue: null,
                manualDone: null,
                controller: param.controller,
              });
            }
          }

          await Item.store(tx).create(entities);
          await ServiceDetail.store(tx).create(details);
          await TaskInfo.store(tx).create(taskInfos);

          return ids;
        },
      },

      updateItems: {
        enumerable: true,
        async value(params: UpdateItemParams[]): Promise<void> {
          if (!params.length) {
            return;
          }

          let detailParams: ServiceDetailEntity[] = [];
          let itemParams: Pick<ItemEntity, "id" | "summary">[] = [];
          let items: string[] = [];

          for (let param of params) {
            items.push(param.id);

            itemParams.push({
              id: param.id,
              summary: param.summary,
            });

            detailParams.push({
              id: param.id,
              serviceId: serviceOwner.id,
              hasTaskState: param.done !== undefined,
              taskDone: param.done ?? null,
              taskDue: param.due ?? null,
              fields: param.fields,
            });
          }

          await tx.db.update(sql`
            UPDATE ${ref(Item)} as "Item"
              SET "summary" = "v"."summary"
              FROM ${values("v", itemParams)}
              WHERE "Item"."id" = "v"."id"
          `);

          await tx.db.update(sql`
            UPDATE ${ref(ServiceDetail)} as "ServiceDetail"
              SET
                "hasTaskState" = "v"."hasTaskState"::boolean,
                "taskDone" = "v"."taskDone"::TIMESTAMP WITH TIME ZONE,
                "taskDue" = "v"."taskDue"::TIMESTAMP WITH TIME ZONE,
                "fields" = "v"."fields"::jsonb
              FROM ${values("v", detailParams)}
              WHERE
                "ServiceDetail"."id" = "v"."id"
                AND
                "ServiceDetail"."serviceId" = "v"."serviceId"
          `);

          await TaskInfo.updateTaskDetails(tx, items);
        },
      },

      deleteItems: {
        enumerable: true,
        async value(ids: string[]): Promise<void> {
          if (!ids.length) {
            return;
          }

          await Item.store(tx).delete({ id: In(ids) });
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

    return Object.create(tx, descriptors) as ServiceTransaction;
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
