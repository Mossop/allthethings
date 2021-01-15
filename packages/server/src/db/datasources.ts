import type { ModelOrCollection } from "apollo-datasource-mongodb";
import { MongoDataSource } from "apollo-datasource-mongodb";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { FilterQuery, MongoClient, ObjectId, UpdateQuery } from "mongodb";

import type { ResolverContext } from "../schema/context";
import type { DbObjectFor, ImplBuilder } from "./implementations";
import { equals, Context, User, Project } from "./implementations";
import type { ContextDbObject, ProjectDbObject } from "./types";

export interface DbObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: ObjectId;
}

class BaseDataSource<
  T,
  D extends DbObject = DbObjectFor<T>,
> extends MongoDataSource<D, ResolverContext> {
  public constructor(
    collection: ModelOrCollection<D>,
    protected readonly builder: ImplBuilder<T, D>,
  ) {
    super(collection);
  }

  protected build(dbObject: D): T;
  protected build(dbObject: D | null | undefined): T | null;
  protected build(dbObject: D | null | undefined): T | null {
    if (!dbObject) {
      return null;
    }
    return new this.builder(this.context, dbObject);
  }

  public async get(id: string | ObjectId): Promise<T | null> {
    let doc = await this.findOneById(id);
    return this.build(doc);
  }

  public async getAll(ids: string[] | ObjectId[]): Promise<(T | null)[]> {
    let docs = await this.findManyByIds(ids);
    return docs.map(
      (doc: D | null | undefined): T | null => this.build(doc),
    );
  }

  public async find(query: FilterQuery<D> = {}): Promise<T[]> {
    let docs = await this.collection.find<D>(query, {
      projection: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: 1,
      },
    }).toArray();
    return this.getAll(docs.map((doc: D): ObjectId => doc._id)) as Promise<T[]>;
  }

  public async findOne(query: FilterQuery<D>): Promise<T | null> {
    let doc = await this.collection.findOne<D>(query, {
      projection: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: 1,
      },
    });

    return this.build(doc);
  }

  public async update(
    filter: FilterQuery<D>,
    update: UpdateQuery<D> | Partial<D>,
  ): Promise<number> {
    let toUpdate = await this.collection.find(filter).toArray();
    if (toUpdate.length == 0) {
      return 0;
    }

    await this.collection.updateMany(filter, update);
    for (let item of toUpdate) {
      await this.deleteFromCacheById(item._id);
    }

    return toUpdate.length;
  }

  public async updateOne(
    id: ObjectId,
    update: UpdateQuery<Omit<D, "_id">> | Partial<Omit<D, "_id">>,
  ): Promise<T | null> {
    await this.collection.updateOne({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: id,
    }, update);
    await this.deleteFromCacheById(id);

    return this.get(id);
  }

  public async insert(fields: Omit<D, "_id">): Promise<T> {
    let { insertedId } = await this.collection.insertOne(fields);
    let doc = {
      ...fields,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: insertedId,
    } as D;

    return this.build(doc);
  }

  public async delete(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: id,
    });
    await this.deleteFromCacheById(id);
  }
}

export class UserDataSource extends BaseDataSource<User> {
  public constructor(client: MongoClient) {
    super(client.db().collection("users"), User);
  }

  public async verifyUser(email: string, password: string): Promise<User | null> {
    let user = await this.collection.findOne({
      email,
    });

    if (!user) {
      return null;
    }

    if (await bcryptCompare(password, user.password)) {
      return this.build(user);
    }

    return null;
  }

  public async create(email: string, password: string): Promise<User> {
    password = await bcryptHash(password, 12);

    return this.insert({
      email,
      password,
    });
  }
}

export class ContextDataSource extends BaseDataSource<Context> {
  public constructor(client: MongoClient) {
    super(client.db().collection("contexts"), Context);
  }

  public async create(
    user: ObjectId,
    params: Omit<ContextDbObject, "_id" | "user">,
  ): Promise<Context> {
    let context = await this.insert({
      ...params,
      user,
    });

    await this.context.dataSources.users.updateOne(user, {
      $addToSet: { contexts: context.dbId },
    });

    return context;
  }
}

export class ProjectDataSource extends BaseDataSource<Project> {
  public constructor(client: MongoClient) {
    super(client.db().collection("projects"), Project);
  }

  public async create(
    userId: ObjectId,
    params: Omit<ProjectDbObject, "_id" | "user">,
  ): Promise<Project> {
    let context: Context | null = null;
    if (params.context) {
      context = await this.context.dataSources.contexts.get(params.context);
      if (!context) {
        throw new Error("Context is unknown.");
      }

      let contextUser = await context.user();
      if (contextUser.dbId != userId) {
        throw new Error("Context is unknown.");
      }
    }

    let parent: Project | null = null;
    let parentContext: Context | null = null;
    if (params.parent) {
      parent = await this.context.dataSources.projects.get(params.parent);
      if (!parent) {
        throw new Error("Parent is unknown.");
      }

      let parentUser = await parent.user();
      if (parentUser.dbId != userId) {
        throw new Error("Parent is unknown.");
      }

      parentContext = await parent.context();

      if (!equals(context, parentContext)) {
        throw new Error("Parent is in a different context.");
      }
    }

    let project = await this.insert({
      ...params,
      user: userId,
    });

    return project;
  }
}

export interface DataSources {
  users: UserDataSource;
  contexts: ContextDataSource;
  projects: ProjectDataSource;
}

export function dataSources(client: MongoClient): DataSources {
  return {
    users: new UserDataSource(client),
    contexts: new ContextDataSource(client),
    projects: new ProjectDataSource(client),
  };
}
