import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type Knex from "knex";
import { customAlphabet } from "nanoid/async";

import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { DatabaseConnection } from "./connection";
import type { ImplBuilder, TaskList } from "./implementations";
import { Context, User, Project, Section, getTaskListIds } from "./implementations";
import type { ContextDbObject, ProjectDbObject, SectionDbObject, UserDbObject } from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const id = customAlphabet(ALPHABET, 28);

export function stub(name: string): string {
  return name.toLocaleLowerCase().replaceAll(" ", "-");
}

interface DbObject {
  id: string;
}

export abstract class DbDataSource<
  T extends { id: string },
  D extends DbObject = DbObject,
> extends DataSource<ResolverContext> {
  protected readonly abstract tableName: string;
  protected readonly abstract builder: ImplBuilder<T, D>;
  private _config: DataSourceConfig<ResolverContext> | null = null;

  protected get config(): DataSourceConfig<ResolverContext> {
    if (!this._config) {
      throw new Error("Not initialized.");
    }

    return this._config;
  }

  protected get context(): ResolverContext {
    return this.config.context;
  }

  protected get connection(): DatabaseConnection {
    return this.context.db;
  }

  public get knex(): Knex<D, D[]> {
    return this.connection.knex as Knex<D, D[]>;
  }

  public initialize(config: DataSourceConfig<ResolverContext>): void {
    this._config = config;
  }

  public ref(field: keyof D | "*"): string {
    return `${this.tableName}.${field}`;
  }

  public get table(): Knex.QueryBuilder<D, D[]> {
    return this.knex.table(this.tableName);
  }

  protected select(query: Knex.QueryBuilder<D, D[]>): Promise<D[]> {
    return query.select("*") as Promise<D[]>;
  }

  protected build(dbObject: PromiseLike<D>): Promise<T>;
  protected build(dbObject: PromiseLike<Maybe<D>>): Promise<T | null>;
  protected async build(dbObject: PromiseLike<Maybe<D>>): Promise<T | null> {
    dbObject = await dbObject;
    if (!dbObject) {
      return null;
    }
    return new this.builder(this.context, dbObject);
  }

  protected buildAll(dbObjects: PromiseLike<D[]>): Promise<T[]>;
  protected buildAll(dbObjects: PromiseLike<Maybe<D>[]>): Promise<(T | null)[]>;
  protected async buildAll(dbObjects: PromiseLike<Maybe<D>[]>): Promise<(T | null)[]> {
    dbObjects = await dbObjects;
    return await Promise.all(dbObjects.map((obj: Maybe<D>): Promise<T | null> => this.build(obj)));
  }

  public async get(id: string): Promise<D | null> {
    let results = await this.select(this.table.whereIn(this.ref("id"), [id]));

    if (!results.length) {
      return null;
    } else if (results.length == 1) {
      return results[0];
    } else {
      throw new Error("Unexpected multiple records with the same ID.");
    }
  }

  public async getOne(id: string): Promise<T | null> {
    return this.build(await this.get(id));
  }

  public async find(fields: Partial<D>): Promise<T[]> {
    return this.buildAll(this.select(this.table.where(fields)));
  }

  public async query(fn: (knex: Knex.QueryBuilder<D, D[]>) => void | Promise<void>): Promise<T[]> {
    let query = this.table;
    await fn(query);
    return this.buildAll(this.select(query));
  }

  public async insert(item: Omit<D, "id">): Promise<D> {
    // @ts-ignore
    let results: D[] = await this.table.insert({
      ...item,
      id: await id(),
    }).returning("*");

    if (!results.length) {
      throw new Error("Unexpectedly failed to create a record.");
    } else if (results.length == 1) {
      return results[0];
    } else {
      throw new Error("Unexpectedly created multiple records.");
    }
  }

  public async updateOne(id: string, item: Partial<Omit<D, "id">>): Promise<D | null> {
    // @ts-ignore
    let results: D[] = await this.table.where(this.ref("id"), id).update(item).returning("*");
    if (!results.length) {
      return null;
    } else if (results.length > 1) {
      throw new Error("Unexpectedly updated mutiple records.");
    } else {
      return results[0];
    }
  }

  public delete(id: string): Promise<void> {
    return this.table.where(this.ref("id"), id).delete();
  }
}

export class UserDataSource extends DbDataSource<User, UserDbObject> {
  protected tableName = "User";
  protected builder = User;

  public async verifyUser(email: string, password: string): Promise<User | null> {
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

  public async create(email: string, password: string): Promise<User> {
    password = await bcryptHash(password, 12);

    return this.build(this.insert({
      email,
      password,
    }));
  }
}

export class ContextDataSource extends DbDataSource<Context, ContextDbObject> {
  protected tableName = "Context";
  protected builder = Context;

  public async create(
    user: User,
    { name }: Schema.CreateContextParams,
  ): Promise<Context> {
    return this.build(this.insert({
      name,
      user: user.id,
    }));
  }
}

export class ProjectDataSource extends DbDataSource<Project, ProjectDbObject> {
  protected tableName = "Project";
  protected builder = Project;

  public async create(
    taskList: TaskList,
    { name }: Pick<ProjectDbObject, "name">,
  ): Promise<Project> {
    let { user, context, project: parent } = await getTaskListIds(taskList);

    return this.build(this.insert({
      name,
      user,
      context,
      parent,
    }));
  }
}

export class SectionDataSource extends DbDataSource<Section, SectionDbObject> {
  protected tableName = "Section";
  protected builder = Section;

  public async find(fields: Partial<SectionDbObject>): Promise<Section[]> {
    return this.buildAll(this.select(this.table.where(fields).orderBy("index")));
  }

  public async create(
    taskList: TaskList,
    index: number | null | undefined,
    { name }: Pick<SectionDbObject, "name">,
  ): Promise<Section> {
    let { user, context, project } = await getTaskListIds(taskList);
    let existing = await taskList.sections();
    if (index === undefined || index === null || index >= existing.length) {
      index = existing.length;
    } else {
      await this.table.where({
        user,
        context,
        project,
      }).andWhere("index", ">=", index).update("index", this.knex.raw(":index: + 1", {
        index: "index",
      }));
    }

    return this.build(this.insert({
      name,
      user,
      context,
      project,
      index,
    }));
  }
}

export interface AppDataSources {
  users: UserDataSource,
  contexts: ContextDataSource;
  projects: ProjectDataSource;
  sections: SectionDataSource;
}

export function dataSources(): AppDataSources {
  return {
    users: new UserDataSource(),
    contexts: new ContextDataSource(),
    projects: new ProjectDataSource(),
    sections: new SectionDataSource(),
  };
}
