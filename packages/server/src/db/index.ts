import { MongoDataSource } from "apollo-datasource-mongodb";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";
import type { Cursor, FilterQuery, MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

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

  public find(query?: FilterQuery<T>): Cursor<T> {
    return this.collection.find<T>(query);
  }

  public list(query?: FilterQuery<T>): Promise<T[]> {
    return this.find(query).toArray();
  }

  public async updateOne(id: ObjectId, update: Partial<Omit<T, "_id">>): Promise<T | null> {
    await this.collection.updateOne({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: id,
    }, update);

    return this.get(id);
  }

  public async insertOne(doc: Omit<T, "_id">): Promise<T> {
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
    let users = await this.list({
      email,
    });

    if (users.length != 1) {
      return null;
    }

    if (await bcryptCompare(password, users[0].password)) {
      return users[0];
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
}

export class ProjectDataSource extends BaseDataSource<ProjectDbObject> {
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
