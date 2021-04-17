import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Knex } from "knex";

import type { ResolverContext } from "../schema/context";
import type { DatabaseConnection } from "./connection";
import { id } from "./connection";
import type { ImplBuilder } from "./implementations";
import * as Impl from "./implementations";
import * as Db from "./types";
import type { DbUpdateObject } from "./types";

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

async function max<D>(
  query: Knex.QueryBuilder<D, D[]>,
  col: keyof DbObject<D>,
): Promise<number | null> {
  let result: { max: number | null } | undefined = await query.max(col).first();
  return result ? result.max : null;
}

async function count(query: Knex.QueryBuilder): Promise<number | null> {
  let result: { count: BigInt | null } | undefined = await query.count("*").first();
  return result ? Number(result.count) : null;
}

export type PartialId<T> = Omit<T, "id"> & { id?: string };

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

  public listSpecialSection(
    owner: string,
    type: SectionIndex,
  ): Promise<Impl.Item[]> {
    return this.buildAll(this.select(this.records
      .join("Section", "Section.id", "Item.ownerId")
      .where("Section.ownerId", owner)
      .andWhere("Section.index", type)
      .orderBy("Item.index")));
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

  public async setItemTaskInfo(
    item: Impl.Item,
    taskInfo: DbUpdateObject<Db.TaskInfoDbTable> | null,
  ): Promise<void> {
    if (!taskInfo) {
      return this.delete(item.id());
    }

    let record = await this.updateOne(item.id(), taskInfo);
    if (!record) {
      await this.insert({
        ...taskInfo,
        due: taskInfo.due ?? null,
        done: taskInfo.done ?? null,
        id: item.id(),
      });
    }
  }

  public async taskListTaskCount(taskList: string): Promise<number> {
    let value = await count(
      this.records
        .join("Item", "Item.id", this.ref("id"))
        .join("Section", "Section.id", "Item.ownerId")
        .where({
          [this.ref("done")]: null,
          ["Section.ownerId"]: taskList,
        })
        .andWhere("Section.index", ">=", SectionIndex.Anonymous),
    );
    return value ?? 0;
  }

  public async sectionTaskCount(section: string): Promise<number> {
    let value = await count(
      this.records
        .join("Item", "Item.id", this.ref("id"))
        .where({
          [this.ref("done")]: null,
          ["Item.ownerId"]: section,
        }),
    );
    return value ?? 0;
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

export interface AppDataSources {
  users: UserDataSource,
  contexts: ContextDataSource;
  projects: ProjectDataSource;
  sections: SectionDataSource;
  items: ItemDataSource;
  taskInfo: TaskInfoSource;
  fileDetail: FileDetailSource;
  pluginDetail: PluginDetailSource;
  noteDetail: NoteDetailSource;
  linkDetail: LinkDetailSource;
}

export function dataSources(): AppDataSources {
  return {
    users: new UserDataSource(),
    contexts: new ContextDataSource(),
    projects: new ProjectDataSource(),
    sections: new SectionDataSource(),
    items: new ItemDataSource(),
    taskInfo: new TaskInfoSource(),
    fileDetail: new FileDetailSource(),
    pluginDetail: new PluginDetailSource(),
    noteDetail: new NoteDetailSource(),
    linkDetail: new LinkDetailSource(),
  };
}

export function buildDataSources(db: DatabaseConnection): AppDataSources {
  let datasources = dataSources();
  for (let source of Object.values(datasources)) {
    source.init(db, datasources);
  }
  return datasources;
}
