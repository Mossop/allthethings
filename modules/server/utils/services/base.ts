import type { URL } from "url";

import type { RelativeDateTime } from "../../../utils";
import { IdentifiedEntityImpl } from "../store";
import type { IdentifiedEntity } from "../store";
import type { Server, Service, ServiceTransaction } from "./types";
import type { ItemUpdater, RemoteList } from "./update";

const INITIAL_DELAY = 1000;
const UPDATE_DELAY = 60000;

type ItemUpdaterConstructor = new (tx: ServiceTransaction) => ItemUpdater<
  any,
  any
>;

export abstract class BaseService implements Service {
  protected abstract readonly itemUpdaters: ItemUpdaterConstructor[];

  public constructor(private readonly server: Server) {
    server.taskManager.queueRecurringTask(async (): Promise<number> => {
      await this.server.withTransaction("Update", (tx: ServiceTransaction) =>
        this.update(tx),
      );

      return UPDATE_DELAY;
    }, INITIAL_DELAY);
  }

  protected async update(tx: ServiceTransaction): Promise<void> {
    for (let updaterConstructors of this.itemUpdaters) {
      let updater = new updaterConstructors(tx);
      await updater.update();
    }
  }

  public async createItemFromURL(
    tx: ServiceTransaction,
    userId: string,
    targetUrl: URL,
    isTask: boolean,
  ): Promise<string | null> {
    for (let updaterConstructors of this.itemUpdaters) {
      let updater = new updaterConstructors(tx);
      let itemId = await updater.createItemFromURL(userId, targetUrl, isTask);

      if (itemId) {
        return itemId;
      }
    }

    return null;
  }
}

export abstract class BaseAccount<
  Entity extends IdentifiedEntity,
> extends IdentifiedEntityImpl<Entity, ServiceTransaction> {
  protected abstract lists(): Promise<BaseList<any, any>[]>;
  protected abstract items(): Promise<string[]>;

  public override async delete(): Promise<void> {
    for (let list of await this.lists()) {
      await list.delete();
    }

    await this.tx.deleteItems(await this.items());

    await super.delete();
  }
}

export abstract class BaseList<Entity extends IdentifiedEntity, RemoteType>
  extends IdentifiedEntityImpl<Entity, ServiceTransaction>
  implements RemoteList<RemoteType>
{
  public abstract listItems(): Promise<RemoteType[]>;

  public abstract userId(): Promise<string>;

  public abstract get name(): string;

  public get dueOffset(): RelativeDateTime | null | undefined {
    return undefined;
  }

  public async url(): Promise<string | null> {
    return null;
  }

  public override async delete(): Promise<void> {
    await this.tx.deleteList(this.id);
  }
}
