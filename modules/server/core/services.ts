import { URL } from "url";

import type { Database } from "../../db";
import { assert } from "../../utils";
import type {
  Problem,
  Segment,
  Server,
  Service,
  ServiceExport,
  ServiceTransaction,
  Transaction,
} from "../utils";
import { inSegment } from "../utils";
import type { ServerConfig } from "./config";
import TaskManager from "./tasks";
import { buildServiceTransaction, withTransaction } from "./transaction";

export class ServiceOwner<C = any> implements Server {
  private servicePromise: Promise<Service> | null;
  public readonly taskManager = TaskManager;

  private static ownerCache: Map<Service, ServiceOwner> = new Map();

  public static getOwner(service: Service): ServiceOwner {
    let owner = ServiceOwner.ownerCache.get(service);
    if (!owner) {
      throw new Error("Unknown service.");
    }
    return owner;
  }

  public constructor(
    private readonly db: Database,
    private readonly serverConfig: ServerConfig,
    public readonly serviceExport: ServiceExport<C>,
  ) {
    this.servicePromise = null;
  }

  public get rootUrl(): URL {
    return this.serverConfig.rootUrl;
  }

  public get serviceUrl(): URL {
    return new URL(`service/${this.id}/`, this.rootUrl);
  }

  public initService(): Promise<Service> {
    return inSegment(
      "initService",
      { service: this.serviceExport.id },
      async (segment: Segment) => {
        let config: C = undefined as unknown as C;
        if (this.serviceExport.configDecoder) {
          try {
            config = await this.serviceExport.configDecoder.decodeToPromise(
              this.serverConfig.services[this.id],
            );
          } catch (error) {
            segment.error(`Service configuration is invalid`, { error });
            throw error;
          }
        }

        let service = await this.serviceExport.init(this, config);
        return service;
      },
    );
  }

  public get service(): Promise<Service> {
    if (!this.servicePromise) {
      this.servicePromise = this.initService();
    }

    return this.servicePromise;
  }

  public async withTransaction<R>(
    operation: string,
    task: (tx: ServiceTransaction) => Promise<R>,
  ): Promise<R> {
    let service = await this.service;

    return inSegment(
      "Service Operation",
      {
        service: this.serviceExport.id,
        operation,
      },
      async (segment: Segment): Promise<R> => {
        try {
          let result = await withTransaction(
            this.db,
            segment,
            "DB transaction",
            async (tx: Transaction): Promise<R> => {
              return task(buildServiceTransaction(service, tx));
            },
          );

          segment.debug("Completed service transaction");

          return result;
        } catch (error) {
          segment.error("Service threw exception", { error });
          throw error;
        }
      },
    );
  }

  public get id(): string {
    return this.serviceExport.id;
  }

  public async init(): Promise<Service> {
    let service = await this.service;
    ServiceOwner.ownerCache.set(service, this);
    return service;
  }
}

class ServiceManagerImpl {
  private readonly serviceExports: Map<string, ServiceExport<unknown>> =
    new Map();
  private readonly serviceOwners = new Map<
    ServiceExport<unknown>,
    ServiceOwner
  >();
  private readonly serviceCache = new Map<string, Service>();

  public addService(serviceExport: ServiceExport): void {
    this.serviceExports.set(serviceExport.id, serviceExport);
  }

  public async initServices(
    db: Database,
    serverConfig: ServerConfig,
  ): Promise<void> {
    for (let serviceExport of this.serviceExports.values()) {
      let owner = new ServiceOwner(db, serverConfig, serviceExport);
      this.serviceOwners.set(serviceExport, owner);
      this.serviceCache.set(serviceExport.id, await owner.init());
    }
  }

  public async listProblems(
    tx: Transaction,
    userId: string | null,
  ): Promise<Problem[]> {
    let problems: Problem[] = [];

    for (let service of this.services) {
      if (service.listProblems) {
        let serviceTransaction = buildServiceTransaction(service, tx);
        problems = problems.concat(
          await service.listProblems(serviceTransaction, userId),
        );
      }
    }

    return problems;
  }

  public getServiceId(service: Service): string {
    let owner = ServiceOwner.getOwner(service);
    return owner.id;
  }

  public getService(id: string): Service {
    return assert(this.serviceCache.get(id));
  }

  public get services(): Service[] {
    return [...this.serviceCache.values()];
  }

  public async createItemFromURL(
    tx: Transaction,
    userId: string,
    url: URL,
    isTask: boolean,
  ): Promise<string | null> {
    for (let service of this.services) {
      if (service.createItemFromURL) {
        let serviceTransaction = buildServiceTransaction(service, tx);
        try {
          let id = await service.createItemFromURL(
            serviceTransaction,
            userId,
            url,
            isTask,
          );
          if (id) {
            return id;
          }
        } catch (error) {
          tx.segment.error("Service reported error creating item", { error });
        }
      }
    }

    return null;
  }
}

export const ServiceManager = new ServiceManagerImpl();
