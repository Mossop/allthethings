import type { DataSourceConfig } from "apollo-datasource";
import { DataSource } from "apollo-datasource";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type Knex from "knex";
import { customAlphabet } from "nanoid/async";

import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { DatabaseConnection } from "./connection";
import type { ImplBuilder } from "./implementations";
import { Context, User, Project, Section } from "./implementations";
import type {
  ContextDbObject,
  DbEntity,
  ProjectDbObject,
  SectionDbObject,
  UserDbObject,
} from "./types";

type PromiseLike<T> = T | Promise<T>;
type Maybe<T> = T | null | undefined;

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const id = customAlphabet(ALPHABET, 28);

export type PartialId<T> = Omit<T, "id"> & { id?: string };

export abstract class DbDataSource<
  T extends { id: string },
  D extends DbEntity = DbEntity,
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
    return new this.builder(this.context, dbObject);
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

export class ContextDataSource extends DbDataSource<Context, ContextDbObject> {
  protected tableName = "Context";
  protected builder = Context;

  public get records(): Knex.QueryBuilder<ContextDbObject, ContextDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async getUser(contextId: string): Promise<User | null> {
    let records = await this.table.where("id", contextId);
    if (records.length != 1) {
      return null;
    }

    return this.context.dataSources.users.getOne(records[0].userId);
  }

  public async create(
    user: User,
    { name }: Schema.CreateContextParams,
  ): Promise<Context> {
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

export class ProjectDataSource extends DbDataSource<Project, ProjectDbObject> {
  protected tableName = "Project";
  protected builder = Project;

  public get records(): Knex.QueryBuilder<ProjectDbObject, ProjectDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async create(
    taskList: User | Context | Project,
    { name }: Pick<ProjectDbObject, "name">,
  ): Promise<Project> {
    let project = await this.build(this.insert({
      id: name == "" ? taskList.id : await id(),
      contextId: taskList.id,
      name,
      parentId: name == "" ? null : taskList.id,
    }));

    await this.context.dataSources.sections.create(project, null, {
      name: "",
    });

    return project;
  }
}

export class SectionDataSource extends DbDataSource<Section, SectionDbObject> {
  protected tableName = "Section";
  protected builder = Section;

  public get records(): Knex.QueryBuilder<SectionDbObject, SectionDbObject[]> {
    return this.table.where("name", "<>", "");
  }

  public async find(fields: Partial<SectionDbObject>): Promise<Section[]> {
    return this.buildAll(this.select(this.records.where(fields).orderBy("index")));
  }

  public async create(
    project: User | Context | Project,
    index: number | null,
    { name }: Pick<SectionDbObject, "name">,
  ): Promise<Section> {
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
