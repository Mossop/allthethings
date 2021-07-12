import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Knex } from "knex";
import type { Duration } from "luxon";
import { DateTime } from "luxon";

import { TaskController } from "#schema";
import type { ItemFilter } from "#schema";
import type { PluginList } from "#server-utils";

import type { ResolverContext } from "../schema/context";
import type { ItemSetResolvers } from "../schema/resolvers";
import type { DatabaseConnection } from "./connection";
import { id } from "./connection";
import type { ImplBuilder } from "./implementations";
import * as Impl from "./implementations";
import * as Db from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

type DbInsertObject<T> = Db.DbInsertObject<T>;
type DbObject<T> = Db.DbObject<T>;

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

function isSet(val: unknown): boolean {
  return val !== undefined && val !== null;
}

export class ItemSet implements Omit<ItemSetResolvers, "__resolveType"> {
  protected readonly query: Knex.QueryBuilder;

  public constructor(
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

  public async records(): Promise<DbObject<Db.ItemDbTable>[]> {
    return this.query.select("Item.*");
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

  public override initialize(config: DataSourceConfig<ResolverContext>): void {
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

type IndexedRecord = Db.DbEntity & Db.IndexedDbEntity;
abstract class IndexedDbDataSource<
  I extends { id: () => string },
  T extends Db.DbTable = Db.DbTable,
> extends DbDataSource<I, T> {
  public readonly abstract indexTableName: string;

  protected get indexTable(): Knex.QueryBuilder<IndexedRecord, IndexedRecord[]> {
    return this.knex<IndexedRecord>(this.indexTableName);
  }

  public async nextIndex(owner: string): Promise<number> {
    let index = await max(this.indexTable.where("ownerId", owner), "index");
    return index !== null ? index + 1 : 0;
  }

  public async move(
    itemId: string,
    userId: string,
    targetOwner: string,
    beforeId: string | null,
  ): Promise<void> {
    let current = await this.indexTable.where("id", itemId).first();

    let targetIndex: number;
    let before = beforeId ? await this.indexTable.where("id", beforeId).first() : null;

    if (before && before.ownerId == targetOwner) {
      targetIndex = before.index;

      await this.indexTable
        .where("ownerId", targetOwner)
        .andWhere("index", ">=", targetIndex)
        // @ts-ignore
        .update({
          index: this.knex.raw("?? + 1", ["index"]),
        });
    } else {
      targetIndex = await this.nextIndex(targetOwner);
    }

    if (current) {
      await this.indexTable
        .where("id", itemId)
      // @ts-ignore
        .update({
          ownerId: targetOwner,
          index: targetIndex,
        });

      await this.indexTable
        .where("ownerId", current.ownerId)
        .andWhere("index", ">", current.index)
        // @ts-ignore
        .update({
          index: this.knex.raw("?? - 1", ["index"]),
        });
    } else {
      await this.indexTable.insert({
        id: itemId,
        userId,
        ownerId: targetOwner,
        index: targetIndex,
      });
    }
  }

  public async remove(id: string): Promise<void> {
    let item = await this.indexTable.where("id", id).first();
    if (!item) {
      return;
    }

    await this.indexTable.where("id", id).delete();

    await this.indexTable
      .where("ownerId", item.ownerId)
      .andWhere("index", ">", item.index)
      // @ts-ignore
      .update({
        index: this.knex.raw("?? - 1", ["index"]),
      });
  }

  public override async delete(id: string): Promise<void> {
    await this.remove(id);
    await super.delete(id);
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
      name: "Tasks",
    });

    return user;
  }
}

export class ContextDataSource extends DbDataSource<
  Impl.Context,
  Db.ContextDbTable
> {
  public tableName = "Context";
  protected builder = classBuilder<Impl.Context, Db.ContextDbTable>(Impl.Context);

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
      id: await id(),
      ...params,
      userId: user.id(),
    }));

    await this.dataSources.projects.create(context, {
      name: "",
    });

    return context;
  }

  public override async delete(id: string): Promise<void> {
    let items = await this.dataSources.items.contextItems(id).records();
    for (let { id } of items) {
      await this.dataSources.items.delete(id);
    }
    return super.delete(id);
  }
}

export class ProjectDataSource extends DbDataSource<
  Impl.Project,
  Db.ProjectDbTable
> {
  public tableName = "Project";
  protected builder = classBuilder<Impl.Project, Db.ProjectDbTable>(Impl.Project);

  public override get records(): Knex.QueryBuilder<Db.ProjectDbTable, Db.ProjectDbTable[]> {
    return this.table.where("name", "<>", "");
  }

  public async create(
    taskList: Impl.Context | Impl.Project,
    params: Omit<DbInsertObject<Db.ProjectDbTable>, "id" | "userId" | "contextId" | "parentId">,
  ): Promise<Impl.Project> {
    let context = taskList instanceof Impl.Project
      ? await taskList.context() ?? await taskList.user()
      : taskList;

    let user = await taskList.user();

    let project = await this.build(this.insert({
      id: params.name == "" ? taskList.id() : await id(),
      contextId: context.id(),
      userId: user.id(),
      ...params,
      parentId: params.name == "" ? null : taskList.id(),
    }));

    await this.dataSources.sections.insert({
      id: project.id(),
      userId: user.id(),
      ownerId: project.id(),
      index: -1,
      name: "",
    });

    return project;
  }

  public override async delete(id: string): Promise<void> {
    let items = await this.dataSources.items.projectItems(id).records();
    for (let { id } of items) {
      await this.dataSources.items.delete(id);
    }
    return super.delete(id);
  }
}

export class SectionDataSource extends IndexedDbDataSource<
  Impl.Section,
  Db.SectionDbTable
> {
  public tableName = "Section";
  public indexTableName = "Section";
  protected builder = classBuilder<Impl.Section, Db.SectionDbTable>(Impl.Section);

  public override get records(): Knex.QueryBuilder<Db.SectionDbTable, Db.SectionDbTable[]> {
    return this.table.where("index", ">=", 0);
  }

  public async getSection(id: string): Promise<Impl.Section | null> {
    let record = await this.getRecord(id);
    if (!record) {
      return null;
    }

    if (record.index >= 0) {
      return new Impl.Section(this.dataSources, record);
    }

    return null;
  }

  public async create(
    project: Impl.Context | Impl.Project,
    before: string | null,
    params: Omit<DbInsertObject<Db.SectionDbTable>, "id" | "userId" | "ownerId" | "index">,
  ): Promise<Impl.Section> {
    let index: number;

    if (before) {
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

    let user = await project.user();

    return this.build(this.insert({
      id: params.name == "" ? project.id() : await id(),
      ...params,
      userId: user.id(),
      ownerId: project.id(),
      index,
    }));
  }

  public override async delete(id: string): Promise<void> {
    let items = await this.dataSources.items.sectionItems(id).records();
    for (let { id } of items) {
      await this.dataSources.items.delete(id);
    }
    return super.delete(id);
  }
}

export class ItemDataSource extends IndexedDbDataSource<Impl.Item, Db.ItemDbTable> {
  public tableName = "Item";
  public indexTableName = "SectionItems";
  protected builder = classBuilder<Impl.Item, Db.ItemDbTable>(Impl.Item);

  public async create(
    user: Impl.User,
    section: Impl.ItemHolder | null,
    params: Omit<DbInsertObject<Db.ItemDbTable>, "id" | "userId" | "created">,
  ): Promise<Impl.Item> {
    let item = await this.build(this.insert({
      ...params,
      id: await id(),
      userId: user.id(),
      created: DateTime.now(),
    }));

    if (section) {
      await this.move(item.id(), user.id(), section.id(), null);
    }

    return item;
  }

  public async deleteCompleteInboxTasks(): Promise<void> {
    let itemsInLists = this.knex
      .from<Db.PluginListItemsDbTable>("PluginListItems")
      .whereNotNull("present")
      .distinct("itemId");

    let items = await this.select(this.records
      .join("TaskInfo", "TaskInfo.id", this.ref("id"))
      .leftJoin("SectionItems", this.ref("id"), "SectionItems.id")
      .whereNotNull("TaskInfo.done")
      .whereNotIn(this.ref("id"), itemsInLists)
      .whereNull("SectionItems.id"));

    for (let item of items) {
      await this.delete(item.id);
    }
  }

  public findItems(fields: Partial<DbObject<Db.ItemDbTable>>, filter?: ItemFilter | null): ItemSet {
    return new ItemSet(this.records.where(fields), filter);
  }

  public sectionItems(section: string | null, filter?: ItemFilter | null): ItemSet {
    if (section) {
      return new ItemSet(
        this.records
          .leftJoin("SectionItems", "Item.id", "SectionItems.id")
          .where("SectionItems.ownerId", section)
          .orderBy([
            { column: "SectionItems.index", order: "asc" },
          ]),
        filter,
      );
    }

    return new ItemSet(
      this.records
        .leftJoin("SectionItems", "Item.id", "SectionItems.id")
        .whereNull("SectionItems.ownerId")
        .orderBy([
          { column: "Item.created", order: "desc" },
          { column: "Item.summary", order: "asc" },
        ]),
      filter,
    );
  }

  public projectItems(project: string, filter?: ItemFilter | null): ItemSet {
    return new ItemSet(
      this.records
        .join("SectionItems", "Item.id", "SectionItems.id")
        .join("Section", "Section.id", "SectionItems.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .where("Project.id", project),
      filter,
    );
  }

  public contextItems(context: string, filter?: ItemFilter | null): ItemSet {
    return new ItemSet(
      this.records
        .join("SectionItems", "Item.id", "SectionItems.id")
        .join("Section", "Section.id", "SectionItems.ownerId")
        .join("Project", "Project.id", "Section.ownerId")
        .join("Context", "Context.id", "Project.contextId")
        .where("Context.id", context),
      filter,
    );
  }

  public userItems(user: string, filter?: ItemFilter | null): ItemSet {
    return new ItemSet(
      this.records
        .where("Item.userId", user),
      filter,
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

  public async ensureSanity(): Promise<void> {
    await this.pluginList.updateTaskStates();
    await this.items.deleteCompleteInboxTasks();
  }
}
