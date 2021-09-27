import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import { DateTime } from "luxon";

import type { Sql, WhereConditions } from "#db";
import {
  In,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  sql,
  where,
} from "#db";
import { TaskController } from "#schema";
import type {
  ContextItemsArgs,
  ContextParams,
  ContextProjectByIdArgs,
  ProjectParams,
  SectionParams,
  TaskInfoParams,
  TaskListItemsArgs,
  UserInboxArgs,
  ItemParams,
  ItemFilter,
} from "#schema";
import type { ItemList, ResolverImpl, Transaction, Store } from "#server/utils";
import {
  id,
  IdentifiedEntityImpl,
  ref,
  storeBuilder,
  EntityImpl,
} from "#server/utils";
import type { RelativeDateTime } from "#utils";
import { addOffset, call, memoized, waitFor } from "#utils";

import type { UserState } from "./controllers";
import type {
  ContextEntity,
  FileDetailEntity,
  ItemEntity,
  ItemHolderEntity,
  ItemPropertyEntity,
  LinkDetailEntity,
  NoteDetailEntity,
  ProjectEntity,
  SectionEntity,
  ServiceDetailEntity,
  ServiceListEntity,
  ServiceListItemEntity,
  TaskInfoEntity,
  TaskListEntity,
  UserEntity,
} from "./entities";
import { ItemType } from "./entities";
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
import { buildServiceTransaction } from "./transaction";

export type TaskList = Project | Context;
export type ItemHolder = TaskList | Section;
export type ItemDetail = NoteDetail | LinkDetail | ServiceDetail | FileDetail;

function isSet(val: unknown): boolean {
  return val !== undefined && val !== null;
}

function todo(): never {
  throw new Error("Not yet implemented");
}

type ItemSetParams = {
  [K in keyof ItemEntity as `Item.${K}`]: ItemEntity[K];
} &
  {
    [K in keyof TaskInfoEntity as `TaskInfo.${K}`]: TaskInfoEntity[K];
  };

export class ItemSet implements ResolverImpl<ItemSetResolvers> {
  private readonly query: Sql;

  public constructor(
    protected readonly tx: Transaction,
    conditions: WhereConditions<ItemSetParams>,
    private readonly order: Sql,
    filter: ItemFilter | null = null,
  ) {
    let tables = sql`
      ${ref(Item)} AS "Item"
      LEFT JOIN ${ref(TaskInfo)} AS "TaskInfo" USING ("id")
    `;

    if (filter) {
      if (
        isSet(filter.isTask) ||
        filter.dueAfter ||
        filter.dueBefore ||
        filter.isPending === false
      ) {
        if (filter.dueBefore || filter.dueAfter) {
          conditions["TaskInfo.due"] = Not(IsNull());

          let now = DateTime.now();
          if (filter.dueBefore) {
            let dueBefore = DateTime.isDateTime(filter.dueBefore)
              ? filter.dueBefore
              : addOffset(now, filter.dueBefore);
            conditions["TaskInfo.due"] = LessThanOrEqual(dueBefore);
          }
          if (filter.dueAfter) {
            let dueAfter = DateTime.isDateTime(filter.dueAfter)
              ? filter.dueAfter
              : addOffset(now, filter.dueAfter);
            conditions["TaskInfo.due"] = MoreThan(dueAfter);
          }
        }
        if (filter.isPending === false) {
          conditions["TaskInfo.done"] = Not(IsNull());
        }
      } else if (filter.isPending) {
        conditions["TaskInfo.done"] = IsNull();
      }
      if (filter.isSnoozed === true) {
        conditions["Item.snoozed"] = Not(IsNull());
      } else if (filter.isSnoozed === false) {
        conditions["Item.snoozed"] = IsNull();
      }
      if (filter.isArchived === true) {
        conditions["Item.archived"] = Not(IsNull());
      } else if (filter.isArchived === false) {
        conditions["Item.archived"] = IsNull();
      }
    }

    this.query = sql`${tables} WHERE ${where(conditions)}`;
  }

  public async count(): Promise<number> {
    return this.tx.db.value<number>(
      sql`SELECT COUNT(*)::integer FROM ${this.query}`,
    );
  }

  public async items(): Promise<Item[]> {
    return Item.store(this.tx).list(
      sql`SELECT "Item".* FROM ${this.query} ORDER BY ${this.order}`,
    );
  }
}

export class User
  extends IdentifiedEntityImpl<UserEntity>
  implements ResolverImpl<UserResolvers>
{
  public static readonly store = storeBuilder(User, "core.User");

  public static async create(
    tx: Transaction,
    userRecord: Omit<UserEntity, "id">,
  ): Promise<User> {
    let user = await User.store(tx).create({
      ...userRecord,
      id: await id(),
      password: await bcryptHash(userRecord.password, 12),
    });

    await Context.create(tx, user, {
      name: "Tasks",
    });

    return user;
  }

  public get state(): UserState {
    return {
      email: this.email,
      isAdmin: this.isAdmin,
    };
  }

  public get email(): string {
    return this.entity.email;
  }

  public get isAdmin(): boolean {
    return this.entity.isAdmin;
  }

  public async setPassword(password: string): Promise<void> {
    await this.update({
      password: await bcryptHash(password, 12),
    });
  }

  public verifyUser(password: string): Promise<boolean> {
    return bcryptCompare(password, this.entity.password);
  }

  public async contexts(): Promise<Context[]> {
    return Context.store(this.tx).find({ userId: this.id });
  }

  public async inbox({ filter }: UserInboxArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Item.sectionId": IsNull(),
      },
      sql`"Item"."created" DESC`,
      filter,
    );
  }
}

export abstract class ItemHolderBase<
  Entity extends ItemHolderEntity,
> extends IdentifiedEntityImpl<Entity> {
  public static async getItemHolder(
    tx: Transaction,
    id: string,
  ): Promise<ItemHolder | null> {
    let context = await Context.store(tx).findOne({ id });
    if (context) {
      return context;
    }

    let project = await Project.store(tx).findOne({ id });
    if (project) {
      return project;
    }

    return Section.store(tx).findOne({ id });
  }

  public async section(): Promise<Section> {
    return Section.store(this.tx).get(this.id);
  }

  public async items({ filter }: TaskListItemsArgs): Promise<ItemSet> {
    let section = await this.section();
    return section.items({ filter });
  }
}

export abstract class TaskListBase<
  Entity extends TaskListEntity,
> extends ItemHolderBase<Entity> {
  public static async getTaskList(
    tx: Transaction,
    id: string,
  ): Promise<TaskList | null> {
    let context = await Context.store(tx).findOne({ id });
    if (context) {
      return context;
    }

    return Project.store(tx).findOne({ id });
  }

  public readonly user = memoized(async function (
    this: TaskListBase<TaskListEntity>,
  ): Promise<User> {
    return User.store(this.tx).get(this.entity.userId);
  });

  public abstract context(): Promise<Context>;

  public subprojects(): Promise<Project[]> {
    return Project.store(this.tx).find({
      parentId: this.id,
    });
  }

  public async sections(): Promise<Section[]> {
    return Section.store(this.tx).find({
      projectId: this.id,
      index: MoreThanOrEqual(0),
    });
  }
}

export class Context
  extends TaskListBase<ContextEntity>
  implements ResolverImpl<ContextResolvers>
{
  public static readonly store = storeBuilder(Context, "core.Context");

  public static async create(
    tx: Transaction,
    user: User,
    params: ContextParams,
  ): Promise<Context> {
    let context = await Context.store(tx).create({
      ...params,
      id: await id(),
      userId: user.id,
    });

    await Project.store(tx).create({
      id: context.id,
      userId: user.id,
      contextId: context.id,
      parentId: null,
      name: "",
    });

    await Section.store(tx).create({
      id: context.id,
      userId: user.id,
      projectId: context.id,
      index: -1,
      name: "",
    });

    return context;
  }

  public get name(): string {
    return this.entity.name;
  }

  public get stub(): string {
    return this.entity.stub;
  }

  public context(): Promise<Context> {
    return Promise.resolve(this);
  }

  public projects(): Promise<Project[]> {
    return Project.store(this.tx).find({
      contextId: this.id,
      parentId: Not(IsNull()),
    });
  }

  public projectById({ id }: ContextProjectByIdArgs): Promise<Project | null> {
    return Project.store(this.tx).findOne({
      contextId: this.id,
      parentId: Not(IsNull()),
      id,
    });
  }
}

export class Project
  extends TaskListBase<ProjectEntity>
  implements ResolverImpl<ProjectResolvers>
{
  public static readonly store = storeBuilder(Project, "core.Project");

  public static async create(
    tx: Transaction,
    taskList: TaskList,
    params: ProjectParams,
  ): Promise<Project> {
    let user = await taskList.user();
    let context = await taskList.context();

    let project = await Project.store(tx).create({
      ...params,
      id: await id(),
      userId: user.id,
      contextId: context.id,
      parentId: taskList.id,
    });

    await Section.store(tx).create({
      id: project.id,
      userId: user.id,
      projectId: project.id,
      index: -1,
      name: "",
    });

    return project;
  }

  public get name(): string {
    return this.entity.name;
  }

  public get stub(): string {
    return this.entity.stub;
  }

  public context(): Promise<Context> {
    return Context.store(this.tx).get(this.entity.contextId);
  }

  public readonly taskList = memoized(async function (
    this: Project,
  ): Promise<TaskList> {
    if (this.entity.parentId) {
      return this.store.get(this.entity.parentId);
    }

    return this.context();
  });

  public async move(taskList: TaskList): Promise<void> {
    await this.update({
      parentId: taskList.id,
    });
  }
}

export class Section
  extends ItemHolderBase<SectionEntity>
  implements ResolverImpl<SectionResolvers>
{
  public static readonly store = storeBuilder(Section, "core.Section");

  public static async create(
    tx: Transaction,
    taskList: TaskList,
    before: Section | null,
    params: SectionParams,
  ): Promise<Section> {
    let index: number;

    if (before) {
      index = before.entity.index;
      await Section.store(tx).update(
        { index: sql`"index" + 1` },
        {
          projectId: taskList.id,
          index: MoreThanOrEqual(index),
        },
      );
    } else {
      index =
        (await tx.db.value<number | null>(sql`
          SELECT MAX("index") + 1
          FROM ${ref(Section)}
          WHERE ${where({
            projectId: taskList.id,
            index: MoreThanOrEqual(0),
          })}
        `)) ?? 0;
    }

    return Section.store(tx).create({
      ...params,
      id: await id(),
      projectId: taskList.id,
      index,
    });
  }

  public get name(): string {
    return this.entity.name;
  }

  public override section(): Promise<Section> {
    return Promise.resolve(this);
  }

  public async move(
    _taskList: TaskList,
    _before: Section | null,
  ): Promise<void> {
    todo();
  }

  public override async items({ filter }: ContextItemsArgs): Promise<ItemSet> {
    return new ItemSet(
      this.tx,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Item.sectionId": this.id,
      },
      sql`"Item"."sectionIndex" ASC`,
      filter,
    );
  }
}

export class Item
  extends IdentifiedEntityImpl<ItemEntity>
  implements ResolverImpl<ItemResolvers>
{
  public static readonly store = storeBuilder(Item, "core.Item");

  public static async create(
    tx: Transaction,
    user: User,
    type: ItemType | null,
    itemParams: ItemParams,
    taskInfo?: TaskInfoParams | null,
  ): Promise<Item> {
    try {
      let item = await Item.store(tx).create({
        ...itemParams,
        id: await id(),
        archived: itemParams.archived ?? null,
        snoozed: itemParams.snoozed ?? null,
        userId: user.id,
        type,
      });

      if (taskInfo) {
        await TaskInfo.store(tx).create({
          id: item.id,
          manualDue: taskInfo.due ?? null,
          manualDone: taskInfo.done ?? null,
          controller: TaskController.Manual,
        });
      }

      return item;
    } catch (error) {
      tx.segment.error("Error creating item", { error });
      throw error;
    }
  }

  public static async deleteCompleteInboxTasks(tx: Transaction): Promise<void> {
    return tx.segment.inSegment("Item.deleteCompleteInboxTasks", () => {
      let itemsInLists = sql`
      SELECT DISTINCT "itemId"
      FROM ${ref(ServiceListItem)}
      WHERE "done" IS NULL
    `;

      let items = sql`
      SELECT "Item"."id"
      FROM ${ref(Item)} AS "Item"
        JOIN ${ref(TaskInfo)} AS "TaskInfo" USING ("id")
      WHERE
        "TaskInfo"."done" IS NOT NULL AND
        "Item"."id" NOT IN (${itemsInLists}) AND
        "Item"."sectionId" IS NULL
    `;

      return tx.db.update(
        sql`DELETE FROM ${ref(Item)} WHERE "id" IN (${items})`,
      );
    });
  }

  public get type(): ItemType | null {
    return this.entity.type;
  }

  public get summary(): string {
    return this.entity.summary;
  }

  public get created(): DateTime {
    return this.entity.created;
  }

  public get snoozed(): DateTime | null {
    return this.entity.snoozed;
  }

  public get archived(): DateTime | null {
    return this.entity.archived;
  }

  public readonly user = memoized(async function (this: Item): Promise<User> {
    return User.store(this.tx).get(this.entity.userId);
  });

  public get taskInfo(): Promise<TaskInfo | null> {
    return TaskInfo.store(this.tx).findOne({ id: this.id });
  }

  public get detail(): Promise<ItemDetail | null> {
    switch (this.entity.type) {
      case null:
        return Promise.resolve(null);
      case ItemType.File:
        return FileDetail.store(this.tx).findOne({ id: this.id });
      case ItemType.Note:
        return NoteDetail.store(this.tx).findOne({ id: this.id });
      case ItemType.Service:
        return ServiceDetail.store(this.tx).findOne({ id: this.id });
      case ItemType.Link:
        return LinkDetail.store(this.tx).findOne({ id: this.id });
    }
  }

  public move(itemHolder: null): Promise<void>;
  public move(itemHolder: ItemHolder, before?: Item | null): Promise<void>;
  public async move(
    itemHolder: ItemHolder | null,
    before?: Item | null,
  ): Promise<void> {
    if (itemHolder) {
      let section = await itemHolder.section();
      let index: number;

      if (before) {
        if (section.id != before.entity.sectionId) {
          throw new Error("Reference item is not in the same section");
        }

        index = before.entity.sectionIndex;
        await this.store.update(
          { sectionIndex: sql`"index" + 1` },
          {
            sectionId: section.id,
            sectionIndex: MoreThanOrEqual(index),
          },
        );
      } else {
        index =
          (await this.db.value<number | null>(sql`
            SELECT MAX("sectionIndex") + 1
            FROM ${ref(this)}
            WHERE "sectionId" = ${section.id}
          `)) ?? 0;
      }

      await this.update({
        sectionId: section.id,
        sectionIndex: index,
      });
    } else {
      await this.update({
        sectionId: null,
        sectionIndex: 0,
      });
    }
  }
}

abstract class ItemProperty<
  Entity extends ItemPropertyEntity,
> extends IdentifiedEntityImpl<Entity> {
  public get itemId(): string {
    return this.id;
  }

  public readonly item = memoized(async function (
    this: ItemProperty<Entity>,
  ): Promise<Item> {
    return Item.store(this.tx).get(this.itemId);
  });
}

export class TaskInfo
  extends ItemProperty<TaskInfoEntity>
  implements ResolverImpl<TaskInfoResolvers>
{
  public static readonly store = storeBuilder(TaskInfo, "core.TaskInfo");

  public static async create(
    tx: Transaction,
    item: Item,
    taskInfo: Omit<TaskInfoEntity, "id" | "due" | "done">,
  ): Promise<TaskInfo> {
    let task = await TaskInfo.store(tx).create({
      ...taskInfo,
      due:
        taskInfo.controller == TaskController.Manual
          ? taskInfo.manualDue
          : null,
      done:
        taskInfo.controller == TaskController.Manual
          ? taskInfo.manualDone
          : null,
      id: item.id,
    });

    if (taskInfo.controller != TaskController.Manual) {
      await TaskInfo.updateTaskDetails(tx, [item.id]);
    }

    return task;
  }

  public static async updateTaskDetails(
    tx: Transaction,
    items?: string[],
  ): Promise<void> {
    if (items?.length == 0) {
      return;
    }

    return tx.segment.inSegment("TaskInfo.updateTaskDetails", () => {
      let listStates = sql`
        SELECT
          "itemId" AS "id",
          MIN("due") AS "due",
          CASE COUNT(*) - COUNT("done") WHEN 0 THEN MAX("done") ELSE NULL END AS "done"
        FROM ${ref(ServiceListItem)}
        GROUP BY "itemId"
      `;

      let serviceStates = sql`
        SELECT "id", "taskDue" AS "due", "taskDone" AS "done"
        FROM ${ref(ServiceDetail)}
        WHERE "hasTaskState" = ${true}
      `;

      let states = sql`
        SELECT
          "TaskInfo"."id" AS "id",
          COALESCE("TaskInfo"."manualDue", CASE "TaskInfo"."controller"
            WHEN ${TaskController.Service} THEN "ServiceStates"."due"
            WHEN ${TaskController.ServiceList} THEN "ListStates"."due"
          END) AS "due",
          CASE "TaskInfo"."controller"
            WHEN ${TaskController.Service} THEN "ServiceStates"."done"
            WHEN ${TaskController.ServiceList} THEN "ListStates"."done"
            ELSE "TaskInfo"."manualDone"
          END AS "done"
        FROM ${ref(TaskInfo)} AS "TaskInfo"
        LEFT JOIN (${listStates}) AS "ListStates" USING ("id")
        LEFT JOIN (${serviceStates}) AS "ServiceStates" USING ("id")
      `;

      if (items) {
        states = sql`${states} WHERE ${where({ id: In(items) })}`;
      }

      return tx.db.update(sql`
        UPDATE ${ref(TaskInfo)} AS "t"
        SET
          "id" = "s"."id",
          "due" = "s"."due",
          "done" = "s"."done"
        FROM (${states}) AS "s"
        WHERE "t"."id" = "s"."id"
      `);
    });
  }

  public get due(): DateTime | null {
    return this.entity.due;
  }

  public get done(): DateTime | null {
    return this.entity.done;
  }

  public get manualDue(): DateTime | null {
    return this.entity.manualDue;
  }

  public get manualDone(): DateTime | null {
    return this.entity.manualDone;
  }

  public get controller(): TaskController {
    return this.entity.controller;
  }

  public override async update({
    due,
    done,
    ...taskInfo
  }: Partial<Omit<TaskInfoEntity, "id">>): Promise<void> {
    if ((taskInfo.controller ?? this.controller) == TaskController.Manual) {
      // A manual task, simple to calculate.
      await super.update({
        ...taskInfo,
        due:
          taskInfo.manualDue === undefined
            ? this.entity.manualDue
            : taskInfo.manualDue,
        done:
          taskInfo.manualDone === undefined
            ? this.entity.manualDone
            : taskInfo.manualDone,
      });
    } else if (!taskInfo.controller || taskInfo.controller == this.controller) {
      // We're not changing the controller, done doesn't need to change and due only needs to change
      // if manualDue is set.
      let needsRecalc = taskInfo.manualDue === null && this.entity.manualDue;

      await super.update({
        ...taskInfo,
        due: taskInfo.manualDue ?? this.entity.due,
      });

      if (needsRecalc) {
        await TaskInfo.updateTaskDetails(this.tx, [this.itemId]);
      }
    } else {
      // Do a full recalculation.

      await super.update({
        ...taskInfo,
      });

      await TaskInfo.updateTaskDetails(this.tx, [this.itemId]);
    }
  }
}

abstract class ItemDetailImpl<
  Entity extends ItemPropertyEntity,
> extends ItemProperty<Entity> {
  protected static createImpl<
    E extends ItemPropertyEntity,
    I extends ItemDetailImpl<E>,
  >(
    store: Store<Transaction, E, I>,
    item: Item,
    type: ItemType,
    record: Omit<E, "id">,
  ): Promise<I> {
    if (item.type != type) {
      throw new Error(
        `Cannot add ${type} detail to an item of type ${item.type}`,
      );
    }

    // @ts-ignore
    return store.create({
      ...record,
      id: item.id,
    });
  }
}

export class LinkDetail
  extends ItemDetailImpl<LinkDetailEntity>
  implements ResolverImpl<LinkDetailResolvers>
{
  public static readonly store = storeBuilder(LinkDetail, "core.LinkDetail");

  public static create(
    tx: Transaction,
    item: Item,
    record: Omit<LinkDetailEntity, "id">,
  ): Promise<LinkDetail> {
    return ItemDetailImpl.createImpl(
      LinkDetail.store(tx),
      item,
      ItemType.Link,
      record,
    );
  }

  public get url(): string {
    return this.entity.url;
  }

  public get icon(): string | null {
    return this.entity.icon;
  }
}

export class FileDetail
  extends ItemDetailImpl<FileDetailEntity>
  implements ResolverImpl<FileDetailResolvers>
{
  public static readonly store = storeBuilder(FileDetail, "core.FileDetail");

  public static create(
    tx: Transaction,
    item: Item,
    record: Omit<FileDetailEntity, "id">,
  ): Promise<FileDetail> {
    return ItemDetailImpl.createImpl(
      FileDetail.store(tx),
      item,
      ItemType.File,
      record,
    );
  }

  public get filename(): string {
    return this.entity.filename;
  }

  public get mimetype(): string {
    return this.entity.mimetype;
  }

  public get size(): number {
    return this.entity.size;
  }
}

export class NoteDetail
  extends ItemDetailImpl<NoteDetailEntity>
  implements ResolverImpl<NoteDetailResolvers>
{
  public static readonly store = storeBuilder(NoteDetail, "core.NoteDetail");

  public static create(
    tx: Transaction,
    item: Item,
    record: Omit<NoteDetailEntity, "id">,
  ): Promise<NoteDetail> {
    return ItemDetailImpl.createImpl(
      NoteDetail.store(tx),
      item,
      ItemType.Note,
      record,
    );
  }

  public get note(): string {
    return this.entity.note;
  }
}

export class ServiceDetail
  extends ItemDetailImpl<ServiceDetailEntity>
  implements ResolverImpl<ServiceDetailResolvers>
{
  public static readonly store = storeBuilder(
    ServiceDetail,
    "core.ServiceDetail",
  );

  public static create(
    tx: Transaction,
    item: Item,
    record: Omit<ServiceDetailEntity, "id">,
  ): Promise<ServiceDetail> {
    return ItemDetailImpl.createImpl(
      ServiceDetail.store(tx),
      item,
      ItemType.Service,
      record,
    );
  }

  public get serviceId(): string {
    return this.entity.serviceId;
  }

  public get hasTaskState(): boolean {
    return this.entity.hasTaskState;
  }

  public get taskDue(): DateTime | null {
    return this.entity.taskDue;
  }

  public get taskDone(): DateTime | null {
    return this.entity.taskDone;
  }

  public async fields(): Promise<string> {
    let service = ServiceManager.getService(this.serviceId);
    let serviceTx = await buildServiceTransaction(service, this.tx);
    let item = await service.getServiceItem(serviceTx, this.itemId);
    return JSON.stringify(await waitFor(call(item, item.fields)));
  }

  public async lists(): Promise<ServiceList[]> {
    return ServiceList.store(this.tx).list(sql`
      SELECT "ServiceList".* FROM ${ref(ServiceListItem)} AS "ServiceListItem"
        LEFT JOIN ${ref(
          ServiceList,
        )} AS "ServiceList" ON "ServiceListItem"."listId"="ServiceList"."id"
      WHERE ${where({
        itemId: this.itemId,
        done: IsNull(),
      })}
    `);
  }

  public async wasEverListed(): Promise<boolean> {
    let count = await ServiceListItem.store(this.tx).count({
      itemId: this.itemId,
    });
    return count > 0;
  }

  public async isCurrentlyListed(): Promise<boolean> {
    let count = await ServiceListItem.store(this.tx).count({
      itemId: this.itemId,
      done: IsNull(),
    });
    return count > 0;
  }
}

function calcDue(
  now: DateTime,
  offset: RelativeDateTime | null | undefined,
): DateTime | null {
  if (!offset) {
    return null;
  }

  if (DateTime.isDateTime(offset)) {
    return offset;
  }

  return addOffset(now, offset);
}

export class ServiceList
  extends IdentifiedEntityImpl<ServiceListEntity>
  implements ResolverImpl<ServiceListResolvers>
{
  public static readonly store = storeBuilder(ServiceList, "core.ServiceList");

  public static async create(
    tx: Transaction,
    serviceId: string,
    { items, due, ...entity }: ItemList,
  ): Promise<ServiceList> {
    let list = await ServiceList.store(tx).create({
      ...entity,
      id: await id(),
      serviceId,
    });

    if (items) {
      await list.setItems(items, due);
    }

    return list;
  }

  public get serviceId(): string {
    return this.entity.serviceId;
  }

  public get name(): string {
    return this.entity.name;
  }

  public get url(): string | null {
    return this.entity.url;
  }

  protected async setItems(
    itemIds: string[],
    due?: RelativeDateTime | null,
  ): Promise<void> {
    return this.tx.segment.inSegment("ServiceList.setItems", async () => {
      let now = DateTime.now();
      let itemDue = calcDue(now, due);

      let itemIdsToUpdate = new Set<string>(itemIds);
      let itemsToCreate = new Set(itemIds);

      let existingPlacements = await ServiceListItem.store(this.tx).find({
        listId: this.id,
      });
      let placements: ServiceListItemEntity[] = [];

      for (let placement of existingPlacements) {
        itemIdsToUpdate.add(placement.entity.itemId);

        if (itemsToCreate.has(placement.entity.itemId)) {
          itemsToCreate.delete(placement.entity.itemId);

          placements.push(placement.entity);
          placement.entity.done = null;

          if (due !== undefined) {
            placement.entity.due = calcDue(placement.entity.present, due);
          }
        } else if (placement.entity.done === null) {
          placements.push(placement.entity);
          placement.entity.done = DateTime.now();
        }
      }

      for (let itemId of itemsToCreate) {
        placements.push({
          itemId,
          serviceId: this.serviceId,
          listId: this.id,
          present: now,
          done: null,
          due: itemDue,
        });
      }

      await ServiceListItem.store(this.tx).upsert(placements);
      await TaskInfo.updateTaskDetails(this.tx, [...itemIdsToUpdate]);
    });
  }

  public async updateList({
    items,
    due,
    ...record
  }: Partial<ItemList>): Promise<void> {
    if (record.name || record.url !== undefined) {
      await this.update(record);
    }

    if (items) {
      await this.setItems(items, due);
    }
  }

  public override async delete(): Promise<void> {
    return this.tx.segment.inSegment("ServiceList.delete", async () => {
      let currentIds = await this.db.pluck<string>(
        sql`SELECT "itemId" FROM ${ref(ServiceListItem)} WHERE "listId" = ${
          this.id
        }`,
      );

      await super.delete();

      let presentIds = await this.db.pluck<string>(
        sql`SELECT DISTINCT "itemId" FROM ${ref(ServiceListItem)} WHERE ${where(
          {
            itemId: In(currentIds),
            present: Not(IsNull()),
          },
        )}`,
      );

      let idsToUpdate = currentIds.filter(
        (id: string): boolean => !presentIds.includes(id),
      );

      let done = DateTime.now();
      await TaskInfo.store(this.tx).update(
        { done },
        {
          id: In(idsToUpdate),
          controller: TaskController.ServiceList,
          done: IsNull(),
        },
      );
    });
  }
}

class ServiceListItem extends EntityImpl<ServiceListItemEntity> {
  public static readonly store = storeBuilder(
    ServiceListItem,
    "core.ServiceListItem",
    ["listId", "itemId"],
  );
}
