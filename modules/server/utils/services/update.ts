import type { URL } from "url";

import { insert, sql, upsert } from "../../../db";
import type { Key, RelativeDateTime } from "../../../utils";
import { map, objectKey } from "../../../utils";
import { TaskController } from "../types";
import type {
  CoreItemParams,
  CreateItemParams,
  ItemList,
  ServiceTransaction,
  UpdateItemParams,
} from "./types";

export interface RemoteList<RemoteType> {
  readonly id: string;
  userId(): Promise<string>;
  readonly name: string;
  url(): Promise<string | null>;
  readonly dueOffset?: RelativeDateTime | null;

  listItems(): Promise<RemoteType[]>;
}

type Stored<T> = T & { id: string };
function fromStored<T>(stored: Stored<T>): { id: string; entity: T } {
  let { id, ...entity } = stored;
  return {
    id,
    // @ts-ignore
    entity,
  };
}

export abstract class ItemUpdater<Entity, RemoteType> {
  public constructor(
    protected readonly tx: ServiceTransaction,
    protected readonly table: string,
    ...entityKeys: (keyof Entity)[]
  ) {
    this.entityKey = objectKey(...entityKeys);
  }

  protected async init(): Promise<void> {
    // no-op
  }

  protected abstract entityForRemote(remote: RemoteType): Promise<Entity>;
  protected abstract paramsForRemote(
    remote: RemoteType,
    entity: Entity,
  ): CoreItemParams;
  protected abstract updateEntities(entities: Entity[]): Promise<RemoteType[]>;
  protected abstract getLists(): Promise<RemoteList<RemoteType>[]>;
  protected abstract getRemoteForURL(
    userId: string,
    url: URL,
  ): Promise<RemoteType | null>;

  protected readonly entityKey: (entity: Partial<Entity>) => Key<Entity>;
  private readonly entityIds: Map<Key<Entity>, string> = new Map();
  private readonly newEntityParams: Map<Key<Entity>, CreateItemParams> =
    new Map();
  private readonly updateEntityParams: Map<Key<Entity>, UpdateItemParams> =
    new Map();
  private readonly entities: Map<Key<Entity>, Entity> = new Map();

  protected previousEntity(key: Key<Entity>): Entity | null {
    return this.entities.get(key) ?? null;
  }

  private async listExistingEntities(): Promise<void> {
    let storedEntities = await this.tx.db.query<Stored<Entity>>(
      sql`SELECT * FROM ${sql.ref(this.table)}`,
    );

    for (let stored of storedEntities) {
      let { id, entity } = fromStored(stored);
      let key = this.entityKey(entity);

      this.entityIds.set(key, id);
      this.entities.set(key, entity);
    }
  }

  private async storeEntities(): Promise<void> {
    // Existing entities to be updated.
    let entities = Array.from(
      this.updateEntityParams.keys(),
      (key: Key<Entity>): Stored<Entity> => ({
        ...this.entities.get(key)!,
        id: this.entityIds.get(key)!,
      }),
    );

    if (this.updateEntityParams.size) {
      await this.tx.updateItems([...this.updateEntityParams.values()]);
    }

    // New entities to be created.
    if (this.newEntityParams.size) {
      let keys = [...this.newEntityParams.keys()];
      let params = keys.map(
        (key: Key<Entity>): CreateItemParams => this.newEntityParams.get(key)!,
      );
      let ids = await this.tx.createItems(params);

      keys.forEach((key: Key<Entity>, index: number): void => {
        entities.push({
          ...this.entities.get(key)!,
          id: ids[index],
        });

        this.entityIds.set(key, ids[index]);
      });
    }

    // Store entities in database.
    if (entities.length) {
      await this.tx.db.update(upsert(this.table, entities, ["id"]));
    }
  }

  public async addList({
    userId,
    remotes,
    ...listParams
  }: Omit<ItemList, "items"> & {
    remotes: RemoteType[];
    userId: string;
  }): Promise<string> {
    await this.listExistingEntities();
    await this.init();

    let itemIds: string[] = [];

    for (let remote of remotes) {
      let entity = await this.entityForRemote(remote);
      let key = this.entityKey(entity);

      let id = this.entityIds.get(key);
      let params = this.paramsForRemote(remote, entity);

      if (!id) {
        this.newEntityParams.set(key, {
          ...params,
          userId,
          controller: TaskController.ServiceList,
        });
      } else {
        itemIds.push(id);
        this.updateEntityParams.set(key, {
          ...params,
          id,
        });
      }

      this.entities.set(key, entity);
    }

    await this.storeEntities();

    itemIds = itemIds.concat(
      Array.from(
        this.newEntityParams.keys(),
        (key: Key<Entity>): string => this.entityIds.get(key)!,
      ),
    );

    return this.tx.addList({
      ...listParams,
      items: itemIds,
    });
  }

  public async update(): Promise<void> {
    await this.listExistingEntities();
    await this.init();

    let wantedEntities = new Set(this.entities.keys());

    let addRemote = async (remote: RemoteType): Promise<Key<Entity>> => {
      let entity = await this.entityForRemote(remote);
      let key = this.entityKey(entity);
      wantedEntities.delete(key);
      this.entities.set(key, entity);

      let id = this.entityIds.get(key);
      if (id) {
        this.updateEntityParams.set(key, {
          ...this.paramsForRemote(remote, entity),
          id,
        });
      }

      return key;
    };

    let listMap = new Map<RemoteList<RemoteType>, Key<Entity>[]>();

    // Update from lists
    for (let list of await this.getLists()) {
      let listEntities: Key<Entity>[] = [];
      listMap.set(list, listEntities);
      let userId = await list.userId();

      for (let remote of await list.listItems()) {
        let key = await addRemote(remote);
        listEntities.push(key);

        if (!this.entityIds.has(key)) {
          this.newEntityParams.set(key, {
            ...this.paramsForRemote(remote, this.entities.get(key)!),
            userId,
            controller: TaskController.ServiceList,
          });
        }
      }
    }

    // Update any not-yet seen entities
    if (wantedEntities.size) {
      let entities = Array.from(
        wantedEntities,
        (key: Key<Entity>): Entity => this.entities.get(key)!,
      );

      let remotes = await this.updateEntities(entities);
      await map(remotes, addRemote);
    }

    // Delete any unseen entities
    if (wantedEntities.size) {
      let toDelete: string[] = [];
      for (let key of wantedEntities) {
        let id = this.entityIds.get(key);
        if (!id) {
          continue;
        }

        this.entityIds.delete(key);
        this.entities.delete(key);
        toDelete.push(id);
      }

      await this.tx.deleteItems(toDelete);
    }

    await this.storeEntities();

    // Update lists
    for (let [list, keys] of listMap) {
      await this.tx.updateList(list.id, {
        name: list.name,
        url: await list.url(),
        due: list.dueOffset,
        items: keys.map((key: Key<Entity>): string => this.entityIds.get(key)!),
      });
    }
  }

  public async createItemFromURL(
    userId: string,
    targetUrl: URL,
    isTask: boolean,
  ): Promise<string | null> {
    await this.listExistingEntities();
    await this.init();

    let remote = await this.getRemoteForURL(userId, targetUrl);
    if (!remote) {
      return null;
    }

    let entity = await this.entityForRemote(remote);
    let key = this.entityKey(entity);
    let id = this.entityIds.get(key);
    if (id) {
      return id;
    }

    let controller: TaskController | null = isTask
      ? TaskController.Manual
      : null;

    let params = this.paramsForRemote(remote, entity);
    // Only mark as a service task if the service reports task state and it is not yet done.
    if (params.done === null && isTask) {
      controller = TaskController.Service;
    }

    [id] = await this.tx.createItems([
      {
        ...params,
        userId,
        controller,
      },
    ]);

    let storedEntity = {
      ...entity,
      id,
    };

    await this.tx.db.update(insert(this.table, storedEntity));

    return id;
  }
}
