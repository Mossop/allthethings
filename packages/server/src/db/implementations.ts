import type { DateTime } from "luxon";

import PluginManager from "../plugins";
import type { ResolverContext } from "../schema/context";
import type * as Schema from "../schema/types";
import * as Src from "./datasources";
import type * as Db from "./types";

type Resolver<T> = T | Promise<T> | (() => T | Promise<T>);

type SchemaResolver<T> =
  T extends DateTime
    ? DateTime
    : {
      [K in keyof Omit<T, "__typename">]: Resolver<SchemaResolver<T[K]>>;
    };

export type ImplBuilder<I, T> = (resolverContext: ResolverContext, dbObject: Db.DbObject<T>) => I;

// eslint-disable-next-line @typescript-eslint/ban-types
function assertValid<T extends {}>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

export function equals(
  a: Db.DbEntity | string | null | undefined,
  b: Db.DbEntity | string | null | undefined,
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

type FieldGetter<T> = <K extends keyof Db.DbObject<T>>(key: K) => () => Promise<Db.DbObject<T>[K]>;
function fields<T extends Db.DbTable>(): FieldGetter<T> {
  return <K extends keyof Db.DbObject<T>>(key: K): () => Promise<Db.DbObject<T>[K]> => {
    return async function(this: BaseImpl<T>): Promise<Db.DbObject<T>[K]> {
      return (await this.dbObject)[key];
    };
  };
}
function instanceFields<T extends Db.DbTable>(): FieldGetter<T> {
  return <K extends keyof Db.DbObject<T>>(key: K): () => Promise<Db.DbObject<T>[K]> => {
    return async function(this: ItemImpl<T>): Promise<Db.DbObject<T>[K]> {
      return (await this.instanceDbObject)[key];
    };
  };
}

export type Item = TaskItem | LinkItem | NoteItem | FileItem | PluginItem;
export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;
export type ItemGroup = User | Project | Context | Section;

abstract class BaseImpl<T extends Db.DbTable = Db.DbTable> {
  public readonly id: string;
  protected _dbObject: Promise<Db.DbObject<T>> | null;

  public constructor(resolverContext: ResolverContext, dbObject: Db.DbObject<T>);
  public constructor(resolverContext: ResolverContext, id: string);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: Db.DbObject<T> | string,
  ) {
    if (typeof arg == "string") {
      this.id = arg;
      this._dbObject = null;
    } else {
      this.id = arg.id;
      this._dbObject = Promise.resolve(arg);
    }
  }

  protected async getDbObject(): Promise<Db.DbObject<T>> {
    return assertValid(await this.dbObjectDataSource.get(this.id));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract readonly dbObjectDataSource: Src.DbDataSource<any, T>;

  protected get dbObject(): Promise<Db.DbObject<T>> {
    if (this._dbObject) {
      return this._dbObject;
    }

    this._dbObject = this.getDbObject();

    return this._dbObject;
  }

  public get dataSources(): Src.AppDataSources {
    return this.resolverContext.dataSources;
  }

  protected async updateDbObject(props: Db.DbUpdateObject<T>): Promise<void> {
    let newObject = await this.dbObjectDataSource.updateOne(this.id, props);
    if (!newObject) {
      throw new Error("Missing item in database.");
    }
    this._dbObject = Promise.resolve(newObject);
  }

  public edit(props: Db.DbUpdateObject<T>): Promise<void> {
    return this.updateDbObject(props);
  }

  public async delete(): Promise<void> {
    return this.dbObjectDataSource.delete(this.id);
  }
}

abstract class TaskListImpl<
  T extends Db.DbTable,
> extends BaseImpl<T> implements SchemaResolver<Schema.TaskList> {
  public async remainingTasks(): Promise<number> {
    return this.dataSources.tasks.taskListTaskCount(this.id);
  }

  public async subprojects(): Promise<Project[]> {
    return this.dataSources.projects.find({
      parentId: this.id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      ownerId: this.id,
    });
  }

  public async items(): Promise<readonly Item[]> {
    return this.dataSources.items.listSpecialSection(this.id, Src.SectionIndex.Anonymous);
  }
}

abstract class ProjectRootImpl<
  T extends Db.DbTable,
> extends TaskListImpl<T> implements SchemaResolver<Schema.ProjectRoot> {
  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      contextId: this.id,
    });
  }

  public async projectById(id: string): Promise<Project | null> {
    let results = await this.dataSources.projects.find({
      contextId: this.id,
      id,
    });

    return results.length ? results[0] : null;
  }
}

export class User extends ProjectRootImpl<Db.UserDbTable> implements SchemaResolver<Schema.User> {
  protected get dbObjectDataSource(): Src.UserDataSource {
    return this.dataSources.users;
  }

  public async contexts(): Promise<readonly Context[]> {
    return this.dataSources.contexts.find({
      userId: this.id,
    });
  }

  public async inbox(): Promise<Inbox> {
    let record = assertValid(
      await this.dataSources.sections.getSpecialSection(this.id, Src.SectionIndex.Inbox),
    );

    return new Inbox(this.resolverContext, record);
  }

  public readonly email = fields<Db.UserDbTable>()("email");
}

export class Context
  extends ProjectRootImpl<Db.ContextDbTable> implements SchemaResolver<Schema.Context> {
  protected get dbObjectDataSource(): Src.ContextDataSource {
    return this.dataSources.contexts;
  }

  public async edit(
    props: Omit<Db.DbUpdateObject<Db.ContextDbTable>, "userId">,
  ): Promise<void> {
    return this.updateDbObject(props);
  }

  public readonly stub = fields<Db.ContextDbTable>()("stub");
  public readonly name = fields<Db.ContextDbTable>()("name");

  public async user(): Promise<User> {
    return new User(this.resolverContext, (await this.dbObject).userId);
  }
}

export class Project extends TaskListImpl<Db.ProjectDbTable>
  implements SchemaResolver<Schema.Project> {
  protected get dbObjectDataSource(): Src.ProjectDataSource {
    return this.dataSources.projects;
  }

  public async user(): Promise<User> {
    return assertValid(await this.dataSources.contexts.getUser((await this.dbObject).contextId));
  }

  public async context(): Promise<Context | null> {
    return this.dataSources.contexts.getOne((await this.dbObject).contextId);
  }

  public async edit(
    props: Omit<Db.DbUpdateObject<Db.ProjectDbTable>, "contextId" | "parentId">,
  ): Promise<void> {
    return this.updateDbObject(props);
  }

  public async move(taskList: User | Context | Project): Promise<void> {
    let contextId: string;
    if (taskList instanceof Project) {
      contextId = (await taskList.dbObject).contextId;
    } else {
      contextId = taskList.id;
    }

    await this.dbObjectDataSource.updateOne(this.id, {
      contextId,
      parentId: taskList.id,
    });
  }

  public readonly stub = fields<Db.ProjectDbTable>()("stub");
  public readonly name = fields<Db.ProjectDbTable>()("name");

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

abstract class SpecialSection {
  public constructor(
    protected readonly resolverContext: ResolverContext,
    protected readonly dbObject: Db.DbObject<Db.SectionDbTable>,
  ) {
  }

  public get dataSources(): Src.AppDataSources {
    return this.resolverContext.dataSources;
  }

  public get id(): string {
    return this.dbObject.id;
  }

  public async items(): Promise<Item[]> {
    return this.dataSources.items.find({
      ownerId: this.id,
    });
  }
}

export class Inbox extends SpecialSection implements SchemaResolver<Schema.Inbox> {
}

export class Section extends BaseImpl<Db.SectionDbTable>
  implements SchemaResolver<Schema.Section> {
  protected get dbObjectDataSource(): Src.SectionDataSource {
    return this.dataSources.sections;
  }

  public async remainingTasks(): Promise<number> {
    return this.dataSources.tasks.sectionTaskCount(this.id);
  }

  public async items(): Promise<readonly Item[]> {
    return this.dataSources.items.find({
      ownerId: this.id,
    });
  }

  public async edit(
    props: Omit<Db.DbUpdateObject<Db.SectionDbTable>, "ownerId">,
  ): Promise<void> {
    return this.updateDbObject(props);
  }

  public async move(
    taskList: User | Context | Project,
    before: string | null,
  ): Promise<void> {
    await this.dbObjectDataSource.move(this.id, taskList.id, before);

    this._dbObject = null;
  }

  public readonly index = fields<Db.SectionDbTable>()("index");
  public readonly name = fields<Db.SectionDbTable>()("name");
}

type ProvideEither<A, B> = [A, B | null] | [A | null, B];

abstract class ItemImpl<T extends Db.DbTable = Db.DbTable> extends BaseImpl<Db.ItemDbTable>
  implements SchemaResolver<Schema.Item> {
  protected _instanceDbObject: Promise<Db.DbObject<T>> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract readonly instanceDbObjectDataSource: Src.DbDataSource<any, T>;

  public constructor(
    resolverContext: ResolverContext,
    dbObject: Db.DbObject<Db.ItemDbTable>,
    instanceDbObject: Db.DbObject<T> | null,
  );
  public constructor(
    resolverContext: ResolverContext,
    dbObject: Db.DbObject<Db.ItemDbTable> | null,
    instanceDbObject: Db.DbObject<T>,
  );
  public constructor(resolverContext: ResolverContext, id: string);
  public constructor(
    resolverContext: ResolverContext,
    ...args: ProvideEither<Db.DbObject<Db.ItemDbTable>, Db.DbObject<T>> | [string]
  ) {
    // @ts-ignore
    super(resolverContext, args[0] ?? args[1].id);

    if (args.length == 1) {
      this._instanceDbObject = null;
    } else {
      let [, instanceDbObject] = args;
      if (instanceDbObject) {
        if (this.id != instanceDbObject.id) {
          throw new Error("ID mismatch.");
        }
        this._instanceDbObject = Promise.resolve(instanceDbObject);
      } else {
        this._instanceDbObject = null;
      }
    }
  }

  protected get dbObjectDataSource(): Src.ItemDataSource {
    return this.dataSources.items;
  }

  protected async getInstanceDbObject(): Promise<Db.DbObject<T>> {
    return assertValid(await this.instanceDbObjectDataSource.get(this.id));
  }

  protected get instanceDbObject(): Promise<Db.DbObject<T>> {
    if (this._instanceDbObject) {
      return this._instanceDbObject;
    }

    this._instanceDbObject = this.getInstanceDbObject();

    return this._instanceDbObject;
  }

  protected async updateInstanceDbObject(props: Db.DbUpdateObject<T>): Promise<void> {
    let newObject = await this.instanceDbObjectDataSource.updateOne(this.id, props);
    if (!newObject) {
      throw new Error("Missing item in database.");
    }
    this._instanceDbObject = Promise.resolve(newObject);
  }

  public async edit(
    {
      summary,
      archived,
      ...props
    }: Db.DbUpdateObject<Db.ItemDbTable> & Db.DbUpdateObject<T>,
  ): Promise<void> {
    await this.updateDbObject({
      summary,
      archived,
    });
    // @ts-ignore
    await this.updateInstanceDbObject(props);
  }

  public async move(parent: TaskList | Section, before: string | null): Promise<void> {
    await this.dbObjectDataSource.move(this.id, parent.id, before);

    this._dbObject = null;
  }

  public readonly created = fields<Db.ItemDbTable>()("created");
  public readonly archived = fields<Db.ItemDbTable>()("archived");
  public readonly summary = fields<Db.ItemDbTable>()("summary");
}

export class TaskItem extends ItemImpl<Db.TaskItemDbTable> implements SchemaResolver<Schema.Task> {
  protected get instanceDbObjectDataSource(): Src.TaskItemDataSource {
    return this.dataSources.tasks;
  }

  public readonly due = instanceFields<Db.TaskItemDbTable>()("due");
  public readonly done = instanceFields<Db.TaskItemDbTable>()("done");
}

export class FileItem extends ItemImpl<Db.FileItemDbTable> implements SchemaResolver<Schema.File> {
  protected get instanceDbObjectDataSource(): Src.FileItemDataSource {
    return this.dataSources.files;
  }

  public readonly path = instanceFields<Db.FileItemDbTable>()("path");
  public readonly filename = instanceFields<Db.FileItemDbTable>()("filename");
  public readonly mimetype = instanceFields<Db.FileItemDbTable>()("mimetype");
  public readonly size = instanceFields<Db.FileItemDbTable>()("size");
}

export class NoteItem extends ItemImpl<Db.NoteItemDbTable> implements SchemaResolver<Schema.Note> {
  protected get instanceDbObjectDataSource(): Src.NoteItemDataSource {
    return this.dataSources.notes;
  }

  public readonly note = instanceFields<Db.NoteItemDbTable>()("note");
}

export class LinkItem extends ItemImpl<Db.LinkItemDbTable> implements SchemaResolver<Schema.Link> {
  protected get instanceDbObjectDataSource(): Src.LinkItemDataSource {
    return this.dataSources.links;
  }

  public readonly link = instanceFields<Db.LinkItemDbTable>()("link");
}

export class PluginItem extends ItemImpl<Db.PluginItemDbTable>
  implements SchemaResolver<Schema.PluginItem> {
  protected get instanceDbObjectDataSource(): Src.PluginItemDataSource {
    return this.dataSources.pluginItems;
  }

  public readonly pluginId = instanceFields<Db.PluginItemDbTable>()("pluginId");
  public readonly due = instanceFields<Db.PluginItemDbTable>()("due");
  public readonly done = instanceFields<Db.PluginItemDbTable>()("done");

  public async pluginFields(): Promise<string> {
    let pluginId = await this.pluginId();
    let fields = await PluginManager.getItemFields(this.id, pluginId);
    return JSON.stringify(fields);
  }
}
