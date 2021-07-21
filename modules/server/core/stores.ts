import type { Knex } from "knex";

import { Join, Store, defineStoreBuilder } from "#server/utils";

import {
  Context,
  FileDetail,
  Item,
  LinkDetail,
  NoteDetail,
  ServiceDetail,
  ServiceList,
  Project,
  Section,
  SectionItem,
  TaskInfo,
  User,
} from "./implementations";
import type { CoreTransaction } from "./transaction";
import type {
  ContextInsertRecord,
  ProjectInsertRecord,
  SectionInsertRecord,
  ServiceListItemsRecord,
} from "./types";

export const buildStores = defineStoreBuilder((tx: CoreTransaction) => ({
  users: new Store(tx, "User", User),
  contexts: new Store(tx, "Context", Context).withInsert<ContextInsertRecord>(),
  projects: new Store(tx, "Project", Project, (
    builder: Knex.QueryBuilder,
    knex: Knex,
  ): Knex.QueryBuilder => {
    return builder.whereNot("id", knex.ref("contextId"));
  }).withInsert<ProjectInsertRecord>(),
  sections: new Store(tx, "Section", Section, (
    builder: Knex.QueryBuilder,
    knex: Knex,
  ): Knex.QueryBuilder => {
    return builder.whereNot("id", knex.ref("ownerId"));
  }).withInsert<SectionInsertRecord>(),
  items: new Store(tx, "Item", Item),
  taskInfo: new Store(tx, "TaskInfo", TaskInfo),
  linkDetail: new Store(tx, "LinkDetail", LinkDetail),
  noteDetail: new Store(tx, "NoteDetail", NoteDetail),
  fileDetail: new Store(tx, "FileDetail", FileDetail),
  serviceDetail: new Store(tx, "ServiceDetail", ServiceDetail),
  serviceList: new Store(tx, "ServiceList", ServiceList),
  sectionItems: new Store(tx, "SectionItems", SectionItem),

  serviceListItems: Join.build<ServiceListItemsRecord>()(
    tx,
    "ServiceListItems",
    "listId",
    "itemId",
  ),
}));

export type Stores = ReturnType<typeof buildStores>;
