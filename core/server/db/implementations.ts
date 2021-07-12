import type * as Schema from "#schema";
import type { User as PluginUser } from "#server-utils";

import PluginManager from "../plugins";
import type * as Rslv from "../schema/resolvers";
import type * as Src from "./datasources";
import * as Db from "./types";

export type ImplBuilder<I, T> = (dataSources: Src.AppDataSources, dbObject: Db.DbObject<T>) => I;

interface ItemSetArgs {
  filter?: Schema.ItemFilter | null;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function assertValid<T extends {}>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Database inconsistency.");
  }
  return val;
}

type FieldGetter<T> = <K extends keyof Db.DbObject<T>>(key: K) => () => Promise<Db.DbObject<T>[K]>;
function fields<T extends Db.DbTable>(): FieldGetter<T> {
  return <K extends keyof Db.DbObject<T>>(key: K): () => Promise<Db.DbObject<T>[K]> => {
    return async function(this: BaseImpl<T>): Promise<Db.DbObject<T>[K]> {
      return (await this.dbObject)[key];
    };
  };
}

export type TaskList = Project | Context;
export type ItemHolder = TaskList | Section;
export type ItemDetail = NoteDetail | LinkDetail | PluginDetail | FileDetail;

abstract class BaseImpl<T extends Db.DbTable = Db.DbTable> {
  protected readonly _id: string;
  protected _dbObject: Promise<Db.DbObject<T>> | null;

  public constructor(dataSources: Src.AppDataSources, dbObject: Db.DbObject<T>);
  public constructor(dataSources: Src.AppDataSources, id: string);
  public constructor(
    protected readonly dataSources: Src.AppDataSources,
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

  public refresh(): void {
    this._dbObject = this.getDbObject();
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

  public items({ filter }: ItemSetArgs): Src.ItemSet {
    return this.dataSources.items.sectionItems(this._id, filter);
  }
}

export class User extends BaseImpl<Db.UserDbTable>
  implements Rslv.UserResolvers, PluginUser {
  protected get dbObjectDataSource(): Src.UserDataSource {
    return this.dataSources.users;
  }

  public async contexts(): Promise<readonly Context[]> {
    return this.dataSources.contexts.find({
      userId: this._id,
    });
  }

  public async inbox({ filter }: ItemSetArgs): Promise<Src.ItemSet> {
    return this.dataSources.items.sectionItems(null, filter);
  }

  public allItems({ filter }: ItemSetArgs): Src.ItemSet {
    return this.dataSources.items.userItems(this.id(), filter);
  }

  public readonly email = fields<Db.UserDbTable>()("email");
  public readonly isAdmin = fields<Db.UserDbTable>()("isAdmin");
}

export class Context
  extends TaskListImpl<Db.ContextDbTable> implements Rslv.ContextResolvers {
  protected get dbObjectDataSource(): Src.ContextDataSource {
    return this.dataSources.contexts;
  }

  public async projects(): Promise<readonly Project[]> {
    return this.dataSources.projects.find({
      contextId: this._id,
    });
  }

  public async projectById(args: Schema.ContextProjectByIdArgs): Promise<Project | null> {
    let results = await this.dataSources.projects.find({
      contextId: this._id,
      id: args.id,
    });

    return results.length ? results[0] : null;
  }

  public rootItems({ filter }: ItemSetArgs): Src.ItemSet {
    return this.dataSources.items.contextItems(this.id(), filter);
  }

  public override async edit(
    props: Omit<Db.DbUpdateObject<Db.ContextDbTable>, "userId">,
  ): Promise<void> {
    return this.updateDbObject(props);
  }

  public readonly stub = fields<Db.ContextDbTable>()("stub");
  public readonly name = fields<Db.ContextDbTable>()("name");

  public async user(): Promise<User> {
    return new User(this.dataSources, (await this.dbObject).userId);
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

  public override async edit(
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

  public async taskList(): Promise<Project | Context> {
    let { parentId, contextId } = await this.dbObject;
    if (parentId) {
      return new Project(this.dataSources, parentId);
    }

    let context = await this.dataSources.contexts.getImpl(contextId);
    return assertValid(context);
  }
}

export class Section extends BaseImpl<Db.SectionDbTable>
  implements Rslv.SectionResolvers {
  protected get dbObjectDataSource(): Src.SectionDataSource {
    return this.dataSources.sections;
  }

  public items({ filter }: ItemSetArgs): Src.ItemSet {
    return this.dataSources.items.sectionItems(this._id, filter);
  }

  public override async edit(
    props: Omit<Db.DbUpdateObject<Db.SectionDbTable>, "ownerId">,
  ): Promise<void> {
    return this.updateDbObject(props);
  }

  public async move(
    holder: Context | Project,
    before: string | null,
  ): Promise<void> {
    let { userId } = await this.dbObject;
    await this.dbObjectDataSource.move(this._id, userId, holder.id(), before);

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

  public override async delete(): Promise<void> {
    let detail = await this.detail();
    if (detail instanceof PluginDetail) {
      await detail.delete();
    }

    return super.delete();
  }

  public async move(
    parent: ItemHolder | null,
    before: string | null,
  ): Promise<void> {
    let { userId } = await this.dbObject;

    if (parent) {
      await this.dbObjectDataSource.move(this._id, userId, parent.id(), before);
    } else {
      await this.dbObjectDataSource.remove(this._id);
    }

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
  public readonly snoozed = fields<Db.ItemDbTable>()("snoozed");
  public readonly summary = fields<Db.ItemDbTable>()("summary");
}

export class TaskInfo extends BaseImpl<Db.TaskInfoDbTable>
  implements Rslv.TaskInfoResolvers {
  protected get dbObjectDataSource(): Src.TaskInfoSource {
    return this.dataSources.taskInfo;
  }

  public readonly manualDue = fields<Db.TaskInfoDbTable>()("manualDue");
  public readonly due = fields<Db.TaskInfoDbTable>()("due");
  public readonly done = fields<Db.TaskInfoDbTable>()("done");
  public readonly controller = fields<Db.TaskInfoDbTable>()("controller");
}

abstract class Detail<T extends Db.DbTable = Db.DbTable> extends BaseImpl<T> {
  public async item(): Promise<Item> {
    let item = await this.dataSources.items.getImpl(this._id);
    if (!item) {
      throw new Error(`Missing item record for id ${this._id}`);
    }
    return item;
  }
}

export class LinkDetail extends Detail<Db.LinkDetailDbTable>
  implements Rslv.LinkDetailResolvers {
  protected get dbObjectDataSource(): Src.LinkDetailSource {
    return this.dataSources.linkDetail;
  }

  public readonly icon = fields<Db.LinkDetailDbTable>()("icon");
  public readonly url = fields<Db.LinkDetailDbTable>()("url");
}

export class NoteDetail extends Detail<Db.NoteDetailDbTable>
  implements Rslv.NoteDetailResolvers {
  protected get dbObjectDataSource(): Src.NoteDetailSource {
    return this.dataSources.noteDetail;
  }

  public readonly note = fields<Db.NoteDetailDbTable>()("note");
}

export class FileDetail extends Detail<Db.FileDetailDbTable>
  implements Rslv.FileDetailResolvers {
  protected get dbObjectDataSource(): Src.FileDetailSource {
    return this.dataSources.fileDetail;
  }

  public readonly filename = fields<Db.FileDetailDbTable>()("filename");
  public readonly mimetype = fields<Db.FileDetailDbTable>()("mimetype");
  public readonly size = fields<Db.FileDetailDbTable>()("size");
}

export class PluginDetail extends Detail<Db.PluginDetailDbTable>
  implements Rslv.PluginDetailResolvers {
  protected get dbObjectDataSource(): Src.PluginDetailSource {
    return this.dataSources.pluginDetail;
  }

  public override async delete(): Promise<void> {
    let item = await this.item();
    let pluginId = await this.pluginId();
    return PluginManager.deleteItem(this.dataSources, item, pluginId);
  }

  public async fields(): Promise<string> {
    let item = await this.item();
    let pluginId = await this.pluginId();
    let fields = await PluginManager.getItemFields(this.dataSources, item, pluginId);
    if (fields === undefined) {
      throw new Error(`No fields defined for ${item.id()} in ${pluginId}`);
    }
    return JSON.stringify(fields);
  }

  public async lists(): Promise<readonly PluginList[]> {
    return this.dataSources.pluginList.getListsForItem(this.id());
  }

  public async wasEverListed(): Promise<boolean> {
    return this.dataSources.pluginList.wasItemEverListed(this.id());
  }

  public async isCurrentlyListed(): Promise<boolean> {
    return this.dataSources.pluginList.isItemCurrentlyListed(this.id());
  }

  public readonly pluginId = fields<Db.PluginDetailDbTable>()("pluginId");
  public readonly hasTaskState = fields<Db.PluginDetailDbTable>()("hasTaskState");
  public readonly taskDone = fields<Db.PluginDetailDbTable>()("taskDone");
  public readonly taskDue = fields<Db.PluginDetailDbTable>()("taskDue");
}

export class PluginList extends BaseImpl<Db.PluginListDbTable>
  implements Rslv.PluginListResolvers {
  protected get dbObjectDataSource(): Src.PluginListSource {
    return this.dataSources.pluginList;
  }

  public readonly pluginId = fields<Db.PluginListDbTable>()("pluginId");
  public readonly name = fields<Db.PluginListDbTable>()("name");
  public readonly url = fields<Db.PluginListDbTable>()("url");
}
