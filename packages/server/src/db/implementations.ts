import type { MongoDataSource } from "apollo-datasource-mongodb";
import { ObjectId } from "mongodb";

import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { DataSources } from "./datasources";
import type { ContextDbObject, ProjectDbObject, UserDbObject } from "./types";

type Resolver<T> = T | Promise<T> | (() => T | Promise<T>);

type SchemaResolver<T> = {
  [K in keyof Omit<T, "__typename">]: Resolver<SchemaResolver<T[K]>>;
};

interface DbObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: ObjectId;
}

export type DbObjectFor<T> = T extends BaseImpl<infer D> ? D : never;
export type ImplBuilder<T, D> = new (resolverContext: ResolverContext, dbObject: D) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
function filterValid<T extends {}>(val: T | null): val is T {
  if (val === null) {
    throw new Error("Database inconsistency.");
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function assertValid<T extends {}>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

export function equals<T extends Comparable>(
  a: T | null | undefined,
  b: T | null | undefined,
): boolean {
  if (!a) {
    return !b;
  }

  return a.equals(b);
}

export class Comparable {
  public equals(other: Comparable | undefined | null): boolean {
    return other === this;
  }
}

abstract class BaseImpl<T extends DbObject> extends Comparable {
  public readonly dbId: ObjectId;
  protected _dbObject: Promise<T> | null;

  public constructor(resolverContext: ResolverContext, dbObject: T);
  public constructor(resolverContext: ResolverContext, id: ObjectId);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: T | ObjectId,
  ) {
    super();

    if (arg instanceof ObjectId) {
      this.dbId = arg;
      this._dbObject = null;
    } else {
      this.dbId = arg._id;
      this._dbObject = Promise.resolve(arg);
    }
  }

  protected abstract get dataSource(): MongoDataSource<T, ResolverContext>;

  protected get dbObject(): Promise<T> {
    if (this._dbObject) {
      return this._dbObject;
    }

    this._dbObject = this.dataSource.findOneById(this.dbId).then(assertValid);

    return this._dbObject;
  }

  public equals(other: BaseImpl<T> | undefined | null): boolean {
    if (!other) {
      return false;
    }
    return this.dbId.equals(other.dbId);
  }

  public get id(): string {
    return this.dbId.toHexString();
  }

  public get dataSources(): DataSources {
    return this.resolverContext.dataSources;
  }
}

export class User extends BaseImpl<UserDbObject> implements SchemaResolver<Schema.User> {
  protected get dataSource(): MongoDataSource<UserDbObject, ResolverContext> {
    return this.dataSources.users;
  }

  public get email(): Promise<string> {
    return this.dbObject.then((obj: UserDbObject) => obj.email);
  }

  public get password(): Promise<string> {
    return this.dbObject.then((obj: UserDbObject) => obj.password);
  }

  public async contexts(): Promise<readonly Context[]> {
    let contexts = await this.dataSources.contexts.find({
      user: this.dbId,
    });
    return contexts.filter(filterValid);
  }

  public async rootProjects(): Promise<readonly Project[]> {
    let projects = await this.dataSources.projects.find({
      user: this.dbId,
      context: null,
      parent: null,
    });
    return projects.filter(filterValid);
  }
}

export class Context extends BaseImpl<ContextDbObject> implements SchemaResolver<Schema.Context> {
  protected get dataSource(): MongoDataSource<ContextDbObject, ResolverContext> {
    return this.dataSources.contexts;
  }

  public get name(): Promise<string> {
    return this.dbObject.then((obj: ContextDbObject) => obj.name);
  }

  public get stub(): Promise<string> {
    return this.dbObject.then((obj: ContextDbObject) => obj.stub);
  }

  public async user(): Promise<User> {
    return this.dbObject.then((obj: ContextDbObject) => new User(this.resolverContext, obj.user));
  }

  public async rootProjects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      context: this.dbId,
      parent: null,
    });
  }
}

export class Project extends BaseImpl<ProjectDbObject> implements SchemaResolver<Schema.Project> {
  protected get dataSource(): MongoDataSource<ProjectDbObject, ResolverContext> {
    return this.dataSources.projects;
  }

  public async parent(): Promise<Project | null> {
    return this.dbObject.then((obj: ProjectDbObject) => {
      if (!obj.parent) {
        return null;
      }

      return new Project(this.resolverContext, obj.parent);
    });
  }

  public get name(): Promise<string> {
    return this.dbObject.then((obj: ContextDbObject) => obj.name);
  }

  public get stub(): Promise<string> {
    return this.dbObject.then((obj: ContextDbObject) => obj.stub);
  }

  public async context(): Promise<Context | null> {
    return this.dbObject.then((obj: ProjectDbObject) => {
      if (!obj.context) {
        return null;
      }

      return new Context(this.resolverContext, obj.context);
    });
  }

  public async user(): Promise<User> {
    return this.dbObject.then((obj: ProjectDbObject) => new User(this.resolverContext, obj.user));
  }

  public async subprojects(): Promise<Project[]> {
    return this.dataSources.projects.find({
      parent: this.dbId,
    });
  }

  public async setParent(parent: ObjectId | null): Promise<void> {
    if (parent) {
      let parentProject = await this.dataSources.projects.get(parent);
      if (!parentProject) {
        throw new Error("Parent does not exist.");
      }

      let context = await parentProject.context();

      await this.dataSources.projects.updateOne(this.dbId, {
        context: context ? context.dbId : null,
        parent: parent,
      });
    } else {
      await this.dataSources.projects.updateOne(this.dbId, {
        parent: null,
      });
    }
  }

  public async setContext(context: ObjectId | null): Promise<void> {
    await this.dataSources.projects.updateOne(this.dbId, {
      context,
      parent: null,
    });
  }
}
