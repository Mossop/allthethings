import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type Knex from "knex";
import { customAlphabet } from "nanoid/async";

import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { DatabaseConnection } from "./connection";
import type { ImplBuilder, Item } from "./implementations";
import * as Impl from "./implementations";
import * as Db from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const id = customAlphabet(ALPHABET, 28);

export enum SectionIndex {
  Anonymous = -1,
  Input = -2,
}

function classBuilder<T, D>(
  cls: new (resolverContext: ResolverContext, dbObject: D) => T,
): ImplBuilder<T, D> {
  return (resolverContext: ResolverContext, dbObject: D) => new cls(resolverContext, dbObject);
}

async function max<D>(query: Knex.QueryBuilder<D, D[]>, col: keyof D): Promise<number | null> {
  let result: { max: number | null } | undefined = await query.max(col).first();
  return result ? result.max : null;
}

export type PartialId<T> = Omit<T, "id"> & { id?: string };

export abstract class DbDataSource<
  T extends { id: string },
  D extends Db.DbEntity = Db.DbEntity,
> extends DataSource<ResolverContext> {
  public readonly abstract tableName: string;
  protected abstract builder(resolverContext: ResolverContext, dbObject: D): T;
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
  public get knex(): Knex<D, D[]> {
    return this.connection.knex as Knex<D, D[]>;
  }

  public initialize(config: DataSourceConfig<ResolverContext>): void {
    this._config = config;
  }

  /**
   * Generates a column reference.
   */
  public ref(field: keyof D | "*"): string {
    return `${this.tableName}.${field}`;
  }

  /**
   * Typed access to the table for this datasource.
   */
  public get table(): Knex.QueryBuilder<D, D[]> {
    return this.knex.table(this.tableName);
  }

  /**
   * A filtered view of the table for this datasource which ignores anonymous records.
   */
  public get records(): Knex.QueryBuilder<D, D[]> {
    return this.table;
  }

  /**
   * Given a query returns all the matching records.
   */
  public select(query: Knex.QueryBuilder<D, D[]>): Promise<D[]> {
    return query.select(this.ref("*")) as Promise<D[]>;
  }

  /**
   * Given a query returns the first matching record.
   */
  public first(query: Knex.QueryBuilder<D, D[]>): Promise<D | null> {
    return query.first(this.ref("*")) as Promise<D | null>;
  }

  /**
   * Converts the DB record into the high-level implementation instance.
   */
  protected build(dbObject: PromiseLike<D>): Promise<T>;
  protected build(dbObject: PromiseLike<Maybe<D>>): Promise<T | null>;
  protected async build(dbObject: PromiseLike<Maybe<D>>): Promise<T | null> {
    dbObject = await dbObject;
    if (!dbObject) {
      return null;
    }
    return this.builder(this.context, dbObject);
  }

  /**
   * Converts the DB records into the high-level implementation instances.
   */
  protected buildAll(dbObjects: PromiseLike<D[]>): Promise<T[]>;
  protected buildAll(dbObjects: PromiseLike<Maybe<D>[]>): Promise<(T | null)[]>;
  protected async buildAll(dbObjects: PromiseLike<Maybe<D>[]>): Promise<(T | null)[]> {
    dbObjects = await dbObjects;
    return await Promise.all(dbObjects.map((obj: Maybe<D>): Promise<T | null> => this.build(obj)));
  }

  /**
   * Gets the DB record with the given ID.
   */
  public async get(id: string): Promise<D | null> {
    return this.first(this.records.whereIn(this.ref("id"), [id]));
  }

  /**
   * Gets the high-level implementation with the given ID.
   */
  public async getOne(id: string): Promise<T | null> {
    return this.build(await this.get(id));
  }

  /**
   * Finds an instance that matches the given fields.
   */
  public async find(fields: Partial<D>): Promise<T[]> {
    return this.buildAll(this.select(this.records.where(fields)));
  }

  /**
   * Performs a more complex query to find the matching instances.
   */
  public async query(fn: (knex: Knex.QueryBuilder<D, D[]>) => void | Promise<void>): Promise<T[]> {
    let query = this.records;
    await fn(query);
    return this.buildAll(this.select(query));
  }

  /**
   * Inserts a DB record into the database.
   */
  public async insert(item: PartialId<Omit<D, "stub">>): Promise<D> {
    // @ts-ignore
    let results: D[] = await this.table.insert({
      ...item,
      id: item.id ?? await id(),
    }).returning("*");

    if (!results.length) {
      throw new Error("Unexpectedly failed to create a record.");
    } else if (results.length == 1) {
      return results[0];
    } else {
      throw new Error("Unexpectedly created multiple records.");
    }
  }

  /**
   * Updates a DB record in the database.
   */
  public async updateOne(id: string, item: Partial<Omit<D, "id" | "stub">>): Promise<D | null> {
    // @ts-ignore
    let results: D[] = await this.records
      .where(this.ref("id"), id)
      // @ts-ignore
      .update(item)
      .returning(this.ref("*"));
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
  T extends { id: string },
  D extends Db.IndexedDbEntity = Db.IndexedDbEntity,
> extends DbDataSource<T, D> {
  protected async nextIndex(owner: string): Promise<number> {
    let index = await max(this.records.where("ownerId", owner), "index");
    return index !== null ? index + 1 : 0;
  }

  public async find(fields: Partial<D>): Promise<T[]> {
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
    if (before && before.ownerId == targetOwner) {
      targetIndex = before.index;

      let query = this.records
        .where("ownerId", targetOwner)
        .andWhere("index", ">=", targetIndex)
        .orderBy("index", "DESC");

      await this.knex.raw(`
        UPDATE :table: AS :t1:
          SET :index: = :index2: + 1
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

    let query = this.records
      .where("ownerId", currentOwner)
      .andWhere("index", ">", currentIndex)
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

export class UserDataSource extends DbDataSource<Impl.User, Db.UserDbObject> {
  public tableName = "User";
  protected builder = classBuilder<Impl.User, Db.UserDbObject>(Impl.User);

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

  public async create(email: string, password: string): Promise<Impl.User> {
    password = await bcryptHash(password, 12);

    let user = await this.build(this.insert({
      email,
      password,
    }));

    await this.context.dataSources.contexts.create(user, {
      name: "",
    });

    return user;
  }
}

export class ContextDataSource extends DbDataSource<
  Impl.Context,
  Db.ContextDbObject
> {
  public tableName = "Context";
  protected builder = classBuilder<Impl.Context, Db.ContextDbObject>(Impl.Context);

  public get records(): Knex.QueryBuilder<Db.ContextDbObject, Db.ContextDbObject[]> {
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
    { name }: Schema.CreateContextParams,
  ): Promise<Impl.Context> {
    let context = await this.build(this.insert({
      id: name == "" ? user.id : await id(),
      name,
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
  Db.ProjectDbObject
> {
  public tableName = "Project";
  protected builder = classBuilder<Impl.Project, Db.ProjectDbObject>(Impl.Project);

  public get records(): Knex.QueryBuilder<Db.ProjectDbObject, Db.ProjectDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async create(
    taskList: Impl.User | Impl.Context | Impl.Project,
    { name }: Pick<Db.ProjectDbObject, "name">,
  ): Promise<Impl.Project> {
    let context = taskList instanceof Impl.Project
      ? await taskList.context() ?? await taskList.user()
      : taskList;

    let project = await this.build(this.insert({
      id: name == "" ? taskList.id : await id(),
      contextId: context.id,
      name,
      parentId: name == "" ? null : taskList.id,
    }));

    await this.context.dataSources.sections.create(project, null, {
      name: "",
    });

    return project;
  }
}

export class SectionDataSource extends IndexedDbDataSource<
  Impl.Section,
  Db.SectionDbObject
> {
  public tableName = "Section";
  protected builder = classBuilder<Impl.Section, Db.SectionDbObject>(Impl.Section);

  public get records(): Knex.QueryBuilder<Db.SectionDbObject, Db.SectionDbObject[]> {
    return this.table.where("index", ">=", 0);
  }

  public async getSpecialSectionId(
    ownerId: string,
    type: SectionIndex,
  ): Promise<string | null> {
    let id = await this.table.where({
      ownerId,
      index: type,
    }).pluck("id").first();

    return id ?? null;
  }

  public async create(
    project: Impl.User | Impl.Context | Impl.Project,
    before: string | null,
    { name }: Pick<Db.SectionDbObject, "name">,
  ): Promise<Impl.Section> {
    let index: number;

    if (name == "") {
      index = SectionIndex.Anonymous;
    } else if (before) {
      let value = await this.records
        .where({
          ownerId: project.id,
          id: before,
        })
        .pluck("index")
        .first();
      if (value !== undefined) {
        await this.table.where({
          ownerId: project.id,
        }).andWhere("index", ">=", value).update("index", this.knex.raw(":index: + 1", {
          index: "index",
        }));
      }

      index = value ?? await this.nextIndex(project.id);
    } else {
      index = await this.nextIndex(project.id);
    }

    return this.build(this.insert({
      id: name == "" ? project.id : await id(),
      name,
      ownerId: project.id,
      index,
    }));
  }
}

export class ItemDataSource extends IndexedDbDataSource<Item, Db.ItemDbObject> {
  public tableName = "Item";
  protected builder(resolverContext: ResolverContext, dbObject: Db.ItemDbObject): Item {
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
    type: Db.ItemType,
    summary: string,
  ): Promise<Db.ItemDbObject> {
    return this.insert({
      ownerId: owner.id,
      index: await this.nextIndex(owner.id),
      summary,
      type,
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

export class TaskItemDataSource extends DbDataSource<Impl.TaskItem, Db.TaskItemDbObject> {
  public tableName = "TaskItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.TaskItemDbObject,
  ): Impl.TaskItem {
    return new Impl.TaskItem(resolverContext, null, dbObject);
  }

  public async create(
    owner: Impl.TaskList | Impl.Section,
    { summary, link }: Schema.CreateTaskParams,
  ): Promise<Impl.TaskItem> {
    let base = await this.context.dataSources.items.create(owner, Db.ItemType.Task, summary);
    let task = await this.insert({
      id: base.id,
      done: false,
      link: link ?? null,
    });

    return new Impl.TaskItem(this.context, base, task);
  }
}

export class FileItemDataSource extends DbDataSource<Impl.FileItem, Db.FileItemDbObject> {
  public tableName = "FileItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.FileItemDbObject,
  ): Impl.FileItem {
    return new Impl.FileItem(resolverContext, null, dbObject);
  }
}

export class NoteItemDataSource extends DbDataSource<Impl.NoteItem, Db.NoteItemDbObject> {
  public tableName = "NoteItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.NoteItemDbObject,
  ): Impl.NoteItem {
    return new Impl.NoteItem(resolverContext, null, dbObject);
  }
}

export class LinkItemDataSource extends DbDataSource<Impl.LinkItem, Db.LinkItemDbObject> {
  public tableName = "LinkItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.LinkItemDbObject,
  ): Impl.LinkItem {
    return new Impl.LinkItem(resolverContext, null, dbObject);
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
