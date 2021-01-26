import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type { AppDataSources } from "./datasources";
import type { ContextDbObject, ProjectDbObject, SectionDbObject, UserDbObject } from "./types";

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

interface TaskListIds {
  user: string;
  context: string | null;
  project: string | null;
}

export async function getTaskListIds(taskList: User | Context | Project): Promise<TaskListIds> {
  if (taskList instanceof User) {
    return {
      user: taskList.id,
      context: null,
      project: null,
    };
  } else if (taskList instanceof Context) {
    return {
      user: (await taskList.user()).id,
      context: null,
      project: null,
    };
  } else {
    return {
      user: (await taskList.user()).id,
      context: (await taskList.context())?.id ?? null,
      project: taskList.id,
    };
  }
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

export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;
export type ItemGroup = User | Project | Context | Section;

abstract class TaskListImpl<
  T extends DbObject,
> extends BaseImpl<T> implements SchemaResolver<Schema.TaskList> {
  public abstract subprojects(): Promise<readonly Project[]>;
  public abstract sections(): Promise<readonly Section[]>;
}

abstract class ProjectRootImpl<
  T extends DbObject,
> extends TaskListImpl<T> implements SchemaResolver<Schema.ProjectRoot> {
  public abstract projects(): Promise<readonly Project[]>;

  public async projectById(id: string): Promise<Project | null> {
    let projects = await this.projects();
    return projects.find((project: Project): boolean => project.id == id) ?? null;
  }
}

export class User extends ProjectRootImpl<UserDbObject> implements SchemaResolver<Schema.User> {
  protected async getDbObject(): Promise<UserDbObject> {
    return assertValid(await this.dataSources.users.get(this.id));
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.id,
      context: null,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      user: this.id,
      context: null,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      user: this.id,
      context: null,
      project: null,
    });
  }

  public async email(): Promise<string> {
    return (await this.dbObject).email;
  }

  public async password(): Promise<string> {
    return (await this.dbObject).password;
  }

  public async contexts(): Promise<readonly Context[]> {
    return this.dataSources.contexts.find({
      user: this.id,
    });
  }
}

export class Context
  extends ProjectRootImpl<ContextDbObject> implements SchemaResolver<Schema.Context> {
  protected async getDbObject(): Promise<ContextDbObject> {
    return assertValid(await this.dataSources.contexts.get(this.id));
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      context: this.id,
      parent: null,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      context: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      context: this.id,
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

export class Project extends TaskListImpl<ProjectDbObject>
  implements SchemaResolver<Schema.Project> {
  protected async getDbObject(): Promise<ProjectDbObject> {
    return assertValid(await this.dataSources.projects.get(this.id));
  }

  public async user(): Promise<User> {
    return new User(this.resolverContext, (await this.dbObject).user);
  }

  public async context(): Promise<Context | null> {
    let { context } = await this.dbObject;
    if (!context) {
      return null;
    }
    return new Context(this.resolverContext, context);
  }

  public async move(taskList: User | Context | Project): Promise<void> {
    let { user, project: parent, context } = await getTaskListIds(taskList);
    let update: Partial<Omit<ProjectDbObject, "id">> = {
      user,
      parent,
      context,
    };

    let newProject = await this.dataSources.projects.updateOne(this.id, update);
    if (!newProject) {
      throw new Error("Missing project in database.");
    }
    this._dbObject = Promise.resolve(newProject);
  }

  public async delete(): Promise<void> {
    return this.dataSources.projects.delete(this.id);
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

  public async taskList(): Promise<Project | User | Context> {
    let { parent, context, user } = await this.dbObject;
    if (parent) {
      return new Project(this.resolverContext, parent);
    }
    if (context) {
      return new Context(this.resolverContext, context);
    }
    return new User(this.resolverContext, user);
  }
}

export class Section extends BaseImpl<SectionDbObject> implements SchemaResolver<Schema.Section> {
  protected getDbObject(): Promise<SectionDbObject> {
    throw new Error("Method not implemented.");
  }

  public async move(taskList: User | Context | Project): Promise<void> {
    let update: Partial<Omit<SectionDbObject, "id">> = await getTaskListIds(taskList);
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
}
