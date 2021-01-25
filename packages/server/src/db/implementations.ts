import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { AppDataSources } from "./datasources";
import type { NamedContextDbObject, ProjectDbObject, SectionDbObject, UserDbObject } from "./types";

type Resolver<T> = T | Promise<T> | (() => T | Promise<T>);

type SchemaResolver<T> = {
  [K in keyof Omit<T, "__typename">]: Resolver<SchemaResolver<T[K]>>;
};

export type ImplBuilder<T, D> = new (resolverContext: ResolverContext, dbObject: D) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
function assertValid<T extends {}>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

export function equals<T extends BaseImpl>(
  a: T | string | null | undefined,
  b: T | string | null | undefined,
): boolean {
  if (!a) {
    return !b;
  }

  if (!b) {
    return false;
  }

  a = a instanceof BaseImpl ? a.id : a;
  b = b instanceof BaseImpl ? b.id : b;

  return a == b;
}

interface DbObject {
  id: string;
}

abstract class BaseImpl<T extends DbObject = DbObject> {
  public readonly id: string;
  protected _dbObject: Promise<T> | null;

  public constructor(resolverContext: ResolverContext, dbObject: T);
  public constructor(resolverContext: ResolverContext, id: string);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: T | string,
  ) {
    if (typeof arg == "string") {
      this.id = arg;
      this._dbObject = null;
    } else {
      this.id = arg.id;
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

  public equals(other: BaseImpl<T> | string | undefined | null): boolean {
    return equals(this, other);
  }

  public get dataSources(): AppDataSources {
    return this.resolverContext.dataSources;
  }
}

export type ProjectOwner = User | Project | NamedContext;
export type Context = User | NamedContext;

abstract class ProjectOwnerImpl<
  T extends DbObject,
> extends BaseImpl<T> implements SchemaResolver<Schema.ProjectOwner> {
  public abstract context(): Promise<Context>;
  public abstract subprojects(): Promise<readonly Project[]>;
  public abstract sections(): Promise<readonly Section[]>;
}

abstract class ContextImpl<
  T extends DbObject,
> extends ProjectOwnerImpl<T> implements SchemaResolver<Schema.Context> {
  public abstract projects(): Promise<readonly Project[]>;

  public async projectById(id: string): Promise<Project | null> {
    let projects = await this.projects();
    return projects.find((project: Project): boolean => project.id == id) ?? null;
  }
}

export class User extends ContextImpl<UserDbObject> implements SchemaResolver<Schema.User> {
  protected async getDbObject(): Promise<UserDbObject> {
    return assertValid(await this.dataSources.users.get(this.id));
  }

  public async context(): Promise<Context> {
    return this;
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.id,
      namedContext: null,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.id,
      namedContext: null,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      user: this.id,
      namedContext: null,
      project: null,
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
      user: this.id,
    });
  }
}

export class NamedContext
  extends ContextImpl<NamedContextDbObject> implements SchemaResolver<Schema.NamedContext> {
  protected async getDbObject(): Promise<NamedContextDbObject> {
    return assertValid(await this.dataSources.namedContexts.get(this.id));
  }

  public async context(): Promise<Context> {
    return this;
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      namedContext: this.id,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      namedContext: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      namedContext: this.id,
      project: null,
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

export class Project extends ProjectOwnerImpl<ProjectDbObject>
  implements SchemaResolver<Schema.Project> {
  protected async getDbObject(): Promise<ProjectDbObject> {
    return assertValid(await this.dataSources.projects.get(this.id));
  }

  public async move(owner: User | NamedContext | Project): Promise<void> {
    let update: Partial<Omit<ProjectDbObject, "id">> = {};
    if (owner instanceof User) {
      update.user = owner.id;
      update.parent = null;
      update.namedContext = null;
    } else if (owner instanceof NamedContext) {
      update.user = (await owner.user()).id;
      update.namedContext = owner.id;
      update.parent = null;
    } else {
      let context = await owner.context();
      if (context instanceof NamedContext) {
        update.user = (await context.user()).id;
        update.namedContext = context.id;
      } else {
        update.user = context.id;
        update.namedContext = null;
      }
      update.parent = owner.id;
    }

    let newProject = await this.dataSources.projects.updateOne(this.id, update);
    if (!newProject) {
      throw new Error("Missing project in database.");
    }
    this._dbObject = Promise.resolve(newProject);
  }

  public async delete(): Promise<void> {
    return this.dataSources.projects.delete(this.id);
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
      parent: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      project: this.id,
    });
  }

  public async stub(): Promise<string> {
    return (await this.dbObject).stub;
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }

  public async owner(): Promise<Project | User | NamedContext> {
    let { parent, namedContext, user } = await this.dbObject;
    if (parent) {
      return new Project(this.resolverContext, parent);
    }
    if (namedContext) {
      return new NamedContext(this.resolverContext, namedContext);
    }
    return new User(this.resolverContext, user);
  }
}

export class Section extends BaseImpl<SectionDbObject> implements SchemaResolver<Schema.Section> {
  protected getDbObject(): Promise<SectionDbObject> {
    throw new Error("Method not implemented.");
  }

  public async move(owner: User | NamedContext | Project): Promise<void> {
    let update: Partial<Omit<SectionDbObject, "id">> = {};
    if (owner instanceof User) {
      update.user = owner.id;
      update.project = null;
      update.namedContext = null;
    } else if (owner instanceof NamedContext) {
      update.user = (await owner.user()).id;
      update.namedContext = owner.id;
      update.project = null;
    } else {
      let context = await owner.context();
      if (context instanceof NamedContext) {
        update.user = (await context.user()).id;
        update.namedContext = context.id;
      } else {
        update.user = context.id;
        update.namedContext = null;
      }
      update.project = owner.id;
    }

    let newSection = await this.dataSources.sections.updateOne(this.id, update);
    if (!newSection) {
      throw new Error("Missing section in database.");
    }
    this._dbObject = Promise.resolve(newSection);
  }

  public async delete(): Promise<void> {
    return this.dataSources.sections.delete(this.id);
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }

  public async owner(): Promise<Project | User | NamedContext> {
    let { project, namedContext, user } = await this.dbObject;
    if (project) {
      return new Project(this.resolverContext, project);
    }
    if (namedContext) {
      return new NamedContext(this.resolverContext, namedContext);
    }
    return new User(this.resolverContext, user);
  }
}
