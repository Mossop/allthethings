import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import type {
  AppDataSources,
  ContextDataSource,
  DbDataSource,
  ProjectDataSource,
  SectionDataSource,
  UserDataSource,
} from "./datasources";
import { stub } from "./datasources";
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

export function equals<D extends DbObject, T extends BaseImpl<D>>(
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

export type Item = Schema.Item;
export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;
export type ItemGroup = User | Project | Context | Section;

abstract class BaseImpl<D extends DbObject = DbObject> {
  public readonly id: string;
  protected _dbObject: Promise<D> | null;

  public constructor(resolverContext: ResolverContext, dbObject: D);
  public constructor(resolverContext: ResolverContext, id: string);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: D | string,
  ) {
    if (typeof arg == "string") {
      this.id = arg;
      this._dbObject = null;
    } else {
      this.id = arg.id;
      this._dbObject = Promise.resolve(arg);
    }
  }

  protected abstract getDbObject(): Promise<D>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract readonly dataSource: DbDataSource<any, D>;

  protected get dbObject(): Promise<D> {
    if (this._dbObject) {
      return this._dbObject;
    }

    this._dbObject = this.getDbObject();

    return this._dbObject;
  }

  public equals(other: BaseImpl<D> | string | undefined | null): boolean {
    // @ts-ignore
    return equals(this, other);
  }

  public get dataSources(): AppDataSources {
    return this.resolverContext.dataSources;
  }

  protected async update(props: Partial<Omit<D, "id">>): Promise<void> {
    let newObject = await this.dataSource.updateOne(this.id, props);
    if (!newObject) {
      throw new Error("Missing item in database.");
    }
    this._dbObject = Promise.resolve(newObject);
  }
}

abstract class TaskListImpl<
  T extends DbObject,
> extends BaseImpl<T> implements SchemaResolver<Schema.TaskList> {
  public abstract subprojects(): Promise<readonly Project[]>;
  public abstract sections(): Promise<readonly Section[]>;
  public async items(): Promise<readonly Item[]> {
    return [];
  }
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

  protected get dataSource(): UserDataSource {
    return this.dataSources.users;
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

  protected get dataSource(): ContextDataSource {
    return this.dataSources.contexts;
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
    return stub(await this.name());
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

  protected get dataSource(): ProjectDataSource {
    return this.dataSources.projects;
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

  public async edit(
    props: Partial<Omit<ProjectDbObject, "id" | "user" | "context" | "parent">>,
  ): Promise<void> {
    return this.update(props);
  }

  public async move(taskList: User | Context | Project): Promise<void> {
    let { user, project: parent, context } = await getTaskListIds(taskList);
    await this.update({
      user,
      parent,
      context,
    });
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
    return stub(await this.name());
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

  protected get dataSource(): SectionDataSource {
    return this.dataSources.sections;
  }

  public async items(): Promise<readonly Item[]> {
    return [];
  }

  public async edit(
    props: Partial<Omit<SectionDbObject, "id" | "user" | "context" | "project">>,
  ): Promise<void> {
    return this.update(props);
  }

  public async move(
    taskList: User | Context | Project,
    targetIndex: number | null | undefined,
  ): Promise<void> {
    let {
      user: targetUser,
      context: targetContext,
      project: targetProject,
    } = await getTaskListIds(taskList);
    let existing = await taskList.sections();

    let dbObject = await this.dbObject;
    let {
      user: existingUser,
      context: existingContext,
      project: existingProject,
      index: existingIndex,
    } = dbObject;

    // The initial index we will move to.
    let dbIndex: number;

    if (existingUser == targetUser &&
      existingContext == targetContext &&
      existingProject == targetProject) {
      // With nothing else use the current last index.
      if (targetIndex === null || targetIndex === undefined || targetIndex > existing.length - 1) {
        targetIndex = existing.length - 1;
      }

      if (existingIndex == targetIndex) {
        // Same tasklist, same index. Nothing to do.
        return;
      }

      // Have to re-order the list.

      // If we're moving to a higher position then initially move to one index above as we will be
      // decrementing all the indexes above the existing position.
      dbIndex = existingIndex < targetIndex ? targetIndex + 1 : targetIndex;
    } else {
      // With nothing else use the new last index.
      if (targetIndex === null || targetIndex === undefined || targetIndex > existing.length) {
        targetIndex = existing.length;
      }

      dbIndex = targetIndex;
    }

    // Create a gap at the target index.
    await this.dataSource.table
      .where({
        user: targetUser,
        context: targetContext,
        project: targetProject,
      })
      .andWhere("index", ">=", dbIndex)
      .update("index", this.dataSource.knex.raw(":index: + 1", {
        index: "index",
      }));

    // Move into the gap.
    await this.dataSource.table
      .where({
        id: this.id,
      })
      .update({
        user: targetUser,
        context: targetContext,
        project: targetProject,
        index: dbIndex,
      });

    // Close the gap that was left.
    await this.dataSource.table
      .where({
        user: existingUser,
        context: existingContext,
        project: existingProject,
      })
      .andWhere("index", ">", existingIndex)
      .update("index", this.dataSource.knex.raw(":index: - 1", {
        index: "index",
      }));

    dbObject.user = targetUser;
    dbObject.context = targetContext;
    dbObject.project = targetProject;
    dbObject.index = targetIndex;
  }

  public async delete(): Promise<void> {
    return this.dataSources.sections.delete(this.id);
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }
}
