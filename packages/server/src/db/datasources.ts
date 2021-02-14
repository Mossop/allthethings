import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type Knex from "knex";
import { customAlphabet } from "nanoid/async";

import type { ResolverContext } from "../schema/context";
import type { DatabaseConnection } from "./connection";
import type { ImplBuilder, Item } from "./implementations";
import * as Impl from "./implementations";
import * as Db from "./types";
import type { DbInsertObject, DbObject } from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const id = customAlphabet(ALPHABET, 28);

export enum SectionIndex {
  Anonymous = -1,
  Input = -2,
}

function classBuilder<I, T>(
  cls: new (resolverContext: ResolverContext, dbObject: DbObject<T>) => I,
): ImplBuilder<I, T> {
  return (
    resolverContext: ResolverContext,
    dbObject: DbObject<T>,
  ) => new cls(resolverContext, dbObject);
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
  I extends { id: string },
  T extends Db.DbTable = Db.DbTable,
> extends DataSource<ResolverContext> {
  public readonly abstract tableName: string;
  protected abstract builder(resolverContext: ResolverContext, dbObject: DbObject<T>): I;
  private _config: DataSourceConfig<ResolverContext> | null = null;

  protected get config(): DataSourceConfig<ResolverContext> {
    if (!this._config) {
      throw new Error("Not initialized.");
    }

    return this._config;
  }

  /**
   * The GraphQL resolver context.
   */
  protected get context(): ResolverContext {
    return this.config.context;
  }

  /**
   * The database connection. This may be in a transaction.
   */
  protected get connection(): DatabaseConnection {
    return this.context.db;
  }

  /**
   * Raw access to the knex instance. This may be in a transaction.
   */
  public get knex(): Knex {
    return this.connection.knex;
  }

  public initialize(config: DataSourceConfig<ResolverContext>): void {
    this._config = config;
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
    return this.builder(this.context, dbObject);
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
  public async get(id: string): Promise<DbObject<T> | null> {
    return this.first(this.records.whereIn(this.ref("id"), [id]));
  }

  /**
   * Gets the high-level implementation with the given ID.
   */
  public async getOne(id: string): Promise<I | null> {
    return this.build(await this.get(id));
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
  I extends { id: string },
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
    let current = await this.get(itemId);
    if (!current) {
      return;
    }

    let currentIndex = current.index;
    let currentOwner = current.ownerId;

    let targetIndex: number;
    let before = beforeId ? await this.get(beforeId) : null;
    console.log("Move from", currentOwner, currentIndex, targetOwner, before ? before.index : null);
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
    let item = await this.get(id);
    if (!item) {
      return;
    }

    await this.table.where(this.ref("id"), id).delete();

    let query = this.records
      .where("ownerId", item.ownerId)
      .andWhere("index", ">", item.index)
      .orderBy("index", "ASC");

    await this.knex.raw(`
      UPDATE :table: AS :t1:
        SET :index: = :index2: - 1
        FROM :query AS :t2:
        WHERE :id1: = :id2:`, {
      table: this.tableName,
      t1: "t1",
      t2: "t2",
      id1: "t1.id",
      id2: "t2.id",
      index2: "t2.index",
      index: "index",
      query,
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

    await this.context.dataSources.contexts.create(user, {
      name: "",
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

  public get records(): Knex.QueryBuilder<Db.ContextDbTable, Db.ContextDbTable[]> {
    return this.table.where("name", "<>", "");
  }

  public async getUser(contextId: string): Promise<Impl.User | null> {
    let record = await this.first(this.table.where("id", contextId));
    if (!record) {
      return null;
    }

    return this.context.dataSources.users.getOne(record.userId);
  }

  public async create(
    user: Impl.User,
    params: Omit<DbInsertObject<Db.ContextDbTable>, "id" | "userId">,
  ): Promise<Impl.Context> {
    let context = await this.build(this.insert({
      id: params.name == "" ? user.id : await id(),
      ...params,
      userId: user.id,
    }));

    await this.context.dataSources.projects.create(context, {
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
      id: params.name == "" ? taskList.id : await id(),
      contextId: context.id,
      ...params,
      parentId: params.name == "" ? null : taskList.id,
    }));

    await this.context.dataSources.sections.create(project, null, {
      name: "",
    });

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

  public async getSpecialSectionId(
    ownerId: string,
    type: SectionIndex,
  ): Promise<string | null> {
    let record = await this.table.where({
      ownerId,
      index: type,
    }).first();

    return record?.id ?? null;
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
          ownerId: project.id,
          id: before,
        })
        .first();
      if (record !== undefined) {
        await this.table.where({
          ownerId: project.id,
        }).andWhere("index", ">=", record.index).update("index", this.knex.raw(":index: + 1", {
          index: "index",
        }));
      }

      index = record?.index ?? await this.nextIndex(project.id);
    } else {
      index = await this.nextIndex(project.id);
    }

    return this.build(this.insert({
      id: params.name == "" ? project.id : await id(),
      ...params,
      ownerId: project.id,
      index,
    }));
  }
}

export class ItemDataSource extends IndexedDbDataSource<Item, Db.ItemDbTable> {
  public tableName = "Item";
  protected builder(resolverContext: ResolverContext, dbObject: DbObject<Db.ItemDbTable>): Item {
    switch (dbObject.type) {
      case Db.ItemType.Task:
        return new Impl.TaskItem(resolverContext, dbObject, null);
      case Db.ItemType.Note:
        return new Impl.NoteItem(resolverContext, dbObject, null);
      case Db.ItemType.File:
        return new Impl.FileItem(resolverContext, dbObject, null);
      case Db.ItemType.Link:
        return new Impl.LinkItem(resolverContext, dbObject, null);
    }
  }

  public async create(
    owner: Impl.TaskList | Impl.Section,
    params: Omit<DbInsertObject<Db.ItemDbTable>, "id" | "ownerId" | "index">,
  ): Promise<DbObject<Db.ItemDbTable>> {
    return this.insert({
      id: await id(),
      ownerId: owner.id,
      index: await this.nextIndex(owner.id),
      ...params,
    });
  }

  public listSpecialSection(
    owner: string,
    type: SectionIndex,
  ): Promise<Item[]> {
    return this.buildAll(this.select(this.records
      .join("Section", "Section.id", "Item.ownerId")
      .where("Section.ownerId", owner)
      .andWhere("Section.index", type)
      .orderBy("Item.index")));
  }
}

type ExtendedItemInsert<T> =
  Omit<DbInsertObject<T>, "id"> &
  Omit<DbInsertObject<Db.ItemDbTable>, "id" | "ownerId" | "index" | "type">;

abstract class ExtendedItemDataSource<
  I extends { id: string },
  T extends Db.DbTable = Db.DbTable,
> extends DbDataSource<I, T> {
  protected abstract readonly itemType: Db.ItemType;
  protected abstract builder(
    resolverContext: ResolverContext,
    instanceObject: DbObject<T>,
    dbObject?: DbObject<Db.ItemDbTable>,
  ): I;

  public get items(): ItemDataSource {
    return this.context.dataSources.items;
  }

  public async create(
    owner: Impl.TaskList | Impl.Section,
    {
      summary,
      archived,
      ...params
    }: ExtendedItemInsert<T>,
  ): Promise<I> {
    let base = await this.items.create(owner, {
      type: this.itemType,
      archived,
      summary,
    });

    // @ts-ignore
    let task = await this.insert({
      id: base.id,
      ...params,
    });

    return this.builder(this.context, task, base);
  }

  public delete(id: string): Promise<void> {
    return this.items.delete(id);
  }
}

export class TaskItemDataSource extends ExtendedItemDataSource<Impl.TaskItem, Db.TaskItemDbTable> {
  public tableName = "TaskItem";
  protected itemType = Db.ItemType.Task;

  protected builder(
    resolverContext: ResolverContext,
    instanceObject: DbObject<Db.TaskItemDbTable>,
    dbObject?: DbObject<Db.ItemDbTable>,
  ): Impl.TaskItem {
    return new Impl.TaskItem(resolverContext, dbObject ?? null, instanceObject);
  }

  public async taskListTaskCount(taskList: string): Promise<number> {
    let value = await count(
      this.records
        .join("Item", "Item.id", this.ref("id"))
        .join("Section", "Section.id", "Item.ownerId")
        .where({
          [this.ref("done")]: null,
          ["Section.ownerId"]: taskList,
        }),
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

export class FileItemDataSource extends ExtendedItemDataSource<Impl.FileItem, Db.FileItemDbTable> {
  public tableName = "FileItem";
  protected itemType = Db.ItemType.File;

  protected builder(
    resolverContext: ResolverContext,
    instanceObject: DbObject<Db.FileItemDbTable>,
    dbObject?: DbObject<Db.ItemDbTable>,
  ): Impl.FileItem {
    return new Impl.FileItem(resolverContext, dbObject ?? null, instanceObject);
  }
}

export class NoteItemDataSource extends ExtendedItemDataSource<Impl.NoteItem, Db.NoteItemDbTable> {
  public tableName = "NoteItem";
  protected itemType = Db.ItemType.Note;

  protected builder(
    resolverContext: ResolverContext,
    instanceObject: DbObject<Db.NoteItemDbTable>,
    dbObject?: DbObject<Db.ItemDbTable>,
  ): Impl.NoteItem {
    return new Impl.NoteItem(resolverContext, dbObject ?? null, instanceObject);
  }
}

export class LinkItemDataSource extends ExtendedItemDataSource<Impl.LinkItem, Db.LinkItemDbTable> {
  public tableName = "LinkItem";
  protected itemType = Db.ItemType.Link;

  protected builder(
    resolverContext: ResolverContext,
    instanceObject: DbObject<Db.LinkItemDbTable>,
    dbObject?: DbObject<Db.ItemDbTable>,
  ): Impl.LinkItem {
    return new Impl.LinkItem(resolverContext, dbObject ?? null, instanceObject);
  }
}

export interface AppDataSources {
  users: UserDataSource,
  contexts: ContextDataSource;
  projects: ProjectDataSource;
  sections: SectionDataSource;
  items: ItemDataSource;
  tasks: TaskItemDataSource;
  files: FileItemDataSource;
  notes: NoteItemDataSource;
  links: LinkItemDataSource;
}

export function dataSources(): AppDataSources {
  return {
    users: new UserDataSource(),
    contexts: new ContextDataSource(),
    projects: new ProjectDataSource(),
    sections: new SectionDataSource(),
    items: new ItemDataSource(),
    tasks: new TaskItemDataSource(),
    files: new FileItemDataSource(),
    notes: new NoteItemDataSource(),
    links: new LinkItemDataSource(),
  };
}
