import type { ObjectId } from "mongodb";

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
function assertValid<T extends {}>(val: T | null): T {
  if (val === null) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

export function equals<T extends BaseImpl<DbObject>>(
  a: T | null | undefined,
  b: T | null | undefined,
): boolean {
  if (!a) {
    return !b;
  }

  return a.equals(b);
}

class BaseImpl<T extends DbObject> {
  public constructor(
    protected readonly resolverContext: ResolverContext,
    protected readonly dbObject: T,
  ) {
  }

  public equals(other: BaseImpl<T> | undefined | null): boolean {
    if (!other) {
      return false;
    }
    return this.dbId.equals(other.dbId);
  }

  public get dbId(): ObjectId {
    return this.dbObject._id;
  }

  public get id(): string {
    return this.dbObject._id.toHexString();
  }

  public get dataSources(): DataSources {
    return this.resolverContext.dataSources;
  }
}

export class User extends BaseImpl<UserDbObject> implements SchemaResolver<Schema.User> {
  public get email(): string {
    return this.dbObject.email;
  }

  public get password(): string {
    return this.dbObject.password;
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
  public get name(): string {
    return this.dbObject.name;
  }

  public async user(): Promise<User> {
    let user = await this.dataSources.users.get(this.dbObject.user);

    return assertValid(user);
  }

  public async rootProjects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      context: this.dbId,
      parent: null,
    });
  }
}

export class Project extends BaseImpl<ProjectDbObject> implements SchemaResolver<Schema.Project> {
  public async parent(): Promise<Project | null> {
    if (!this.dbObject.parent) {
      return null;
    }

    return this.dataSources.projects.get(this.dbObject.parent);
  }

  public async context(): Promise<Context | null> {
    if (!this.dbObject.context) {
      return null;
    }

    return this.dataSources.contexts.get(this.dbObject.context);
  }

  public async user(): Promise<User> {
    let user = await this.dataSources.users.get(this.dbObject.user);
    return assertValid(user);
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
