import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Knex } from "knex";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type {
  ContextItemsArgs,
  ContextParams,
  ContextProjectByIdArgs,
  ContextRootItemsArgs,
  ProjectParams,
  SectionParams,
  TaskInfoParams,
  TaskListItemsArgs,
  UserAllItemsArgs,
  UserInboxArgs,
  ItemParams,
  ItemFilter,
} from "#schema";
import type {
  Identified,
  ItemList,
  ResolverImpl,
  Store,
} from "#server/utils";
import { id, min, count, max, BaseRecordHolder } from "#server/utils";
import { assert, call, memoized, waitFor } from "#utils";

import type {
  ContextResolvers,
  FileDetailResolvers,
  ItemResolvers,
  ItemSetResolvers,
  LinkDetailResolvers,
  NoteDetailResolvers,
  ServiceDetailResolvers,
  ServiceListResolvers,
  ProjectResolvers,
  SectionResolvers,
  TaskInfoResolvers,
  UserResolvers,
} from "./schema";
import { ServiceManager } from "./services";
import type { Stores } from "./stores";
import type { CoreTransaction } from "./transaction";
import { buildServiceTransaction } from "./transaction";
import type {
  ContextRecord,
  FileDetailRecord,
  IndexedEntity,
  ItemRecord,
  LinkDetailRecord,
  NoteDetailRecord,
  ServiceDetailRecord,
  ServiceListRecord,
  ProjectRecord,
  SectionItemsRecord,
  SectionRecord,
  TaskInfoRecord,
  UserRecord,
  ServiceListItemsRecord,
} from "./types";
import {
  ItemType,
} from "./types";

export type TaskList = Project | Context;
export type ItemHolder = TaskList | Section;
export type ItemDetail = NoteDetail | LinkDetail | ServiceDetail | FileDetail;

function isSet(val: unknown): boolean {
  return val !== undefined && val !== null;
}

export class ItemSet implements ResolverImpl<ItemSetResolvers> {
  protected readonly query: Knex.QueryBuilder;

  public constructor(
    protected readonly transaction: CoreTransaction,
    query: Knex.QueryBuilder,
    filter: ItemFilter | null = null,
  ) {
    if (filter) {
      if (isSet(filter.isTask) || filter.dueAfter || filter.dueBefore ||
        filter.isPending === false) {
        query = query.join("TaskInfo", "TaskInfo.id", "Item.id");

        if (filter.dueBefore || filter.dueAfter) {
          query = query.whereNotNull("TaskInfo.due");
        }

        if (filter.dueBefore) {
          query = query.where("TaskInfo.due", "<=", filter.dueBefore);
        }

        if (filter.dueAfter) {
          query = query.where("TaskInfo.due", ">", filter.dueAfter);
        }

        if (filter.isPending === false) {
          query = query.whereNotNull("TaskInfo.done");
        }
      } else if (filter.isPending) {
        query = query.leftJoin("TaskInfo", "TaskInfo.id", "Item.id")
          .whereNull("TaskInfo.done");
      }

      if (filter.isSnoozed === true) {
        query = query.whereNotNull("Item.snoozed");
      } else if (filter.isSnoozed === false) {
        query = query.whereNull("Item.snoozed");
      }

      if (filter.isArchived === true) {
        query = query.whereNotNull("Item.archived");
      } else if (filter.isArchived === false) {
        query = query.whereNull("Item.archived");
      }
    }

    this.query = query;
  }

  public async count(): Promise<number> {
    return (await this.records()).length;
  }

  public async records(): Promise<ItemRecord[]> {
    return this.query.select("Item.*");
  }

  public async items(): Promise<Item[]> {
    let records = await this.query.select("Item.*") as ItemRecord[];
    return records.map(
      (record: ItemRecord): Item => new Item(this.transaction, record),
    );
  }
}

abstract class Base<Record> extends BaseRecordHolder<Record, CoreTransaction> {
  public constructor(
    tx: CoreTransaction,
    record: Record,
  ) {
    super(tx, record);
  }

  protected get stores(): Stores {
    return this.tx.stores;
  }
}

abstract class IdentifiedBase<Record extends Identified> extends Base<Record> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract readonly store: Store<any, any, any, any>;

  public get id(): string {
    return this.record.id;
  }

  public async edit(params: Partial<Omit<Record, "id">>): Promise<void> {
    await this.store.updateOne(this.id, params);
  }

  public async delete(): Promise<void> {
    await this.store.deleteOne(this.id);
  }
}

abstract class OrderedBase<Record extends Identified & IndexedEntity, OwnerImpl extends Identified>
  extends Base<Record> {
  protected static async insert<
    Record extends Identified & IndexedEntity,
    Impl extends OrderedBase<Record, Identified>,
    Insert extends Identified & IndexedEntity,
  >(
    store: Store<Record, Impl, Insert, CoreTransaction>,
    { id, ...record }: Omit<Insert, "ownerId" | "index">,
    ownerId: string,
    before: Impl | null,
  ): Promise<Impl> {
    let index: number;

    if (before) {
      if (before.record.ownerId != ownerId) {
        throw new Error("Invalid request.");
      }

      index = before.index;
      await store.table()
        .where("ownerId", ownerId)
        .andWhere("index", ">=", index)
        // @ts-ignore
        .update({
          index: before.tx.knex.raw("?? + 1", ["index"]),
        });
    } else {
      let i = await max<IndexedEntity, "index">(store.table().where("ownerId", ownerId), "index");
      index = i !== null ? i + 1 : 0;
    }

    // @ts-ignore
    return store.insertOne({
      ...record,
      ownerId,
      index,
    }, id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract readonly store: Store<any, any, any, any>;

  public get id(): string {
    return this.record.id;
  }

  public get index(): number {
    return this.record.index;
  }

  public async move(owner: OwnerImpl, before: this | null): Promise<void> {
    let currentOwner = this.record.ownerId;
    let currentIndex = this.record.index;

    let targetIndex: number;

    if (before) {
      if (before.record.ownerId != owner.id) {
        throw new Error("Invalid request.");
      }

      targetIndex = before.index;

      await this.store.table()
        .where("ownerId", owner.id)
        .andWhere("index", ">=", targetIndex)
        // @ts-ignore
        .update({
          index: before.tx.knex.raw("?? + 1", ["index"]),
        });
    } else {
      let i = await max<IndexedEntity, "index">(
        this.store.table().where("ownerId", owner.id),
        "index",
      );

      targetIndex = i !== null ? i + 1 : 0;
    }

    // @ts-ignore
    await this.store.updateOne(this.id, {
      ownerId: owner.id,
      index: targetIndex,
    });

    await this.store.table()
      .where("ownerId", currentOwner)
      .andWhere("index", ">", currentIndex)
      .update({
        index: this.tx.knex.raw("?? - 1", ["index"]),
      });
  }

  public async edit(
    params: Partial<Omit<Record, "id" | "ownerId" | "index">>,
  ): Promise<void> {
    // @ts-ignore
    await this.store.updateOne(this.id, params);
  }

  public async delete(): Promise<void> {
    await this.store.deleteOne(this.id);
    await this.store.table()
      .where("ownerId", this.record.ownerId)
      .andWhere("index", ">=", this.record.index)
      .update({
        index: this.tx.knex.raw("?? - 1", ["index"]),
      });
  }
}

export class User extends Base<UserRecord> implements ResolverImpl<UserResolvers> {
  public static async create(
    tx: CoreTransaction,
    userRecord: Omit<UserRecord, "id">,
  ): Promise<User> {
    let user = await tx.stores.users.insertOne({
      ...userRecord,
      password: await bcryptHash(userRecord.password, 12),
    });

    await Context.create(tx, user, {
      name: "Tasks",
    });

    return user;
  }

  protected get store(): Stores["users"] {
    return this.stores.users;
  }

  public get id(): string {
    return this.record.id;
  }

  public get email(): string {
    return this.record.email;
  }

  public get isAdmin(): boolean {
    return this.record.isAdmin;
  }

  public async setPassword(password: string): Promise<void> {
    await this.store.updateOne(this.id, {
      password: await bcryptHash(password, 12),
    });
  }

  public verifyUser(password: string): Promise<boolean> {
    return bcryptCompare(password, this.record.password);
  }

  public async delete(): Promise<void> {
    await this.store.deleteOne(this.id);
  }

  public contexts(): Promise<Context[]> {
    return this.stores.contexts.list({ userId: this.id });
  }

  public async inbox({ filter }: UserInboxArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      this.stores.items.records()
        .leftJoin("SectionItems", "Item.id", "SectionItems.id")
        .whereNull("SectionItems.ownerId")
        .orderBy([
          { column: "Item.created", order: "desc" },
          { column: "Item.summary", order: "asc" },
        ]),
      filter,
    );
  }

  public async allItems({ filter }: UserAllItemsArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      this.stores.items.records()
        .where("Item.userId", this.id),
      filter,
    );
  }
}

export abstract class ItemHolderBase<Record extends Identified> extends IdentifiedBase<Record> {
  public static async getItemHolder(tx: CoreTransaction, id: string): Promise<ItemHolder | null> {
    let context = await tx.stores.contexts.get(id);
    if (context) {
      return context;
    }

    let project = await tx.stores.projects.get(id);
    if (project) {
      return project;
    }

    return tx.stores.sections.get(id);
  }

  public async items({ filter }: TaskListItemsArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      this.stores.items.records()
        .leftJoin("SectionItems", "Item.id", "SectionItems.id")
        .where("SectionItems.ownerId", this.id)
        .orderBy([
          { column: "SectionItems.index", order: "asc" },
        ]),
      filter,
    );
  }
}

export abstract class TaskListBase<Record extends Identified> extends ItemHolderBase<Record> {
  public static async getTaskList(tx: CoreTransaction, id: string): Promise<TaskList | null> {
    let context = await tx.stores.contexts.get(id);
    if (context) {
      return context;
    }

    return tx.stores.projects.get(id);
  }

  public abstract context(): Promise<Context>;

  public subprojects(): Promise<Project[]> {
    return this.stores.projects.list({
      parentId: this.id,
    });
  }

  public sections(): Promise<Section[]> {
    return this.stores.sections.list({
      ownerId: this.id,
    });
  }
}

export class Context extends TaskListBase<ContextRecord> implements ResolverImpl<ContextResolvers> {
  protected get store(): Stores["contexts"] {
    return this.stores.contexts;
  }

  public static async create(
    tx: CoreTransaction,
    user: User,
    params: ContextParams,
  ): Promise<Context> {
    let context = await tx.stores.contexts.insertOne({
      ...params,
      userId: user.id,
    });

    await tx.stores.projects.insertOne({
      userId: user.id,
      contextId: context.id,
      parentId: null,
      name: "",
    }, context.id);

    await tx.stores.sections.insertOne({
      userId: user.id,
      ownerId: context.id,
      index: -1,
      name: "",
    }, context.id);

    return context;
  }

  public readonly user = memoized(function(this: Context): Promise<User> {
    return assert(this.stores.users.get(this.record.userId));
  });

  public get name(): string {
    return this.record.name;
  }

  public get stub(): string {
    return this.record.stub;
  }

  public async context(): Promise<Context> {
    return this;
  }

  public projects(): Promise<Project[]> {
    return this.stores.projects.list({
      contextId: this.id,
    });
  }

  public projectById({ id }: ContextProjectByIdArgs): Promise<Project | null> {
    return this.stores.projects.first({
      contextId: this.id,
      id,
    });
  }

  public async rootItems({ filter }: ContextRootItemsArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      this.stores.items.records()
        .join("SectionItems", "Item.id", "SectionItems.id")
        .join("Section", "Section.id", "SectionItems.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .join("Context", "Context.id", "Project.contextId")
        .where("Context.id", this.id),
      filter,
    );
  }
}

export class Project extends TaskListBase<ProjectRecord> implements ResolverImpl<ProjectResolvers> {
  public static async create(
    tx: CoreTransaction,
    taskList: TaskList,
    params: ProjectParams,
  ): Promise<Project> {
    let user = await taskList.user();
    let context = await taskList.context();
    let project = await tx.stores.projects.insertOne({
      ...params,
      userId: user.id,
      contextId: context.id,
      parentId: taskList.id,
    });

    await tx.stores.sections.insertOne({
      userId: user.id,
      ownerId: project.id,
      index: -1,
      name: "",
    }, project.id);

    return project;
  }

  protected get store(): Stores["projects"] {
    return this.stores.projects;
  }

  public readonly user = memoized(function(this: Project): Promise<User> {
    return assert(this.stores.users.get(this.record.userId));
  });

  public get name(): string {
    return this.record.name;
  }

  public get stub(): string {
    return this.record.stub;
  }

  public async context(): Promise<Context> {
    return assert(this.stores.contexts.get(this.record.contextId));
  }

  public taskList(): Promise<TaskList> {
    if (this.record.parentId) {
      return assert(this.stores.projects.get(this.record.parentId));
    }

    return assert(this.stores.contexts.get(this.record.contextId));
  }

  public async move(taskList: TaskList): Promise<void> {
    let context = await taskList.context();
    await this.stores.projects.updateOne(this.id, {
      contextId: context.id,
      parentId: taskList.id,
    });
  }
}

export class Section
  extends OrderedBase<SectionRecord, TaskList> implements ResolverImpl<SectionResolvers> {
  public static async create(
    tx: CoreTransaction,
    taskList: TaskList,
    before: Section | null,
    params: SectionParams,
  ): Promise<Section> {
    let user = await taskList.user();
    return OrderedBase.insert(tx.stores.sections, {
      ...params,
      id: await id(),
      userId: user.id,
    }, taskList.id, before);
  }
  protected get store(): Stores["sections"] {
    return this.stores.sections;
  }

  public get name(): string {
    return this.record.name;
  }

  public async items({ filter }: ContextItemsArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      this.stores.items.records()
        .leftJoin("SectionItems", "Item.id", "SectionItems.id")
        .where("SectionItems.ownerId", this.id)
        .orderBy([
          { column: "SectionItems.index", order: "asc" },
        ]),
      filter,
    );
  }
}

export class Item extends IdentifiedBase<ItemRecord> implements ResolverImpl<ItemResolvers> {
  public static async create(
    tx: CoreTransaction,
    user: User,
    type: ItemType | null,
    itemParams: ItemParams,
    taskInfo?: TaskInfoParams | null,
  ): Promise<Item> {
    try {
      let item = await tx.stores.items.insertOne({
        ...itemParams,
        archived: itemParams.archived ?? null,
        snoozed: itemParams.snoozed ?? null,
        userId: user.id,
        created: DateTime.now(),
        type,
      });

      if (taskInfo) {
        await tx.stores.taskInfo.insertOne({
          ...taskInfo,
          due: taskInfo.due ?? null,
          manualDue: taskInfo.due ?? null,
          done: taskInfo.done ?? null,
          controller: TaskController.Manual,
        }, item.id);
      }

      return item;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  public static async deleteCompleteInboxTasks(tx: CoreTransaction): Promise<void> {
    let itemsInLists = tx.knex
      .from<ServiceListItemsRecord>("ServiceListItems")
      .whereNotNull("present")
      .distinct("itemId");

    let items: ItemRecord[] = await tx.stores.items.records()
      .join("TaskInfo", "TaskInfo.id", "Item.id")
      .leftJoin("SectionItems", "Item.id", "SectionItems.id")
      .whereNotNull("TaskInfo.done")
      .whereNotIn("Item.id", itemsInLists)
      .whereNull("SectionItems.id")
      .select("Item.*");

    for (let item of items) {
      await tx.stores.items.deleteOne(item.id);
    }
  }

  protected get store(): Stores["items"] {
    return this.stores.items;
  }

  public get type(): ItemType | null {
    return this.record.type;
  }

  public get summary(): string {
    return this.record.summary;
  }

  public get created(): DateTime {
    return this.record.created;
  }

  public get snoozed(): DateTime | null {
    return this.record.snoozed;
  }

  public get archived(): DateTime | null {
    return this.record.archived;
  }

  public user(): Promise<User> {
    return assert(this.stores.users.get(this.record.userId));
  }

  public taskInfo(): Promise<TaskInfo | null> {
    return this.stores.taskInfo.get(this.id);
  }

  public detail(): Promise<ItemDetail | null> {
    switch (this.record.type) {
      case null:
        return Promise.resolve(null);
      case ItemType.File:
        return this.stores.fileDetail.get(this.id);
      case ItemType.Note:
        return this.stores.noteDetail.get(this.id);
      case ItemType.Service:
        return this.stores.serviceDetail.get(this.id);
      case ItemType.Link:
        return this.stores.linkDetail.get(this.id);
    }
  }

  public move(itemHolder: null): Promise<void>;
  public move(itemHolder: ItemHolder, before?: Item | null): Promise<void>;
  public async move(itemHolder: ItemHolder | null, before?: Item | null): Promise<void> {
    let currentSection = await this.stores.sectionItems.get(this.id);
    if (currentSection) {
      await currentSection.delete();
    }

    if (itemHolder) {
      await SectionItem.create(this.tx, this, itemHolder, before);
    }
  }
}

export class SectionItem extends OrderedBase<SectionItemsRecord, ItemHolder> {
  public static async create(
    tx: CoreTransaction,
    item: Item,
    itemHolder: ItemHolder,
    before?: Item | null,
  ): Promise<SectionItem> {
    let user = await item.user();
    let beforeSection: SectionItem | null = null;
    if (before) {
      beforeSection = await tx.stores.sectionItems.get(before.id);
      if (!beforeSection || beforeSection.record.ownerId != itemHolder.id) {
        throw new Error("Unknown before item.");
      }
    }

    return OrderedBase.insert(tx.stores.sectionItems, {
      id: item.id,
      userId: user.id,
    }, itemHolder.id, beforeSection);
  }

  protected get store(): Stores["sectionItems"] {
    return this.stores.sectionItems;
  }
}

export class TaskInfo
  extends IdentifiedBase<TaskInfoRecord> implements ResolverImpl<TaskInfoResolvers> {
  public static create(
    tx: CoreTransaction,
    item: Item,
    taskInfo: Omit<TaskInfoRecord, "id">,
  ): Promise<TaskInfo> {
    return tx.stores.taskInfo.insertOne(taskInfo, item.id);
  }

  protected get store(): Stores["taskInfo"] {
    return this.stores.taskInfo;
  }

  public get due(): DateTime | null {
    return this.record.due;
  }

  public get manualDue(): DateTime | null {
    return this.record.manualDue;
  }

  public get done(): DateTime | null {
    return this.record.done;
  }

  public get controller(): TaskController {
    return this.record.controller;
  }
}

abstract class DetailBase<Record extends Identified> extends IdentifiedBase<Record> {
}

export class LinkDetail
  extends DetailBase<LinkDetailRecord> implements ResolverImpl<LinkDetailResolvers> {
  public static create(
    tx: CoreTransaction,
    item: Item,
    record: Omit<LinkDetailRecord, "id">,
  ): Promise<LinkDetail> {
    if (item.type != ItemType.Link) {
      throw new Error(`Cannot add LinkDetail to at ${item.type}`);
    }

    return tx.stores.linkDetail.insertOne(record, item.id);
  }

  protected get store(): Stores["linkDetail"] {
    return this.stores.linkDetail;
  }

  public get url(): string {
    return this.record.url;
  }

  public get icon(): string | null {
    return this.record.icon;
  }
}

export class FileDetail
  extends DetailBase<FileDetailRecord> implements ResolverImpl<FileDetailResolvers> {
  protected get store(): Stores["fileDetail"] {
    return this.stores.fileDetail;
  }

  public get filename(): string {
    return this.record.filename;
  }

  public get mimetype(): string {
    return this.record.mimetype;
  }

  public get size(): number {
    return this.record.size;
  }
}

export class NoteDetail
  extends DetailBase<NoteDetailRecord> implements ResolverImpl<NoteDetailResolvers> {
  protected get store(): Stores["noteDetail"] {
    return this.stores.noteDetail;
  }

  public get note(): string {
    return this.record.note;
  }
}

export class ServiceDetail
  extends DetailBase<ServiceDetailRecord> implements ResolverImpl<ServiceDetailResolvers> {
  public static create(
    tx: CoreTransaction,
    item: Item,
    record: Omit<ServiceDetailRecord, "id">,
  ): Promise<ServiceDetail> {
    if (item.type != ItemType.Service) {
      throw new Error(`Cannot add ServiceDetail to at ${item.type}`);
    }

    return tx.stores.serviceDetail.insertOne(record, item.id);
  }

  protected get store(): Stores["serviceDetail"] {
    return this.stores.serviceDetail;
  }

  public get serviceId(): string {
    return this.record.serviceId;
  }

  public get hasTaskState(): boolean {
    return this.record.hasTaskState;
  }

  public get taskDue(): DateTime | null {
    return this.record.taskDue;
  }

  public get taskDone(): DateTime | null {
    return this.record.taskDone;
  }

  public async fields(): Promise<string> {
    let service = ServiceManager.getService(this.serviceId);
    let serviceTx = await buildServiceTransaction(service, this.tx.transaction);
    let item = await service.getServiceItem(serviceTx, this.id);
    return JSON.stringify(await waitFor(call(item, item.fields)));
  }

  public async lists(): Promise<ServiceList[]> {
    let records: ServiceListRecord[] = await this.tx.knex.from("ServiceList")
      .join("ServiceListItems", "ServiceList.id", "ServiceListItems.listId")
      .where("ServiceListItems.itemId", this.id)
      .select("ServiceList.*");

    return records.map(
      (record: ServiceListRecord): ServiceList => new ServiceList(this.tx, record),
    );
  }

  public async wasEverListed(): Promise<boolean> {
    return await count(this.tx.knex
      .from("ServiceListItems")
      .where("itemId", this.id)
      .limit(1))
      ? true
      : false;
  }

  public async isCurrentlyListed(): Promise<boolean> {
    return await count(this.tx.knex
      .from("ServiceListItems")
      .where("itemId", this.id)
      .whereNotNull("present")
      .limit(1))
      ? true
      : false;
  }

  public async getItemDueForLists(): Promise<DateTime | null> {
    return min<ServiceListItemsRecord, "due">(
      this.tx.knex.from<ServiceListItemsRecord>("ServiceListItems")
        .where("itemId", this.id),
      "due",
    );
  }
}

export class ServiceList
  extends IdentifiedBase<ServiceListRecord> implements ResolverImpl<ServiceListResolvers> {
  public static async create(
    tx: CoreTransaction,
    serviceId: string,
    { items, due, ...record }: ItemList,
  ): Promise<ServiceList> {
    let list = await tx.stores.serviceList.insertOne({
      serviceId,
      ...record,
    });

    if (items) {
      let now = DateTime.now();

      await tx.stores.serviceListItems.setItems(list.id, items, {
        serviceId,
        present: now,
        due: due ? now.plus(due) : null,
      });
    }

    return list;
  }

  public static async updateTaskStates(tx: CoreTransaction): Promise<void> {
    interface Record {
      id: string;
      done: DateTime | null;
      manualDue: DateTime | null;
      due: DateTime | null;
      presentCount: number | null;
      serviceDue: DateTime | null;
    }

    let now = DateTime.now();

    let presentItems = tx.knex
      .from<ServiceListItemsRecord>("ServiceListItems")
      .groupBy("itemId")
      .select({
        itemId: "itemId",
        presentCount: tx.knex.raw("COUNT(??)", "present"),
        serviceDue: tx.knex.raw("MIN(??)", "due"),
      })
      .as("PresentItems");

    let records = await tx.knex
      .from("TaskInfo")
      .leftJoin(presentItems, "TaskInfo.id", "PresentItems.itemId")
      .where("TaskInfo.controller", TaskController.ServiceList)
      .select({
        id: "TaskInfo.id",
        done: "TaskInfo.done",
        manualDue: "TaskInfo.manualDue",
        due: "TaskInfo.due",
        presentCount: "PresentItems.presentCount",
        serviceDue: "PresentItems.serviceDue",
      }) as Record[];

    for (let record of records) {
      if (record.presentCount === null) {
        // No lists left.
        await tx.stores.taskInfo.updateOne(record.id, {
          done: now,
          due: record.manualDue,
          controller: TaskController.Manual,
        });
      } else if (record.presentCount > 0) {
        // Item is not done
        let due = record.manualDue ?? record.serviceDue;
        if (record.done || record.due != due) {
          await tx.stores.taskInfo.updateOne(record.id, {
            done: null,
            due,
          });
        }
      } else if (!record.done) {
        // Item is done.
        await tx.stores.taskInfo.updateOne(record.id, {
          done: now,
          due: record.manualDue ?? record.serviceDue,
        });
      }
    }
  }

  protected get store(): Stores["serviceList"] {
    return this.stores.serviceList;
  }

  public get serviceId(): string {
    return this.record.serviceId;
  }

  public get name(): string {
    return this.record.name;
  }

  public get url(): string | null {
    return this.record.url;
  }

  public async update({
    items,
    due,
    ...record
  }: Partial<ItemList>): Promise<void> {
    if (record.name || record.url !== undefined) {
      await this.edit(record);
    }

    if (items) {
      let itemIdsToUpdate = new Set(items);

      let now = DateTime.now();

      // These are items that were already present for this list. We must update their due states.
      let existingPresentRecords = await this.tx.knex
        .from<ServiceListItemsRecord>("ServiceListItems")
        .whereIn("itemId", items)
        .andWhere({
          listId: this.id,
        })
        .whereNotNull("present");

      for (let record of existingPresentRecords) {
        itemIdsToUpdate.delete(record.itemId);

        if (due !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          let taskDue = due ? record.present!.plus(due) : null;
          if (record.due != due) {
            await this.tx.knex
              .into<ServiceListItemsRecord>("ServiceListItems")
              .where({
                itemId: record.itemId,
                listId: this.id,
              })
              .update({
                due: taskDue,
              });
          }
        }
      }

      let taskDue = due ? now.plus(due) : null;

      // Update any existing items that are newly present. We can set their due date directly.
      let existingNotPresentItemIds = await this.tx.knex
        .into<ServiceListItemsRecord>("ServiceListItems")
        .whereIn("itemId", items)
        .andWhere({
          listId: this.id,
        })
        .whereNull("present")
        .update({
          present: now,
          due: taskDue,
        })
        .returning("itemId") as string[];

      for (let itemId of existingNotPresentItemIds) {
        itemIdsToUpdate.delete(itemId);
      }

      // Create any new records.
      if (itemIdsToUpdate.size) {
        let records = Array.from(itemIdsToUpdate, (itemId: string): ServiceListItemsRecord => ({
          serviceId: this.serviceId,
          listId: this.id,
          itemId,
          present: now,
          due: taskDue,
        }));

        await this.tx.knex
          .into<ServiceListItemsRecord>("ServiceListItems")
          .insert(records);
      }

      // Mark anything else as no longer present.
      await this.tx.knex
        .into<ServiceListItemsRecord>("ServiceListItems")
        .whereNotIn("itemId", items)
        .andWhere({
          listId: this.id,
        })
        .update({
          present: null,
          due: null,
        });
    } else if (due !== undefined) {
      // Must update all due states.
      let records = await this.tx.knex
        .from<ServiceListItemsRecord>("ServiceListItems")
        .where({
          listId: this.id,
        })
        .whereNotNull("present");

      for (let record of records) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let taskDue = due ? record.present!.plus(due) : null;
        if (record.due != due) {
          await this.tx.knex
            .into<ServiceListItemsRecord>("ServiceListItems")
            .where({
              listId: this.id,
              itemId: record.itemId,
            })
            .update({
              due: taskDue,
            });
        }
      }
    }

    if (items && due !== undefined) {
      if (!due) {
        await this.tx.knex
          .into<ServiceListItemsRecord>("ServiceListItems")
          .where("listId", this.id)
          .whereIn("itemId", items)
          .update({
            due: null,
          });
        return;
      }

      let records = await this.tx.knex
        .from<ServiceListItemsRecord>("ServiceListItems")
        .where("listId", this.id)
        .whereIn("itemId", items)
        .whereNotNull("present");

      for (let record of records) {
        await this.tx.knex
          .into<ServiceListItemsRecord>("ServiceListItems")
          .where({
            listId: this.id,
            itemId: record.itemId,
          })
          .update({
            due: record.present?.plus(due) ?? null,
          });
      }
    }
  }

  public override async delete(): Promise<void> {
    let currentIds = await this.tx.stores.serviceListItems.getItemIds(this.id);

    await super.delete();

    let presentIds = this.tx.knex
      .from<ServiceListItemsRecord>("ServiceListItems")
      .whereIn("itemId", currentIds)
      .whereNotNull("present")
      .distinct("itemId");

    let done = DateTime.now();
    await this.tx.knex
      .into("TaskInfo")
      .whereIn("id", currentIds)
      .whereNotIn("id", presentIds)
      .where("controller", TaskController.ServiceList)
      .whereNull("done")
      .update({
        done,
      });
  }
}
