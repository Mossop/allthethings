/* eslint-disable @typescript-eslint/naming-convention */
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import { DateTime } from "luxon";

import type { Sql } from "../../db";
import {
  any,
  all,
  In,
  IsNull,
  MoreThanOrEqual,
  Not,
  sql,
  where,
} from "../../db";
import type { Awaitable, RelativeDateTime } from "../../utils";
import { addOffset, call, memoized, waitFor } from "../../utils";
import type { ItemList, ResolverImpl, Transaction, Store } from "../utils";
import {
  TaskController,
  id,
  IdentifiedEntityImpl,
  ref,
  storeBuilder,
  EntityImpl,
} from "../utils";
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
import type { UserResolvers } from "./schema";
import { ServiceManager } from "./services";
import { buildServiceTransaction } from "./transaction";

export type TaskList = Project | Context;
export type ItemHolder = TaskList | Section;
export type ItemDetail = NoteDetail | LinkDetail | ServiceDetail | FileDetail;

function todo(): never {
  throw new Error("Not yet implemented");
}

export interface ItemFilter {
  itemHolderId?: string | null;
  isTask?: boolean;
  dueBefore?: DateTime;
  dueAfter?: DateTime;
  doneBefore?: DateTime;
  doneAfter?: DateTime;
  isDue?: boolean;
  isDone?: boolean;
  isSnoozed?: boolean;
  isArchived?: boolean;
}

function filterToSql(filter: ItemFilter): Sql {
  let conditions: Sql[] = [];

  if (filter.itemHolderId) {
    conditions.push(sql`"Item"."sectionId" = ${filter.itemHolderId}`);
  } else if (filter.itemHolderId === null) {
    conditions.push(sql`"Item"."sectionId" IS NULL`);
  }

  if (filter.isTask) {
    conditions.push(sql`"TaskInfo"."id" IS NOT NULL`);
  } else if (filter.isTask === false) {
    conditions.push(sql`"TaskInfo"."id" IS NULL`);
  }

  if (filter.dueBefore) {
    conditions.push(sql`"TaskInfo"."due" < ${filter.dueBefore}`);
  }
  if (filter.dueAfter) {
    conditions.push(sql`"TaskInfo"."due" > ${filter.dueAfter}`);
  }

  if (filter.doneBefore) {
    conditions.push(sql`"TaskInfo"."done" < ${filter.doneBefore}`);
  }
  if (filter.doneAfter) {
    conditions.push(sql`"TaskInfo"."done" > ${filter.doneAfter}`);
  }

  if (filter.isDone) {
    conditions.push(sql`"TaskInfo"."done" IS NOT NULL`);
  } else if (filter.isDone === false) {
    conditions.push(sql`"TaskInfo"."done" IS NULL`);
  }

  if (filter.isDue) {
    conditions.push(sql`"TaskInfo"."due" IS NOT NULL`);
  } else if (filter.isDue === false) {
    conditions.push(sql`"TaskInfo"."due" IS NULL`);
  }

  if (filter.isSnoozed) {
    conditions.push(sql`"Item"."snoozed" > ${DateTime.now()}`);
  } else if (filter.isSnoozed === false) {
    conditions.push(
      sql`("Item"."snoozed" <= ${DateTime.now()} OR "Item"."snoozed" IS NULL)`,
    );
  }

  if (filter.isArchived) {
    conditions.push(sql`"Item"."archived" IS NOT NULL`);
  } else if (filter.isArchived === false) {
    conditions.push(sql`"Item"."archived" IS NULL`);
  }

  return all(conditions);
}

function filtersToSql(filters: ItemFilter | ItemFilter[]): Sql {
  if (!Array.isArray(filters)) {
    return filterToSql(filters);
  }

  return any(filters.map(filterToSql));
}

export type UserParams = Omit<UserEntity, "id">;

export type UserState = Omit<UserEntity, "password"> & {
  __typename: "User";
};

export class User
  extends IdentifiedEntityImpl<UserEntity>
  implements ResolverImpl<UserResolvers>
{
  public static readonly store = storeBuilder(User, "core.User");

  public static async create(
    tx: Transaction,
    userRecord: UserParams,
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
      __typename: "User",
      id: this.id,
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

  public override async update({
    ...params
  }: Partial<UserParams>): Promise<void> {
    if (params.password) {
      params.password = await bcryptHash(params.password, 12);
    }

    return super.update(params);
  }

  public verifyUser(password: string): Promise<boolean> {
    return bcryptCompare(password, this.entity.password);
  }

  public async contexts(): Promise<Context[]> {
    return Context.store(this.tx).find({ userId: this.id });
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

export type ContextParams = Omit<ContextEntity, "id" | "userId" | "stub">;

export type ContextState = ContextParams &
  Pick<ContextEntity, "id" | "stub"> & {
    __typename: "Context";
  };

export class Context extends TaskListBase<ContextEntity> {
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

  public get state(): ContextState {
    return {
      __typename: "Context",
      id: this.id,
      stub: this.stub,
      name: this.name,
    };
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
}

export type ProjectParams = Omit<
  ProjectEntity,
  "id" | "contextId" | "userId" | "parentId" | "stub"
>;

export type ProjectState = ProjectParams &
  Pick<ProjectEntity, "id" | "parentId" | "stub"> & {
    __typename: "Project";
  };

export class Project extends TaskListBase<ProjectEntity> {
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

  public get state(): ProjectState {
    return {
      __typename: "Project",
      id: this.id,
      parentId:
        this.entity.parentId == this.entity.contextId
          ? null
          : this.entity.parentId,
      stub: this.stub,
      name: this.name,
    };
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

export type SectionParams = Omit<
  SectionEntity,
  "id" | "userId" | "projectId" | "index" | "stub"
>;

export type SectionState = SectionParams &
  Pick<SectionEntity, "id" | "stub"> & {
    __typename: "Section";
  };

export class Section extends ItemHolderBase<SectionEntity> {
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
      userId: taskList.entity.userId,
      projectId: taskList.id,
      index,
    });
  }

  public get name(): string {
    return this.entity.name;
  }

  public get state(): SectionState {
    return {
      __typename: "Section",
      id: this.id,
      stub: this.entity.stub,
      name: this.name,
    };
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
}

export type ItemParams = Omit<
  ItemEntity,
  "id" | "userId" | "sectionId" | "sectionIndex" | "type" | "created"
>;

export type ItemState = ItemParams &
  Pick<ItemEntity, "id" | "created"> & {
    __typename: "Item";
    taskInfo: TaskInfoState | null;
    detail: ItemDetailState | null;
  };

export class Item extends IdentifiedEntityImpl<ItemEntity> {
  public static readonly store = storeBuilder(Item, "core.Item");

  public static async create(
    tx: Transaction,
    user: User,
    type: ItemType | null,
    itemParams: ItemParams,
  ): Promise<Item> {
    try {
      let item = await Item.store(tx).create({
        ...itemParams,
        id: await id(),
        archived: itemParams.archived,
        snoozed: itemParams.snoozed,
        userId: user.id,
        type,
      });

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

  private static listQuery(
    filters: ItemFilter | ItemFilter[] | null | undefined,
  ): Sql {
    let tables = sql`
      FROM ${ref(Item)} AS "Item"
        LEFT JOIN ${ref(TaskInfo)} AS "TaskInfo" USING ("id")
    `;

    if (filters) {
      return sql`${tables} WHERE ${filtersToSql(filters)}`;
    }

    return tables;
  }

  public static count(
    tx: Transaction,
    filters?: ItemFilter | ItemFilter[] | null,
  ): Promise<number> {
    return tx.db.value(
      sql`SELECT COUNT(*)::integer ${Item.listQuery(filters)}`,
    );
  }

  public static list(
    tx: Transaction,
    filters?: ItemFilter | ItemFilter[] | null,
  ): Promise<Item[]> {
    return Item.store(tx).list(sql`
      SELECT "Item".* ${Item.listQuery(filters)}
      ORDER BY "Item"."sectionIndex" ASC, "Item"."created" DESC
    `);
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

  public get state(): Promise<ItemState> {
    return (async (): Promise<ItemState> => {
      let taskInfo = await this.taskInfo;
      let detail = await this.detail;

      return {
        __typename: "Item",
        id: this.id,
        summary: this.summary,
        archived: this.archived,
        snoozed: this.snoozed,
        created: this.created,
        taskInfo: taskInfo?.state ?? null,
        detail: detail ? await detail.state : null,
      };
    })();
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

export type TaskInfoState = Pick<
  TaskInfoEntity,
  "due" | "done" | "controller"
> & {
  __typename: "TaskInfo";
};

export class TaskInfo extends ItemProperty<TaskInfoEntity> {
  public static readonly store = storeBuilder(TaskInfo, "core.TaskInfo");

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

  public get state(): TaskInfoState {
    return {
      __typename: "TaskInfo",
      due: this.due,
      done: this.done,
      controller: this.controller,
    };
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

export type ItemDetailState =
  | LinkDetailState
  | NoteDetailState
  | ServiceDetailState
  | FileDetailState;

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

  public abstract get state(): Awaitable<ItemDetailState>;
}

export type LinkDetailParams = Omit<LinkDetailEntity, "id" | "icon">;

export type LinkDetailState = LinkDetailParams &
  Pick<LinkDetailEntity, "icon"> & {
    __typename: "LinkDetail";
  };

export class LinkDetail extends ItemDetailImpl<LinkDetailEntity> {
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

  public get state(): LinkDetailState {
    return {
      __typename: "LinkDetail",
      url: this.url,
      icon: this.icon,
    };
  }
}

export type FileDetailParams = Omit<
  FileDetailEntity,
  "id" | "path" | "size" | "mimetype"
>;

export type FileDetailState = FileDetailParams &
  Pick<FileDetailEntity, "size" | "mimetype"> & {
    __typename: "FileDetail";
  };

export class FileDetail extends ItemDetailImpl<FileDetailEntity> {
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

  public get state(): FileDetailState {
    return {
      __typename: "FileDetail",
      filename: this.filename,
      size: this.size,
      mimetype: this.mimetype,
    };
  }
}

export type NoteDetailParams = Omit<NoteDetailEntity, "id" | "url">;

export type NoteDetailState = NoteDetailParams & {
  __typename: "NoteDetail";
};

export class NoteDetail extends ItemDetailImpl<NoteDetailEntity> {
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

  public get state(): NoteDetailState {
    return {
      __typename: "NoteDetail",
      note: this.note,
    };
  }
}

export type ServiceDetailState = Omit<
  ServiceDetailEntity,
  "id" | "taskDue" | "taskDone"
> & {
  __typename: "ServiceDetail";
  wasEverListed: boolean;
  isCurrentlyListed: boolean;
  fields: unknown;
  lists: ServiceListState[];
};

export class ServiceDetail extends ItemDetailImpl<ServiceDetailEntity> {
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

  public get state(): Promise<ServiceDetailState> {
    return (async (): Promise<ServiceDetailState> => {
      let lists = await this.lists();

      return {
        __typename: "ServiceDetail",
        serviceId: this.serviceId,
        hasTaskState: this.hasTaskState,
        wasEverListed: await this.wasEverListed(),
        isCurrentlyListed: lists.length > 0,
        lists: lists.map((list: ServiceList): ServiceListState => list.state),
        fields: JSON.parse(await this.fields()),
      };
    })();
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

export type ServiceListState = ServiceListEntity & {
  __typename: "ServiceList";
};

export class ServiceList extends IdentifiedEntityImpl<ServiceListEntity> {
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

  public get state(): ServiceListState {
    return {
      __typename: "ServiceList",
      ...this.entity,
    };
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

export class ServiceListItem extends EntityImpl<ServiceListItemEntity> {
  public static readonly store = storeBuilder(
    ServiceListItem,
    "core.ServiceListItem",
    ["listId", "itemId"],
  );
}
