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

function classBuilder<T, D>(
  cls: new (resolverContext: ResolverContext, dbObject: D) => T,
): ImplBuilder<T, D> {
  return (resolverContext: ResolverContext, dbObject: D) => new cls(resolverContext, dbObject);
}

export type PartialId<T> = Omit<T, "id"> & { id?: string };

export abstract class DbDataSource<
  T extends { id: string },
  D extends Db.DbEntity = Db.DbEntity,
> extends DataSource<ResolverContext> {
  protected readonly abstract tableName: string;
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
  protected get table(): Knex.QueryBuilder<D, D[]> {
    return this.knex.table(this.tableName);
  }

  /**
   * A filtered view of the table for this datasource which ignores anonymous records.
   */
  protected get records(): Knex.QueryBuilder<D, D[]> {
    return this.table;
  }

  /**
   * Given a query returns all the matching records.
   */
  protected select(query: Knex.QueryBuilder<D, D[]>): Promise<D[]> {
    return query.select("*") as Promise<D[]>;
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
    let results = await this.select(this.records.whereIn(this.ref("id"), [id]));

    if (!results.length) {
      return null;
    } else if (results.length == 1) {
      return results[0];
    } else {
      throw new Error("Unexpected multiple records with the same ID.");
    }
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
    let results: D[] = await this.records.where(this.ref("id"), id).update(item).returning("*");
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

export class UserDataSource extends DbDataSource<Impl.User, Db.UserDbObject> {
  protected tableName = "User";
  protected builder = classBuilder<Impl.User, Db.UserDbObject>(Impl.User);

  public async verifyUser(email: string, password: string): Promise<Impl.User | null> {
    let users = await this.select(this.table.where({
      email,
    }));

    if (users.length != 1) {
      return null;
    }

    if (await bcryptCompare(password, users[0].password)) {
      return this.build(users[0]);
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

export class ContextDataSource extends DbDataSource<Impl.Context, Db.ContextDbObject> {
  protected tableName = "Context";
  protected builder = classBuilder<Impl.Context, Db.ContextDbObject>(Impl.Context);

  public get records(): Knex.QueryBuilder<Db.ContextDbObject, Db.ContextDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async getUser(contextId: string): Promise<Impl.User | null> {
    let records = await this.table.where("id", contextId);
    if (records.length != 1) {
      return null;
    }

    return this.context.dataSources.users.getOne(records[0].userId);
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

export class ProjectDataSource extends DbDataSource<Impl.Project, Db.ProjectDbObject> {
  protected tableName = "Project";
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

export class SectionDataSource extends DbDataSource<Impl.Section, Db.SectionDbObject> {
  protected tableName = "Section";
  protected builder = classBuilder<Impl.Section, Db.SectionDbObject>(Impl.Section);

  public get records(): Knex.QueryBuilder<Db.SectionDbObject, Db.SectionDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async find(fields: Partial<Db.SectionDbObject>): Promise<Impl.Section[]> {
    return this.buildAll(this.select(this.records.where(fields).orderBy("index")));
  }

  public async create(
    project: Impl.User | Impl.Context | Impl.Project,
    index: number | null,
    { name }: Pick<Db.SectionDbObject, "name">,
  ): Promise<Impl.Section> {
    if (name == "") {
      index = -1;
    } else {
      let existing = await project.sections();
      if (index === null || index >= existing.length) {
        index = existing.length;
      } else {
        await this.table.where({
          projectId: project.id,
        }).andWhere("index", ">=", index).update("index", this.knex.raw(":index: + 1", {
          index: "index",
        }));
      }
    }

    return this.build(this.insert({
      id: name == "" ? project.id : await id(),
      name,
      projectId: project.id,
      index,
    }));
  }
}

export class ItemDataSource extends DbDataSource<Item, Db.ItemDbObject> {
  protected tableName = "Item";
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

  public async listSection(sectionId: string): Promise<Item[]> {
    return this.buildAll(this.select(
      this.records.join("SectionItem", "SectionItem.itemId", "Item.id")
        .where("SectionItem.sectionId", sectionId)
        .orderBy("SectionItem.index"),
    ));
  }
}

export class TaskItemDataSource extends DbDataSource<Impl.TaskItem, Db.TaskItemDbObject> {
  protected tableName = "TaskItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.TaskItemDbObject,
  ): Impl.TaskItem {
    return new Impl.TaskItem(resolverContext, null, dbObject);
  }
}

export class FileItemDataSource extends DbDataSource<Impl.FileItem, Db.FileItemDbObject> {
  protected tableName = "FileItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.FileItemDbObject,
  ): Impl.FileItem {
    return new Impl.FileItem(resolverContext, null, dbObject);
  }
}

export class NoteItemDataSource extends DbDataSource<Impl.NoteItem, Db.NoteItemDbObject> {
  protected tableName = "NoteItem";
  protected builder(
    resolverContext: ResolverContext,
    dbObject: Db.NoteItemDbObject,
  ): Impl.NoteItem {
    return new Impl.NoteItem(resolverContext, null, dbObject);
  }
}

export class LinkItemDataSource extends DbDataSource<Impl.LinkItem, Db.LinkItemDbObject> {
  protected tableName = "LinkItem";
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
