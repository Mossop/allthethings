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
import type {
  DbEntity,
  ContextDbObject,
  ProjectDbObject,
  SectionDbObject,
  UserDbObject,
} from "./types";

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

export function equals(
  a: DbEntity | string | null | undefined,
  b: DbEntity | string | null | undefined,
): boolean {
  if (!a) {
    return !b;
  }

  if (!b) {
    return false;
  }

  a = typeof a == "string" ? a : a.id;
  b = typeof b == "string" ? b : b.id;

  return a == b;
}

export type Item = Schema.Item;
export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;
export type ItemGroup = User | Project | Context | Section;

abstract class BaseImpl<D extends DbEntity = DbEntity> {
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

  protected async update(props: Partial<Omit<D, "id" | "stub">>): Promise<void> {
    let newObject = await this.dataSource.updateOne(this.id, props);
    if (!newObject) {
      throw new Error("Missing item in database.");
    }
    this._dbObject = Promise.resolve(newObject);
  }
}

abstract class TaskListImpl<
  T extends DbEntity,
> extends BaseImpl<T> implements SchemaResolver<Schema.TaskList> {
  public abstract subprojects(): Promise<readonly Project[]>;
  public abstract sections(): Promise<readonly Section[]>;
  public async items(): Promise<readonly Item[]> {
    return [];
  }
}

abstract class ProjectRootImpl<
  T extends DbEntity,
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

  public async contexts(): Promise<readonly Context[]> {
    return this.dataSources.contexts.find({
      userId: this.id,
    });
  }

  public async subprojects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      parentId: this.id,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      contextId: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      projectId: this.id,
    });
  }

  public async email(): Promise<string> {
    return (await this.dbObject).email;
  }

  public async password(): Promise<string> {
    return (await this.dbObject).password;
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
      parentId: this.id,
    });
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      contextId: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      projectId: this.id,
    });
  }

  public async user(): Promise<User> {
    return new User(this.resolverContext, (await this.dbObject).userId);
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

  protected get dataSource(): ProjectDataSource {
    return this.dataSources.projects;
  }

  public async user(): Promise<User> {
    return assertValid(await this.dataSources.contexts.getUser((await this.dbObject).contextId));
  }

  public async context(): Promise<Context | null> {
    return this.dataSources.contexts.getOne((await this.dbObject).contextId);
  }

  public async edit(
    props: Partial<Omit<ProjectDbObject, "id" | "stub" | "contextId" | "parentId">>,
  ): Promise<void> {
    return this.update(props);
  }

  public async move(taskList: User | Context | Project): Promise<void> {
    let contextId: string;
    if (taskList instanceof Project) {
      contextId = (await taskList.dbObject).contextId;
    } else {
      contextId = taskList.id;
    }

    await this.dataSource.updateOne(this.id, {
      contextId,
      parentId: taskList.id,
    });
  }

  public async delete(): Promise<void> {
    return this.dataSources.projects.delete(this.id);
  }

  public async subprojects(): Promise<Project[]> {
    return this.dataSources.projects.find({
      parentId: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      projectId: this.id,
    });
  }

  public async stub(): Promise<string> {
    return (await this.dbObject).stub;
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }

  public async taskList(): Promise<Project | User | Context> {
    let { parentId, contextId } = await this.dbObject;
    if (parentId) {
      return new Project(this.resolverContext, parentId);
    }

    let context = await this.dataSources.contexts.getOne(contextId);
    if (context) {
      return context;
    }

    let user = await this.dataSources.users.getOne(contextId);
    return assertValid(user);
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
    props: Partial<Omit<SectionDbObject, "id" | "projectId" | "stub">>,
  ): Promise<void> {
    return this.update(props);
  }

  public async move(
    taskList: User | Context | Project,
    targetIndex: number | null,
  ): Promise<void> {
    let existingSections = await taskList.sections();

    let targetProject = taskList.id;
    let dbObject = await this.dbObject;
    let {
      projectId: existingProject,
      index: existingIndex,
    } = dbObject;

    // The initial index we will move to.
    let dbIndex: number;

    if (existingProject == targetProject) {
      // With nothing else use the current last index.
      if (targetIndex === null || targetIndex > existingSections.length - 1) {
        targetIndex = existingSections.length - 1;
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
      if (targetIndex === null || targetIndex > existingSections.length) {
        targetIndex = existingSections.length;
      }

      dbIndex = targetIndex;
    }

    // Create a gap at the target index.
    await this.dataSource.records
      .where({
        projectId: targetProject,
      })
      .andWhere("index", ">=", dbIndex)
      .update("index", this.dataSource.knex.raw(":index: + 1", {
        index: "index",
      }));

    // Move into the gap.
    await this.dataSource.records
      .where({
        id: this.id,
      })
      .update({
        projectId: targetProject,
        index: dbIndex,
      });

    // Close the gap that was left.
    await this.dataSource.records
      .where({
        projectId: existingProject,
      })
      .andWhere("index", ">", existingIndex)
      .update("index", this.dataSource.knex.raw(":index: - 1", {
        index: "index",
      }));

    dbObject.projectId = targetProject;
    dbObject.index = targetIndex;
  }

  public async delete(): Promise<void> {
    return this.dataSources.sections.delete(this.id);
  }

  public async name(): Promise<string> {
    return (await this.dbObject).name;
  }
}
