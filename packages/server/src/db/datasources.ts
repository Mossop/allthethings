import type { ModelOrCollection } from "apollo-datasource-mongodb";
import { MongoDataSource } from "apollo-datasource-mongodb";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { FilterQuery, MongoClient, ObjectId, UpdateQuery } from "mongodb";

import type { ResolverContext } from "../schema/context";
import type { CreateNamedContextParams, CreateProjectParams } from "../schema/types";
import type { DbObjectFor, ImplBuilder } from "./implementations";
import { NamedContext, User, Project } from "./implementations";

type Overwrite<A, B> = Omit<A, keyof B> & B;

export interface DbObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: ObjectId;
}

function stub(name: string): string {
  return name.toLocaleLowerCase().replaceAll(" ", "-");
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

export class NamedContextDataSource extends BaseDataSource<NamedContext> {
  public constructor(client: MongoClient) {
    super(client.db().collection("contexts"), NamedContext);
  }

  public async create(
    user: ObjectId,
    { name }: CreateNamedContextParams,
  ): Promise<NamedContext> {
    let context = await this.insert({
      name,
      user,
      stub: stub(name),
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
    { name, owner }: Overwrite<CreateProjectParams, { owner: ObjectId | null }>,
  ): Promise<Project> {
    let user: ObjectId = userId;
    let parent: ObjectId | null = null;
    let namedContext: ObjectId | null = null;

    if (owner) {
      let ownerObj = await this.context.getOwner(owner);
      if (ownerObj instanceof Project) {
        parent = ownerObj.dbId;
        let context = await ownerObj.context();
        if (context instanceof NamedContext) {
          namedContext = context.dbId;
          context = await context.user();
        }
        user = context.dbId;
      } else if (ownerObj instanceof NamedContext) {
        namedContext = ownerObj.dbId;
        user = (await ownerObj.user()).dbId;
      } else if (ownerObj instanceof User) {
        user = ownerObj.dbId;
      }
    }

    if (!userId.equals(user)) {
      throw new Error("Owner does not exist.");
    }

    return this.insert({
      name,
      user,
      namedContext,
      parent,
      stub: stub(name),
    });
  }
}

export interface DataSources {
  users: UserDataSource;
  namedContexts: NamedContextDataSource;
  projects: ProjectDataSource;
}

export function dataSources(client: MongoClient): DataSources {
  return {
    users: new UserDataSource(client),
    namedContexts: new NamedContextDataSource(client),
    projects: new ProjectDataSource(client),
  };
}
