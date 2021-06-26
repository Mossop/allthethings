import { TaskController } from "@allthethings/schema";
import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Knex } from "knex";
import type { Duration } from "luxon";
import { DateTime } from "luxon";

import type { PluginList } from "../plugins/types";
import type { ResolverContext } from "../schema/context";
import type { ItemSetResolvers } from "../schema/resolvers";
import type {
  ItemSetArchivedArgs,
  ItemSetDueArgs,
  ItemSetIsTaskArgs,
  ItemSetSnoozedArgs,
} from "../schema/types";
import type { DatabaseConnection } from "./connection";
import { id } from "./connection";
import type { ImplBuilder } from "./implementations";
import * as Impl from "./implementations";
import * as Db from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

type DbInsertObject<T> = Db.DbInsertObject<T>;
type DbObject<T> = Db.DbObject<T>;

export enum SectionIndex {
  Anonymous = -1,
  Inbox = -2,
}

function nameForSection(type: SectionIndex): string {
  switch (type) {
    case SectionIndex.Anonymous:
      return "";
    case SectionIndex.Inbox:
      return "inbox";
  }
}

function classBuilder<I, T>(
  cls: new (dataSources: AppDataSources, dbObject: DbObject<T>) => I,
): ImplBuilder<I, T> {
  return (
    dataSources: AppDataSources,
    dbObject: DbObject<T>,
  ) => new cls(dataSources, dbObject);
}

async function max<D, C extends keyof DbObject<D>>(
  query: Knex.QueryBuilder<D, D[]>,
  col: C,
): Promise<DbObject<D>[C] | null> {
  let result: { max: DbObject<D>[C] | null } | undefined = await query.max(col).first();
  return result ? result.max : null;
}

async function min<D, C extends keyof DbObject<D>>(
  query: Knex.QueryBuilder<D, D[]>,
  col: C,
): Promise<DbObject<D>[C] | null> {
  let result: { min: DbObject<D>[C] | null } | undefined = await query.min(col).first();
  return result ? result.min : null;
}

async function count(query: Knex.QueryBuilder): Promise<number | null> {
  let result: { count: BigInt | null } | undefined = await query.count("*").first();
  return result ? Number(result.count) : null;
}

export type PartialId<T> = Omit<T, "id"> & { id?: string };

interface ItemSetState {
  taskJoined?: boolean;
}

export class ItemSet implements Omit<ItemSetResolvers, "__resolveType"> {
  public constructor(
    protected readonly query: Knex.QueryBuilder,
    protected readonly state: ItemSetState = {},
  ) {
  }

  protected inner(query: Knex.QueryBuilder, state: Partial<ItemSetState> = {}): ItemSet {
    return new ItemSet(query, {
      ...this.state,
      ...state,
    });
  }

  public async count(
    parent: ItemSet,
    args: unknown,
    context: ResolverContext,
  ): Promise<number> {
    return (await this.items(parent, args, context)).length;
  }

  public async items(
    parent: ItemSet,
    args: unknown,
    context: ResolverContext,
  ): Promise<Impl.Item[]> {
    let records = await this.query.select("Item.*") as DbObject<Db.ItemDbTable>[];
    return records.map(
      (record: DbObject<Db.ItemDbTable>): Impl.Item => new Impl.Item(context.dataSources, record),
    );
  }

  public snoozed(
    parent: ItemSet,
    { isSnoozed }: ItemSetSnoozedArgs,
  ): ItemSet {
    isSnoozed = isSnoozed ?? true;

    if (isSnoozed) {
      return this.inner(
        this.query.clone()
          .whereNotNull("Item.snoozed")
          .where("Item.snoozed", ">", DateTime.now()),
      );
    }

    return this.inner(
      this.query.clone()
        .where((builder: Knex.QueryBuilder) => {
          void builder.whereNull("Item.snoozed")
            .orWhere("Item.snoozed", "<=", DateTime.now());
        }),
    );
  }

  public archived(
    parent: ItemSet,
    { isArchived }: ItemSetArchivedArgs,
  ): ItemSet {
    isArchived = isArchived ?? true;

    if (isArchived) {
      return this.inner(
        this.query.clone()
          .whereNotNull("Item.archived"),
      );
    }

    return this.inner(
      this.query.clone()
        .whereNull("Item.archived"),
    );
  }

  public due(
    parent: ItemSet,
    { before, after }: ItemSetDueArgs,
  ): ItemSet {
    if (!before && !after) {
      before = DateTime.now();
    }

    let query = this.query.clone();

    if (!this.state.taskJoined) {
      query = query.join("TaskInfo", "TaskInfo.id", "Item.id");
    }

    if (before) {
      query = query.where("TaskInfo.due", "<=", before);
    }

    if (after) {
      query = query.where("TaskInfo.due", ">", after);
    }

    return this.inner(query, { taskJoined: true });
  }

  public isTask(
    parent: ItemSet,
    { done }: ItemSetIsTaskArgs,
  ): ItemSet {
    let query = this.query.clone();

    if (!this.state.taskJoined) {
      query = query.join("TaskInfo", "TaskInfo.id", "Item.id");
    }

    if (done === true) {
      query = query.whereNotNull("TaskInfo.done");
    } else if (done === false) {
      query = query.whereNull("TaskInfo.done");
    }

    return this.inner(query, { taskJoined: true });
  }

  public sortBy(field: keyof DbObject<Db.ItemDbTable>, descending: boolean = false): ItemSet {
    return this.inner(
      this.query.clone().orderBy(field, descending ? "desc" : "asc"),
    );
  }
}

export abstract class DbDataSource<
  I extends { id: () => string },
  T extends Db.DbTable = Db.DbTable,
> extends DataSource<ResolverContext> {
  public readonly abstract tableName: string;
  protected abstract builder(dataSources: AppDataSources, dbObject: DbObject<T>): I;
  private _db: DatabaseConnection | null = null;
  private context: { dataSources: AppDataSources } | null = null;

  /**
   * The server datasources.
   */
  protected get dataSources(): AppDataSources {
    if (!this.context) {
      throw new Error("Not initialized.");
    }

    return this.context.dataSources;
  }

  /**
   * The database connection. This may be in a transaction.
   */
  public get connection(): DatabaseConnection {
    if (!this._db) {
      throw new Error("Not initialized.");
    }

    return this._db;
  }

  /**
   * Raw access to the knex instance. This may be in a transaction.
   */
  public get knex(): Knex {
    return this.connection.knex;
  }

  public initialize(config: DataSourceConfig<ResolverContext>): void {
    this._db = config.context.db;
    this.context = config.context;
  }

  public init(db: DatabaseConnection, dataSources: AppDataSources): void {
    this._db = db;
    this.context = { dataSources };
  }

  /**
   * Generates a column reference.
   */
  public ref(field: keyof DbObject<T> | "*"): string {
    return `${this.tableName}.${field}`;
  }

  /**
   * Typed access to the table for this datasource.
   */
  public get table(): Knex.QueryBuilder<T, T[]> {
    return this.knex.table(this.tableName);
  }

  /**
   * A filtered view of the table for this datasource which ignores anonymous records.
   */
  public get records(): Knex.QueryBuilder<T, T[]> {
    return this.table;
  }

  /**
   * Given a query returns all the matching records.
   */
  public select(query: Knex.QueryBuilder<T, T[]>): Promise<DbObject<T>[]> {
    return query.select(this.ref("*")) as Promise<DbObject<T>[]>;
  }

  /**
   * Given a query returns the first matching record.
   */
  public first(query: Knex.QueryBuilder<T, T[]>): Promise<DbObject<T> | null> {
    return query.first(this.ref("*")) as Promise<DbObject<T> | null>;
  }

  /**
   * Converts the DB record into the high-level implementation instance.
   */
  protected build(dbObject: PromiseLike<DbObject<T>>): Promise<I>;
  protected build(dbObject: PromiseLike<Maybe<DbObject<T>>>): Promise<I | null>;
  protected async build(dbObject: PromiseLike<Maybe<DbObject<T>>>): Promise<I | null> {
    dbObject = await dbObject;
    if (!dbObject) {
      return null;
    }
    return this.builder(this.dataSources, dbObject);
  }

  /**
   * Converts the DB records into the high-level implementation instances.
   */
  protected buildAll(dbObjects: PromiseLike<DbObject<T>[]>): Promise<I[]>;
  protected buildAll(dbObjects: PromiseLike<Maybe<DbObject<T>>[]>): Promise<(I | null)[]>;
  protected async buildAll(dbObjects: PromiseLike<Maybe<DbObject<T>>[]>): Promise<(I | null)[]> {
    dbObjects = await dbObjects;
    return await Promise.all(
      dbObjects.map((obj: Maybe<DbObject<T>>): Promise<I | null> => this.build(obj)),
    );
  }

  /**
   * Gets the DB record with the given ID.
   */
  public async getRecord(id: string): Promise<DbObject<T> | null> {
    return this.first(this.table.whereIn(this.ref("id"), [id]));
  }

  /**
   * Gets the high-level implementation with the given ID.
   */
  public async getImpl(id: string): Promise<I | null> {
    return this.build(await this.getRecord(id));
  }

  /**
   * Finds an instance that matches the given fields.
   */
  public async find(fields: Partial<DbObject<T>>): Promise<I[]> {
    return this.buildAll(this.select(this.records.where(fields)));
  }

  /**
   * Inserts a DB record into the database.
   */
  public async insert(item: DbInsertObject<T>): Promise<DbObject<T>> {
    // @ts-ignore
    let results = await this.table.insert(item).returning("*");

    if (!results.length) {
      throw new Error("Unexpectedly failed to create a record.");
    } else if (results.length == 1) {
      return results[0] as DbObject<T>;
    } else {
      throw new Error("Unexpectedly created multiple records.");
    }
  }

  /**
   * Updates a DB record in the database.
   */
  public async updateOne(id: string, item: Db.DbUpdateObject<T>): Promise<DbObject<T> | null> {
    // @ts-ignore
    let results: DbObject<T>[] = await this.table
      .where(this.ref("id"), id)
      // @ts-ignore
      .update(item)
      .returning("*");
    if (!results.length) {
      return null;
    } else if (results.length > 1) {
      throw new Error("Unexpectedly updated mutiple records.");
    } else {
      return results[0];
    }
  }

  /**
   * Deletes a DB record from the database.
   */
  public delete(id: string): Promise<void> {
    return this.table.where(this.ref("id"), id).delete();
  }
}

export abstract class IndexedDbDataSource<
  I extends { id: () => string },
  T extends Db.DbTable<Db.IndexedDbEntity> = Db.DbTable<Db.IndexedDbEntity>,
> extends DbDataSource<I, T> {
  protected async nextIndex(owner: string): Promise<number> {
    let index = await max(this.records.where("ownerId", owner), "index");
    return index !== null ? index + 1 : 0;
  }

  public async find(fields: Partial<DbObject<T>>): Promise<I[]> {
    return this.buildAll(this.select(this.records.where(fields).orderBy("index")));
  }

  public async move(
    itemId: string,
    targetOwner: string,
    beforeId: string | null,
  ): Promise<void> {
    let current = await this.getRecord(itemId);
    if (!current) {
      return;
    }

    let currentIndex = current.index;
    let currentOwner = current.ownerId;

    let targetIndex: number;
    let before = beforeId ? await this.getRecord(beforeId) : null;

    if (before && before.ownerId == targetOwner) {
      targetIndex = before.index;

      await this.records
        .where("ownerId", targetOwner)
        .andWhere("index", ">=", targetIndex)
        // @ts-ignore
        .update({
          index: this.knex.raw("?? + 1", ["index"]),
        });
    } else {
      targetIndex = await this.nextIndex(targetOwner);
    }

    await this.records
      .where("id", itemId)
      // @ts-ignore
      .update({
        ownerId: targetOwner,
        index: targetIndex,
      });

    await this.records
      .where("ownerId", currentOwner)
      .andWhere("index", ">", currentIndex)
      // @ts-ignore
      .update({
        index: this.knex.raw("?? - 1", ["index"]),
      });
  }

  public async delete(id: string): Promise<void> {
    let item = await this.getRecord(id);
    if (!item) {
      return;
    }

    await this.table.where(this.ref("id"), id).delete();

    await this.table
      .where("ownerId", item.ownerId)
      .andWhere("index", ">", item.index)
      // @ts-ignore
      .update({
        index: this.knex.raw("?? - 1", ["index"]),
      });
  }
}

export class UserDataSource extends DbDataSource<Impl.User, Db.UserDbTable> {
  public tableName = "User";
  protected builder = classBuilder<Impl.User, Db.UserDbTable>(Impl.User);

  public async assertIsAdmin(userId: string): Promise<void> {
    let record = await this.getRecord(userId);
    if (!record?.isAdmin) {
      throw new Error("Not an admin user.");
    }
  }

  public async verifyUser(email: string, password: string): Promise<Impl.User | null> {
    let user = await this.first(this.table.where({
      email,
    }));

    if (!user) {
      return null;
    }

    if (await bcryptCompare(password, user.password)) {
      return this.build(user);
    }

    return null;
  }

  public async changePassword(
    id: string,
    oldPass: string,
    newPass: string,
  ): Promise<Impl.User | null> {
    let record = await this.getRecord(id);
    if (!record) {
      return null;
    }

    if (await bcryptCompare(oldPass, record.password)) {
      await this.updateOne(id, {
        password: await bcryptHash(newPass, 12),
      });
      return this.build(record);
    }

    throw new Error("Invalid password.");
  }

  public async create(params: Omit<Db.DbInsertObject<Db.UserDbTable>, "id">): Promise<Impl.User> {
    let user = await this.build(this.insert({
      id: await id(),
      ...params,
      password: await bcryptHash(params.password, 12),
    }));

    await this.dataSources.contexts.create(user, {
      name: "",
    });

    await this.dataSources.sections.createSpecialSection(user.id(), SectionIndex.Inbox);

    return user;
  }
}

export class ContextDataSource extends DbDataSource<
  Impl.Context,
  Db.ContextDbTable
> {
  public tableName = "Context";
  protected builder = classBuilder<Impl.Context, Db.ContextDbTable>(Impl.Context);

  public get records(): Knex.QueryBuilder<Db.ContextDbTable, Db.ContextDbTable[]> {
    return this.table.where("name", "<>", "");
  }

  public async getUser(contextId: string): Promise<Impl.User | null> {
    let record = await this.first(this.table.where("id", contextId));
    if (!record) {
      return null;
    }

    return this.dataSources.users.getImpl(record.userId);
  }

  public async create(
    user: Impl.User,
    params: Omit<DbInsertObject<Db.ContextDbTable>, "id" | "userId">,
  ): Promise<Impl.Context> {
    let context = await this.build(this.insert({
      id: params.name == "" ? user.id() : await id(),
      ...params,
      userId: user.id(),
    }));

    await this.dataSources.projects.create(context, {
      name: "",
    });

    return context;
  }
}

export class ProjectDataSource extends DbDataSource<
  Impl.Project,
  Db.ProjectDbTable
> {
  public tableName = "Project";
  protected builder = classBuilder<Impl.Project, Db.ProjectDbTable>(Impl.Project);

  public get records(): Knex.QueryBuilder<Db.ProjectDbTable, Db.ProjectDbTable[]> {
    return this.table.where("name", "<>", "");
  }

  public async create(
    taskList: Impl.User | Impl.Context | Impl.Project,
    params: Omit<DbInsertObject<Db.ProjectDbTable>, "id" | "contextId" | "parentId">,
  ): Promise<Impl.Project> {
    let context = taskList instanceof Impl.Project
      ? await taskList.context() ?? await taskList.user()
      : taskList;

    let project = await this.build(this.insert({
      id: params.name == "" ? taskList.id() : await id(),
      contextId: context.id(),
      ...params,
      parentId: params.name == "" ? null : taskList.id(),
    }));

    await this.dataSources.sections.createSpecialSection(
      project.id(),
      SectionIndex.Anonymous,
    );

    return project;
  }
}

export class SectionDataSource extends IndexedDbDataSource<
  Impl.Section,
  Db.SectionDbTable
> {
  public tableName = "Section";
  protected builder = classBuilder<Impl.Section, Db.SectionDbTable>(Impl.Section);

  public get records(): Knex.QueryBuilder<Db.SectionDbTable, Db.SectionDbTable[]> {
    return this.table.where("index", ">=", 0);
  }

  public async getSection(id: string): Promise<Impl.Section | Impl.Inbox | null> {
    let record = await this.getRecord(id);
    if (!record) {
      return null;
    }

    if (record.index >= SectionIndex.Anonymous) {
      return new Impl.Section(this.dataSources, record);
    }

    switch (record.index) {
      case SectionIndex.Inbox:
        return new Impl.Inbox(this.dataSources, record);
    }

    return null;
  }

  public async getSpecialSection(
    ownerId: string,
    type: SectionIndex,
  ): Promise<DbObject<Db.SectionDbTable> | null> {
    let record = await this.table.where({
      ownerId,
      index: type,
    }).first();

    return record ?? null;
  }

  public async createSpecialSection(
    ownerId: string,
    type: SectionIndex,
  ): Promise<Impl.Section> {
    let newId = type == SectionIndex.Anonymous ? ownerId : await id();

    return this.build(this.insert({
      id: newId,
      name: nameForSection(type),
      ownerId,
      index: type,
    }));
  }

  public async create(
    project: Impl.User | Impl.Context | Impl.Project,
    before: string | null,
    params: Omit<DbInsertObject<Db.SectionDbTable>, "id" | "ownerId" | "index">,
  ): Promise<Impl.Section> {
    let index: number;

    if (params.name == "") {
      index = SectionIndex.Anonymous;
    } else if (before) {
      let record = await this.records
        .where({
          ownerId: project.id(),
          id: before,
        })
        .first();
      if (record !== undefined) {
        await this.table.where({
          ownerId: project.id(),
        }).andWhere("index", ">=", record.index).update("index", this.knex.raw(":index: + 1", {
          index: "index",
        }));
      }

      index = record?.index ?? await this.nextIndex(project.id());
    } else {
      index = await this.nextIndex(project.id());
    }

    return this.build(this.insert({
      id: params.name == "" ? project.id() : await id(),
      ...params,
      ownerId: project.id(),
      index,
    }));
  }
}

export class ItemDataSource extends IndexedDbDataSource<Impl.Item, Db.ItemDbTable> {
  public tableName = "Item";
  protected builder = classBuilder<Impl.Item, Db.ItemDbTable>(Impl.Item);

  public async create(
    owner: Impl.TaskList | Impl.Section | Impl.Inbox,
    params: Omit<DbInsertObject<Db.ItemDbTable>, "id" | "ownerId" | "index">,
  ): Promise<Impl.Item> {
    return this.build(this.insert({
      id: await id(),
      ownerId: owner.id(),
      index: await this.nextIndex(owner.id()),
      ...params,
    }));
  }

  public async deleteCompleteInboxTasks(): Promise<void> {
    let itemsInLists = this.knex
      .from<Db.PluginListItemsDbTable>("PluginListItems")
      .whereNotNull("present")
      .distinct("itemId");

    let items = await this.select(this.records
      .join("TaskInfo", "TaskInfo.id", this.ref("id"))
      .join("Section", this.ref("ownerId"), "Section.id")
      .whereNotNull("TaskInfo.done")
      .whereNotIn(this.ref("id"), itemsInLists)
      .where("Section.index", SectionIndex.Inbox));

    for (let item of items) {
      await this.delete(item.id);
    }
  }

  public findItems(fields: Partial<DbObject<Db.ItemDbTable>>): ItemSet {
    return new ItemSet(
      this.records.where(fields).orderBy("index"),
    );
  }

  public projectItems(project: string): ItemSet {
    return new ItemSet(
      this.records
        .join("Section", "Section.id", "Item.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .where("Project.id", project),
    );
  }

  public contextItems(context: string): ItemSet {
    return new ItemSet(
      this.records
        .join("Section", "Section.id", "Item.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .join("Context", "Context.id", "Project.contextId")
        .where("Context.id", context),
    );
  }

  public userItems(user: string): ItemSet {
    return new ItemSet(
      this.records
        .join("Section", "Section.id", "Item.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .join("Context", "Context.id", "Project.contextId")
        .join("User", "User.id", "Context.userId")
        .where("User.id", user),
    );
  }

  public listSpecialSection(
    owner: string,
    type: SectionIndex,
  ): ItemSet {
    return new ItemSet(
      this.records
        .join("Section", "Section.id", "Item.ownerId")
        .where("Section.ownerId", owner)
        .andWhere("Section.index", type)
        .orderBy("Item.index"),
    );
  }
}

export class TaskInfoSource extends DbDataSource<Impl.TaskInfo, Db.TaskInfoDbTable> {
  public tableName = "TaskInfo";
  protected builder = classBuilder<Impl.TaskInfo, Db.TaskInfoDbTable>(Impl.TaskInfo);

  public async create(
    item: Impl.Item,
    params: Omit<DbInsertObject<Db.TaskInfoDbTable>, "id">,
  ): Promise<Impl.TaskInfo> {
    return this.build(this.insert({
      ...params,
      id: item.id(),
    }));
  }
}

export class LinkDetailSource extends DbDataSource<Impl.LinkDetail, Db.LinkDetailDbTable> {
  public tableName = "LinkDetail";
  protected builder = classBuilder<Impl.LinkDetail, Db.LinkDetailDbTable>(Impl.LinkDetail);

  public async create(
    item: Impl.Item,
    params: Omit<DbInsertObject<Db.LinkDetailDbTable>, "id">,
  ): Promise<Impl.LinkDetail> {
    let type = await item.type();
    if (Db.ItemType.Link != type) {
      throw new Error(`Attempt to add link detail to a '${type}' item.`);
    }

    return this.build(this.insert({
      ...params,
      id: item.id(),
    }));
  }
}

export class NoteDetailSource extends DbDataSource<Impl.NoteDetail, Db.NoteDetailDbTable> {
  public tableName = "NoteDetail";
  protected builder = classBuilder<Impl.NoteDetail, Db.NoteDetailDbTable>(Impl.NoteDetail);

  public async create(
    item: Impl.Item,
    params: Omit<DbInsertObject<Db.NoteDetailDbTable>, "id">,
  ): Promise<Impl.NoteDetail> {
    let type = await item.type();
    if (Db.ItemType.Note != type) {
      throw new Error(`Attempt to add note detail to a '${type}' item.`);
    }

    return this.build(this.insert({
      ...params,
      id: item.id(),
    }));
  }
}

export class FileDetailSource extends DbDataSource<Impl.FileDetail, Db.FileDetailDbTable> {
  public tableName = "FileDetail";
  protected builder = classBuilder<Impl.FileDetail, Db.FileDetailDbTable>(Impl.FileDetail);

  public async create(
    item: Impl.Item,
    params: Omit<DbInsertObject<Db.FileDetailDbTable>, "id">,
  ): Promise<Impl.FileDetail> {
    let type = await item.type();
    if (Db.ItemType.File != type) {
      throw new Error(`Attempt to add file detail to a '${type}' item.`);
    }

    return this.build(this.insert({
      ...params,
      id: item.id(),
    }));
  }
}

export class PluginDetailSource extends DbDataSource<Impl.PluginDetail, Db.PluginDetailDbTable> {
  public tableName = "PluginDetail";
  protected builder = classBuilder<Impl.PluginDetail, Db.PluginDetailDbTable>(Impl.PluginDetail);

  public async create(
    item: Impl.Item,
    params: Omit<DbInsertObject<Db.PluginDetailDbTable>, "id">,
  ): Promise<Impl.PluginDetail> {
    let type = await item.type();
    if (Db.ItemType.Plugin != type) {
      throw new Error(`Attempt to add plugin detail to a '${type}' item.`);
    }

    return this.build(this.insert({
      ...params,
      id: item.id(),
    }));
  }
}

export class PluginListSource extends DbDataSource<Impl.PluginList, Db.PluginListDbTable> {
  public tableName = "PluginList";
  protected builder = classBuilder<Impl.PluginList, Db.PluginListDbTable>(Impl.PluginList);

  public async getItemDue(itemId: string): Promise<DateTime | null> {
    return min(
      this.knex.from<Db.PluginListItemsDbTable>("PluginListItems")
        .where("itemId", itemId),
      "due",
    );
  }

  public async getListsForItem(itemId: string): Promise<Impl.PluginList[]> {
    return this.buildAll(
      this.records
        .join("PluginListItems", "PluginListItems.listId", "PluginList.id")
        .where("PluginListItems.itemId", itemId),
    );
  }

  public async wasItemEverListed(id: string): Promise<boolean> {
    return await count(this.knex
      .from("PluginListItems")
      .where("itemId", id))
      ? true
      : false;
  }

  public async isItemCurrentlyListed(id: string): Promise<boolean> {
    return await count(this.knex
      .from("PluginListItems")
      .where("itemId", id)
      .whereNotNull("present"))
      ? true
      : false;
  }

  private async updateDue(listId: string, ids: string[], due: Duration | null): Promise<void> {
    if (!due) {
      await this.knex
        .into<Db.PluginListItemsDbTable>("PluginListItems")
        .where("listId", listId)
        .whereIn("id", ids)
        .update({
          due: null,
        });
      return;
    }

    let records = await this.knex
      .from<Db.PluginListItemsDbTable>("PluginListItems")
      .where("listId", listId)
      .whereIn("id", ids)
      .whereNotNull("present");

    for (let record of records) {
      await this.knex
        .into<Db.PluginListItemsDbTable>("PluginListItems")
        .where({
          listId,
          itemId: record.itemId,
        })
        .update({
          due: record.present?.plus(due) ?? null,
        });
    }
  }

  public async updateTaskStates(): Promise<void> {
    interface Record {
      id: string;
      done: DateTime | null;
      manualDue: DateTime | null;
      due: DateTime | null;
      presentCount: number | null;
      pluginDue: DateTime | null;
    }

    let now = DateTime.now();

    let presentItems = this.knex
      .from<Db.PluginListItemsDbTable>("PluginListItems")
      .groupBy("itemId")
      .select({
        itemId: "itemId",
        presentCount: this.knex.raw("COUNT(??)", "present"),
        pluginDue: this.knex.raw("MIN(??)", "due"),
      })
      .as("PresentItems");

    let records = await this.knex
      .from("TaskInfo")
      .leftJoin(presentItems, "TaskInfo.id", "PresentItems.itemId")
      .where("TaskInfo.controller", TaskController.PluginList)
      .select({
        id: "TaskInfo.id",
        done: "TaskInfo.done",
        manualDue: "TaskInfo.manualDue",
        due: "TaskInfo.due",
        presentCount: "PresentItems.presentCount",
        pluginDue: "PresentItems.pluginDue",
      }) as Record[];

    for (let record of records) {
      if (record.presentCount === null) {
        // No lists left.
        await this.dataSources.taskInfo.updateOne(record.id, {
          done: now,
          due: record.manualDue,
          controller: TaskController.Manual,
        });
      } else if (record.presentCount > 0) {
        // Item is not done
        let due = record.manualDue ?? record.pluginDue;
        if (record.done || record.due != due) {
          await this.dataSources.taskInfo.updateOne(record.id, {
            done: null,
            due,
          });
        }
      } else if (!record.done) {
        // Item is done.
        await this.dataSources.taskInfo.updateOne(record.id, {
          done: now,
          due: record.manualDue ?? record.pluginDue,
        });
      }
    }
  }

  public async addList(pluginId: string, list: PluginList): Promise<string> {
    let listId = await id();

    await this.insert({
      id: listId,
      pluginId,
      name: list.name,
      url: list.url,
    });

    if (list.items) {
      let now = DateTime.now();
      let due: DateTime | null = null;
      if (list.due) {
        due = now.plus(list.due);
      }
      let records = list.items.map((itemId: string): Db.PluginListItem => ({
        pluginId,
        listId,
        itemId,
        present: now,
        due,
      }));

      await this.knex
        .into<Db.PluginListItemsDbTable>("PluginListItems")
        .insert(records);
    }

    return listId;
  }

  public async updateList(pluginId: string, id: string, list: Partial<PluginList>): Promise<void> {
    if (list.name || list.url) {
      await this.table
        .where({
          [this.ref("id")]: id,
          [this.ref("pluginId")]: pluginId,
        })
        .update({
          name: list.name,
          url: list.url,
        });
    }

    let alreadyPresentIds: string[] = [];

    if (list.items) {
      let itemIdsToUpdate = new Set(list.items);

      let now = DateTime.now();
      let due: DateTime | null = null;
      if (list.due) {
        due = now.plus(list.due);
      }

      // These are items that were already present for this list. We must update their due states.
      let existingPresentRecords = await this.knex
        .from<Db.PluginListItemsDbTable>("PluginListItems")
        .whereIn("itemId", list.items)
        .andWhere({
          pluginId,
          listId: id,
        })
        .whereNotNull("present");

      for (let record of existingPresentRecords) {
        itemIdsToUpdate.delete(record.itemId);

        if (list.due !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          let due = list.due ? record.present!.plus(list.due) : null;
          if (record.due != due) {
            await this.knex
              .into<Db.PluginListItemsDbTable>("PluginListItems")
              .where({
                itemId: record.itemId,
                listId: id,
              })
              .update({
                due,
              });
          }
        }
      }

      // Update any existing items that are newly present. We can set their due date directly.
      let existingNotPresentItemIds = await this.knex
        .into<Db.PluginListItemsDbTable>("PluginListItems")
        .whereIn("itemId", list.items)
        .andWhere({
          pluginId,
          listId: id,
        })
        .whereNull("present")
        .update({
          present: now,
          due,
        })
        .returning("itemId") as string[];

      for (let itemId of existingNotPresentItemIds) {
        itemIdsToUpdate.delete(itemId);
      }

      // Create any new records.
      if (itemIdsToUpdate.size) {
        let records = Array.from(itemIdsToUpdate, (itemId: string): Db.PluginListItem => ({
          pluginId,
          listId: id,
          itemId,
          present: now,
          due,
        }));

        await this.knex
          .into<Db.PluginListItemsDbTable>("PluginListItems")
          .insert(records);
      }

      // Mark anything else as no longer present.
      await this.knex
        .into<Db.PluginListItemsDbTable>("PluginListItems")
        .whereNotIn("itemId", list.items)
        .andWhere({
          pluginId,
          listId: id,
        })
        .update({
          present: null,
          due: null,
        });
    } else if (list.due !== undefined) {
      // Must update all due states.
      let records = await this.knex
        .from<Db.PluginListItemsDbTable>("PluginListItems")
        .where({
          pluginId,
          listId: id,
        })
        .whereNotNull("present");

      for (let record of records) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let due = list.due ? record.present!.plus(list.due) : null;
        if (record.due != due) {
          await this.knex
            .into<Db.PluginListItemsDbTable>("PluginListItems")
            .where({
              pluginId,
              listId: id,
              itemId: record.itemId,
            })
            .update({
              due,
            });
        }
      }
    }

    if (list.due !== undefined) {
      await this.updateDue(id, alreadyPresentIds, list.due);
    }
  }

  public async deleteList(pluginId: string, id: string): Promise<void> {
    await this.table
      .where({
        [this.ref("id")]: id,
        [this.ref("pluginId")]: pluginId,
      })
      .delete();

    let presentIds = this.knex
      .from<Db.PluginListItemsDbTable>("PluginListItems")
      .whereNotNull("present")
      .distinct("itemId");

    let done = DateTime.now();
    await this.knex
      .into<Db.TaskInfoDbTable>("TaskInfo")
      .whereNotIn("id", presentIds)
      .where("controller", TaskController.PluginList)
      .whereNull("done")
      .update({
        done,
      });
  }
}

export class AppDataSources {
  public users: UserDataSource;
  public contexts: ContextDataSource;
  public projects: ProjectDataSource;
  public sections: SectionDataSource;
  public items: ItemDataSource;
  public taskInfo: TaskInfoSource;
  public fileDetail: FileDetailSource;
  public pluginDetail: PluginDetailSource;
  public noteDetail: NoteDetailSource;
  public linkDetail: LinkDetailSource;
  public pluginList: PluginListSource;

  public constructor(db?: DatabaseConnection) {
    this.users = new UserDataSource();
    this.contexts = new ContextDataSource();
    this.projects = new ProjectDataSource();
    this.sections = new SectionDataSource();
    this.items = new ItemDataSource();
    this.taskInfo = new TaskInfoSource();
    this.fileDetail = new FileDetailSource();
    this.pluginDetail = new PluginDetailSource();
    this.noteDetail = new NoteDetailSource();
    this.linkDetail = new LinkDetailSource();
    this.pluginList = new PluginListSource();

    if (db) {
      for (let source of Object.values(this)) {
        if (source instanceof DbDataSource) {
          source.init(db, this);
        }
      }
    }
  }

  public async getItemTarget(
    id: string,
  ): Promise<Impl.TaskList | Impl.Section | Impl.Inbox | null> {
    let section = await this.sections.getSection(id);
    if (!section || section instanceof Impl.Inbox) {
      return section;
    }

    if (await section.index() != SectionIndex.Anonymous) {
      return section;
    }

    let project = await this.projects.getRecord(id);
    if (!project) {
      return null;
    }

    if (project.contextId != id) {
      return new Impl.Project(this, project);
    }

    let context = await this.contexts.getRecord(id);
    if (!context) {
      return null;
    }

    if (context.userId != id) {
      return new Impl.Context(this, context);
    }

    return this.users.getImpl(id);
  }

  public async ensureSanity(): Promise<void> {
    await this.pluginList.updateTaskStates();
    await this.items.deleteCompleteInboxTasks();
  }
}
