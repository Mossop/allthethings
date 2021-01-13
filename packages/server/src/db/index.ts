import { MongoDataSource } from "apollo-datasource-mongodb";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Cursor, FilterQuery } from "mongodb";
import { ObjectId, MongoClient } from "mongodb";

import type { ContextDbObject, ProjectDbObject, UserDbObject } from "./types";

export interface DbObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: ObjectId;
}

class BaseDataSource<T extends DbObject> extends MongoDataSource<T> {
  public async get(id: string | ObjectId): Promise<T | null> {
    let doc = await this.findOneById(id);
    return doc ?? null;
  }

  protected find(query?: FilterQuery<T>): Cursor<T> {
    return this.collection.find<T>(query);
  }

  protected list(query?: FilterQuery<T>): Promise<T[]> {
    return this.find(query).toArray();
  }

  protected async updateOne(id: ObjectId, update: Partial<Omit<T, "_id">>): Promise<T | null> {
    await this.collection.updateOne({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: id,
    }, update);

    return this.get(id);
  }

  protected async insertOne(doc: Omit<T, "_id">): Promise<T> {
    let { insertedId } = await this.collection.insertOne(doc);
    // @ts-ignore
    return {
      ...doc,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: insertedId,
    };
  }
}

export class UserDataSource extends BaseDataSource<UserDbObject> {
  public async verifyUser(email: string, password: string): Promise<UserDbObject | null> {
    let user = await this.collection.findOne({
      email,
    });

    if (!user) {
      return null;
    }

    if (await bcryptCompare(password, user.password)) {
      return user;
    }

    return null;
  }

  public async createUser(email: string, password: string): Promise<UserDbObject> {
    return this.insertOne({
      email,
      password: await bcryptHash(password, 12),
    });
  }
}

export class ContextDataSource extends BaseDataSource<ContextDbObject> {
  public async getEmptyContext(userId: ObjectId): Promise<ContextDbObject> {
    let contexts = await this.list({
      user: userId,
      name: null,
    });

    if (contexts.length > 0) {
      return contexts[0];
    }

    return this.insertOne({
      user: userId,
      name: null,
    });
  }

  public async getContextId(userId: ObjectId, id: string | null | undefined): Promise<ObjectId> {
    if (id) {
      return new ObjectId(id);
    }

    let context = await this.getEmptyContext(userId);
    return context._id;
  }

  public async create(user: ObjectId, name: string): Promise<ContextDbObject> {
    let context = await this.collection.findOne({
      user,
      name,
    });

    if (context) {
      return context;
    }

    return this.insertOne({
      user,
      name,
    });
  }

  public listNamed(user: ObjectId): Promise<ContextDbObject[]> {
    return this.list({
      user,
      name: {
        $ne: null,
      },
    });
  }
}

export class ProjectDataSource extends BaseDataSource<ProjectDbObject> {
  public async create(
    context: ObjectId,
    parent: ObjectId | null,
    name: string,
  ): Promise<ProjectDbObject> {
    return this.insertOne({
      context,
      parent,
      name,
    });
  }

  public async setParent(
    project: ObjectId,
    parent: ObjectId | null,
  ): Promise<ProjectDbObject | null> {
    return this.updateOne(project, {
      parent,
    });
  }

  public async setContext(
    project: ObjectId,
    context: ObjectId,
  ): Promise<ProjectDbObject | null> {
    return this.updateOne(project, {
      context,
    });
  }

  public async listContextRoots(context: ObjectId): Promise<ProjectDbObject[]> {
    return this.list({
      context,
      parent: null,
    });
  }

  public async listChildren(parent: ObjectId): Promise<ProjectDbObject[]> {
    return this.list({
      parent,
    });
  }
}

export interface DataSources {
  users: UserDataSource;
  contexts: ContextDataSource;
  projects: ProjectDataSource;
}

export function dataSources(client: MongoClient): DataSources {
  return {
    users: new UserDataSource(client.db().collection("users")),
    contexts: new ContextDataSource(client.db().collection("contexts")),
    projects: new ProjectDataSource(client.db().collection("projects")),
  };
}

async function getSchemaVersion(client: MongoClient): Promise<number> {
  let doc = await client.db().collection("schema").findOne({
    key: "version",
  });

  if (doc) {
    let value = parseInt(doc.value);
    return Number.isNaN(value) ? 0 : value;
  }

  return 0;
}

async function setSchemaVersion(client: MongoClient, version: number): Promise<void> {
  await client.db().collection("schema").findOneAndReplace({
    key: "version",
  }, {
    key: "version",
    value: version,
  }, {
    upsert: true,
  });
}

export async function connect(): Promise<MongoClient> {
  let client = await MongoClient.connect("mongodb://localhost:27017/allthethings", {
    useUnifiedTopology: true,
  });

  let schemaVersion = await getSchemaVersion(client);
  if (schemaVersion < 1) {
    await client.db().collection("users").createIndex({ email: 1 }, { unique: true });
    await client.db().collection("contexts").createIndex({ user: 1, name: 1 }, { unique: true });
    await setSchemaVersion(client, 1);
  }

  return client;
}
