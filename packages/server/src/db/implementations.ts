import PluginManager from "../plugins";
import type { ResolverContext } from "../schema/context";
import type * as Rslv from "../schema/resolvers";
import type * as Schema from "../schema/types";
import * as Src from "./datasources";
import * as Db from "./types";

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

export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;
export type ItemDetail = NoteDetail | LinkDetail | PluginDetail | FileDetail;

abstract class BaseImpl<T extends Db.DbTable = Db.DbTable> {
  protected readonly _id: string;
  protected _dbObject: Promise<Db.DbObject<T>> | null;

  public constructor(resolverContext: ResolverContext, dbObject: Db.DbObject<T>);
  public constructor(resolverContext: ResolverContext, id: string);
  public constructor(
    protected readonly resolverContext: ResolverContext,
    arg: Db.DbObject<T> | string,
  ) {
    if (typeof arg == "string") {
      this._id = arg;
      this._dbObject = null;
    } else {
      this._id = arg.id;
      this._dbObject = Promise.resolve(arg);
    }
  }

  public id(): string {
    return this._id;
  }

  protected async getDbObject(): Promise<Db.DbObject<T>> {
    return assertValid(await this.dbObjectDataSource.getRecord(this._id));
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
    let newObject = await this.dbObjectDataSource.updateOne(this._id, props);
    if (!newObject) {
      throw new Error("Missing item in database.");
    }
    this._dbObject = Promise.resolve(newObject);
  }

  public edit(props: Db.DbUpdateObject<T>): Promise<void> {
    return this.updateDbObject(props);
  }

  public async delete(): Promise<void> {
    return this.dbObjectDataSource.delete(this._id);
  }
}

abstract class TaskListImpl<
  T extends Db.DbTable,
> extends BaseImpl<T> implements Omit<Rslv.TaskListResolvers, "__resolveType"> {
  public async remainingTasks(): Promise<number> {
    return this.dataSources.taskInfo.taskListTaskCount(this._id);
  }

  public async subprojects(): Promise<Project[]> {
    return this.dataSources.projects.find({
      parentId: this._id,
    });
  }

  public async sections(): Promise<readonly Section[]> {
    return this.dataSources.sections.find({
      ownerId: this._id,
    });
  }

  public async items(): Promise<readonly Item[]> {
    return this.dataSources.items.listSpecialSection(this._id, Src.SectionIndex.Anonymous);
  }
}

abstract class ProjectRootImpl<
  T extends Db.DbTable,
> extends TaskListImpl<T> implements Omit<Rslv.ProjectRootResolvers, "__resolveType"> {
  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      contextId: this._id,
    });
  }

  public async projectById(
    parent: unknown,
    args: Schema.ProjectRootProjectByIdArgs,
  ): Promise<Project | null> {
    let results = await this.dataSources.projects.find({
      contextId: this._id,
      id: args.id,
    });

    return results.length ? results[0] : null;
  }
}

export class User extends ProjectRootImpl<Db.UserDbTable>
  implements Rslv.UserResolvers {
  protected get dbObjectDataSource(): Src.UserDataSource {
    return this.dataSources.users;
  }

  public async contexts(): Promise<readonly Context[]> {
    return this.dataSources.contexts.find({
      userId: this._id,
    });
  }

  public async inbox(): Promise<Inbox> {
    let record = assertValid(
      await this.dataSources.sections.getSpecialSection(this._id, Src.SectionIndex.Inbox),
    );

    return new Inbox(this.resolverContext, record);
  }

  public readonly email = fields<Db.UserDbTable>()("email");
}

export class Context
  extends ProjectRootImpl<Db.ContextDbTable> implements Rslv.ContextResolvers {
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
  implements Rslv.ProjectResolvers {
  protected get dbObjectDataSource(): Src.ProjectDataSource {
    return this.dataSources.projects;
  }

  public async user(): Promise<User> {
    return assertValid(await this.dataSources.contexts.getUser((await this.dbObject).contextId));
  }

  public async context(): Promise<Context | null> {
    return this.dataSources.contexts.getImpl((await this.dbObject).contextId);
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
      contextId = taskList.id();
    }

    await this.dbObjectDataSource.updateOne(this._id, {
      contextId,
      parentId: taskList.id(),
    });
  }

  public readonly stub = fields<Db.ProjectDbTable>()("stub");
  public readonly name = fields<Db.ProjectDbTable>()("name");

  public async taskList(): Promise<Project | User | Context> {
    let { parentId, contextId } = await this.dbObject;
    if (parentId) {
      return new Project(this.resolverContext, parentId);
    }

    let context = await this.dataSources.contexts.getImpl(contextId);
    if (context) {
      return context;
    }

    let user = await this.dataSources.users.getImpl(contextId);
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

  public id(): string {
    return this.dbObject.id;
  }

  public async items(): Promise<Item[]> {
    return this.dataSources.items.find({
      ownerId: this.id(),
    });
  }
}

export class Inbox extends SpecialSection implements Rslv.InboxResolvers {
}

export class Section extends BaseImpl<Db.SectionDbTable>
  implements Rslv.SectionResolvers {
  protected get dbObjectDataSource(): Src.SectionDataSource {
    return this.dataSources.sections;
  }

  public async remainingTasks(): Promise<number> {
    return this.dataSources.taskInfo.sectionTaskCount(this._id);
  }

  public async items(): Promise<readonly Item[]> {
    return this.dataSources.items.find({
      ownerId: this._id,
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
    await this.dbObjectDataSource.move(this._id, taskList.id(), before);

    this._dbObject = null;
  }

  public readonly index = fields<Db.SectionDbTable>()("index");
  public readonly name = fields<Db.SectionDbTable>()("name");
}

export class Item extends BaseImpl<Db.ItemDbTable>
  implements Rslv.ItemResolvers {
  protected get dbObjectDataSource(): Src.ItemDataSource {
    return this.dataSources.items;
  }

  public async move(parent: TaskList | Section, before: string | null): Promise<void> {
    await this.dbObjectDataSource.move(this._id, parent.id(), before);

    this._dbObject = null;
  }

  public async taskInfo(): Promise<TaskInfo | null> {
    return this.dataSources.taskInfo.getImpl(this._id);
  }

  public async detail(): Promise<ItemDetail | null> {
    switch (await this.type()) {
      case null:
        return null;
      case Db.ItemType.File:
        return this.dataSources.fileDetail.getImpl(this.id());
      case Db.ItemType.Note:
        return this.dataSources.noteDetail.getImpl(this.id());
      case Db.ItemType.Plugin:
        return this.dataSources.pluginDetail.getImpl(this.id());
      case Db.ItemType.Link:
        return this.dataSources.linkDetail.getImpl(this.id());
    }
  }

  public readonly type = fields<Db.ItemDbTable>()("type");
  public readonly created = fields<Db.ItemDbTable>()("created");
  public readonly archived = fields<Db.ItemDbTable>()("archived");
  public readonly snoozed = fields<Db.ItemDbTable>()("archived");
  public readonly summary = fields<Db.ItemDbTable>()("summary");
}

export class TaskInfo extends BaseImpl<Db.TaskInfoDbTable>
  implements Rslv.TaskInfoResolvers {
  protected get dbObjectDataSource(): Src.TaskInfoSource {
    return this.dataSources.taskInfo;
  }

  public readonly due = fields<Db.TaskInfoDbTable>()("due");
  public readonly done = fields<Db.TaskInfoDbTable>()("done");
}

export class LinkDetail extends BaseImpl<Db.LinkDetailDbTable>
  implements Rslv.LinkDetailResolvers {
  protected get dbObjectDataSource(): Src.LinkDetailSource {
    return this.dataSources.linkDetail;
  }

  public readonly icon = fields<Db.LinkDetailDbTable>()("icon");
  public readonly url = fields<Db.LinkDetailDbTable>()("url");
}

export class NoteDetail extends BaseImpl<Db.NoteDetailDbTable>
  implements Rslv.NoteDetailResolvers {
  protected get dbObjectDataSource(): Src.NoteDetailSource {
    return this.dataSources.noteDetail;
  }

  public readonly note = fields<Db.NoteDetailDbTable>()("note");
}

export class FileDetail extends BaseImpl<Db.FileDetailDbTable>
  implements Rslv.FileDetailResolvers {
  protected get dbObjectDataSource(): Src.FileDetailSource {
    return this.dataSources.fileDetail;
  }

  public readonly filename = fields<Db.FileDetailDbTable>()("filename");
  public readonly mimetype = fields<Db.FileDetailDbTable>()("mimetype");
  public readonly size = fields<Db.FileDetailDbTable>()("size");
}

export class PluginDetail extends BaseImpl<Db.PluginDetailDbTable>
  implements Rslv.PluginDetailResolvers {
  protected get dbObjectDataSource(): Src.PluginDetailSource {
    return this.dataSources.pluginDetail;
  }

  public async fields(): Promise<string> {
    let pluginId = await this.pluginId();
    let fields = await PluginManager.getItemFields(this._id, pluginId);
    return JSON.stringify(fields);
  }

  public readonly pluginId = fields<Db.PluginDetailDbTable>()("pluginId");
}
