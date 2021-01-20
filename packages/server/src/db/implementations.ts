import { ObjectId } from "mongodb";

import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { DataSources } from "./datasources";
import { stub } from "./datasources";
import type { NamedContextDbObject, ProjectDbObject, UserDbObject } from "./types";

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
function assertValid<T extends {}>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

export function equals<T extends BaseImpl>(
  a: T | ObjectId | null | undefined,
  b: T | ObjectId | null | undefined,
): boolean {
  if (!a) {
    return !b;
  }

  if (!b) {
    return false;
  }

  a = a instanceof BaseImpl ? a.dbId : a;
  b = b instanceof BaseImpl ? b.dbId : b;

  return a.equals(b);
}

abstract class BaseImpl<T extends DbObject = DbObject> {
  public readonly dbId: ObjectId;
  protected _dbObject: Promise<T> | null;

  public constructor(resolverContext: ResolverContext, dbObject: T);
  public constructor(resolverContext: ResolverContext, id: ObjectId);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: T | ObjectId,
  ) {
    if (arg instanceof ObjectId) {
      this.dbId = arg;
      this._dbObject = null;
    } else {
      this.dbId = arg._id;
      this._dbObject = Promise.resolve(arg);
    }
  }

  protected abstract getDbObject(): Promise<T>;

  protected get dbObject(): Promise<T> {
    if (this._dbObject) {
      return this._dbObject;
    }

    this._dbObject = this.getDbObject();

    return this._dbObject;
  }

  public equals(other: BaseImpl<T> | ObjectId | undefined | null): boolean {
    return equals(this, other);
  }

  public get id(): string {
    return this.dbId.toHexString();
  }

  public get dataSources(): DataSources {
    return this.resolverContext.dataSources;
  }
}

export type Owner = User | Project | NamedContext;
export type Context = User | NamedContext;

abstract class OwnerImpl<
  T extends DbObject,
> extends BaseImpl<T> implements SchemaResolver<Schema.Owner> {
  public abstract context(): Promise<Context>;
  public abstract subprojects(): Promise<readonly Project[]>;

  public async projectByStubs({ stubs }: Schema.OwnerProjectByStubsArgs): Promise<Owner | null> {
    if (stubs.length == 0) {
      return this as unknown as Owner;
    }

    let projects = await this.subprojects();
    for (let project of projects) {
      let stub = await project.stub();
      if (stub === stubs[0]) {
        return project.projectByStubs({
          stubs: stubs.slice(1),
        });
      }
    }

    return null;
  }
}

abstract class ContextImpl<
  T extends DbObject,
> extends OwnerImpl<T> implements SchemaResolver<Schema.Context> {
  public abstract projects(): Promise<readonly Project[]>;

  public async projectById(id: string): Promise<Project | null> {
    let projects = await this.projects();
    return projects.find((project: Project): boolean => project.id == id) ?? null;
  }
}

export class User extends ContextImpl<UserDbObject> implements SchemaResolver<Schema.User> {
  protected async getDbObject(): Promise<UserDbObject> {
    return assertValid(await this.dataSources.users.findOneById(this.dbId));
  }

  public async context(): Promise<Context> {
    return this;
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.dbId,
      namedContext: null,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.dbId,
      namedContext: null,
    });
  }

  public async email(): Promise<string> {
    return (await this.dbObject).email;
  }

  public async password(): Promise<string> {
    return (await this.dbObject).password;
  }

  public async namedContexts(): Promise<readonly NamedContext[]> {
    return this.dataSources.namedContexts.find({
      user: this.dbId,
    });
  }
}

export class NamedContext
  extends ContextImpl<NamedContextDbObject> implements SchemaResolver<Schema.NamedContext> {
  protected async getDbObject(): Promise<NamedContextDbObject> {
    return assertValid(await this.dataSources.namedContexts.findOneById(this.dbId));
  }

  public async context(): Promise<Context> {
    return this;
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      namedContext: this.dbId,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      namedContext: this.dbId,
    });
  }

  public async user(): Promise<User> {
    return new User(this.resolverContext, (await this.dbObject).user);
  }

  public async stub(): Promise<string> {
    return (await this.dbObject).stub;
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }
}

type ProjectEditParams = Partial<Pick<ProjectDbObject, "name">> & {
  owner?: User | NamedContext | Project;
};

export class Project extends OwnerImpl<ProjectDbObject> implements SchemaResolver<Schema.Project> {
  protected async getDbObject(): Promise<ProjectDbObject> {
    return assertValid(await this.dataSources.projects.findOneById(this.dbId));
  }

  public async edit({
    owner,
    ...params
  }: ProjectEditParams): Promise<void> {
    let update: Partial<Omit<ProjectDbObject, "_id">> = params;
    if (update.name) {
      update.stub = stub(update.name);
    }

    if (owner) {
      if (owner instanceof User) {
        update.user = owner.dbId;
        update.parent = null;
        update.namedContext = null;
      } else if (owner instanceof NamedContext) {
        update.user = (await owner.user()).dbId;
        update.namedContext = owner.dbId;
        update.parent = null;
      } else {
        let context = await owner.context();
        if (context instanceof NamedContext) {
          update.user = (await context.user()).dbId;
          update.namedContext = context.dbId;
        } else {
          update.user = context.dbId;
          update.namedContext = null;
        }
        update.parent = owner.dbId;
      }
    }

    let newProject = await this.dataSources.projects.updateOne(this.dbId, {
      $set: update,
    });
    if (!newProject) {
      throw new Error("Missing project in database.");
    }
    this._dbObject = Promise.resolve(newProject);
  }

  public async context(): Promise<Context> {
    let obj = await this.dbObject;
    if (obj.namedContext) {
      return new NamedContext(this.resolverContext, obj.namedContext);
    }
    return new User(this.resolverContext, obj.user);
  }

  public async subprojects(): Promise<Project[]> {
    return this.dataSources.projects.find({
      parent: this.dbId,
    });
  }

  public async stub(): Promise<string> {
    return (await this.dbObject).stub;
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }

  public async owner(): Promise<Project | User | NamedContext> {
    let obj = await this.dbObject;
    if (obj.parent) {
      return new Project(this.resolverContext, obj.parent);
    }
    if (obj.namedContext) {
      return new NamedContext(this.resolverContext, obj.namedContext);
    }
    return new User(this.resolverContext, obj.user);
  }
}
