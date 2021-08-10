import { URL } from "url";

import type { Knex } from "knex";

import type {
  DbMigration,
  DbMigrationHelper,
  Problem,
  Server,
  Service,
  ServiceDbMigration,
  ServiceExport,
  ServiceTransaction,
  Transaction,
} from "#server/utils";
import { DbMigrationSource } from "#server/utils";
import { assert, memoized } from "#utils";

import type { ServerConfig } from "./config";
import TaskManager from "./tasks";
import { buildServiceTransaction, withTransaction } from "./transaction";

function wrapKnex(knex: Knex, dbSchema: string): Knex {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.create(knex, {
    schema: {
      enumerable: true,
      configurable: false,
      get(): Knex.SchemaBuilder {
        return knex.schema.withSchema(dbSchema);
      },
    },
  });
}

class MigrationHelper implements DbMigrationHelper {
  public constructor(private readonly schema: string) {}

  public idColumn(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table.text(column);
  }

  public userRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table
      .text(column)
      .references("id")
      .inTable("public.User")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public itemRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table
      .text(column)
      .references("id")
      .inTable("public.ServiceDetail")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public listRef(
    table: Knex.CreateTableBuilder,
    column: string,
  ): Knex.ColumnBuilder {
    return table
      .text(column)
      .references("id")
      .inTable("public.ServiceList")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  }

  public tableName(name: string): string {
    return `${this.schema}.${name}`;
  }
}

class ServiceMigration implements DbMigration {
  public constructor(
    private readonly schema: string,
    private readonly migration: ServiceDbMigration,
  ) {}

  public get name(): string {
    return this.migration.name;
  }

  public up(knex: Knex): Promise<void> {
    return this.migration.up(
      wrapKnex(knex, this.schema),
      new MigrationHelper(this.schema),
    );
  }

  public async down(): Promise<void> {
    // NO-OP
  }
}

class SchemaMigration implements DbMigration {
  public readonly name = "Schema";

  public constructor(private readonly schema: string) {}

  public async up(knex: Knex): Promise<void> {
    await knex.raw("CREATE SCHEMA ??", [this.schema]);
  }

  public async down(knex: Knex): Promise<void> {
    await knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", [this.schema]);
  }
}

export function getMigrationSource(
  serviceExport: ServiceExport<unknown, any>,
): Knex.MigratorConfig {
  return {
    tableName: `${serviceExport.id}_migrations`,
    migrationSource: new DbMigrationSource([
      new SchemaMigration(serviceExport.id),
      ...serviceExport.dbMigrations.map(
        (migration: ServiceDbMigration): DbMigration =>
          new ServiceMigration(serviceExport.id, migration),
      ),
    ]),
  };
}

export class ServiceOwner<
  C = unknown,
  Tx extends ServiceTransaction = ServiceTransaction,
> implements Server<Tx>
{
  private servicePromise: Promise<Service<Tx>> | null;
  public readonly taskManager = TaskManager;

  private static ownerCache: Map<Service<any>, ServiceOwner<any, any>> =
    new Map();
  private static resolverMap: WeakMap<Record<string, unknown>, ServiceOwner> =
    new WeakMap();

  public static getOwner(service: Service<any>): ServiceOwner<any, any> {
    let owner = ServiceOwner.ownerCache.get(service);
    if (!owner) {
      throw new Error("Unknown service.");
    }
    return owner;
  }

  public static getServiceOwnerForResolver(
    resolver: Record<string, unknown>,
  ): ServiceOwner | undefined {
    return ServiceOwner.resolverMap.get(resolver);
  }

  public constructor(
    private readonly knex: Knex,
    private readonly serverConfig: ServerConfig,
    public readonly serviceExport: ServiceExport<C, Tx>,
  ) {
    this.servicePromise = null;
  }

  public get rootUrl(): URL {
    return this.serverConfig.rootUrl;
  }

  public get serviceUrl(): URL {
    return new URL(`service/${this.id}/`, this.rootUrl);
  }

  public async initService(): Promise<Service<Tx>> {
    let config: C = undefined as unknown as C;
    if (this.serviceExport.configDecoder) {
      try {
        config = await this.serviceExport.configDecoder.decodeToPromise(
          this.serverConfig.services[this.id],
        );
      } catch (e) {
        console.error(`Service ${this.id} configuration is invalid`);
        throw e;
      }
    }

    let service = await this.serviceExport.init(this, config);
    return service;
  }

  public get service(): Promise<Service<Tx>> {
    if (!this.servicePromise) {
      this.servicePromise = this.initService();
    }

    return this.servicePromise;
  }

  public async withTransaction<R>(task: (tx: Tx) => Promise<R>): Promise<R> {
    let service = await this.service;
    return withTransaction(this.knex, async (tx: Transaction): Promise<R> => {
      return task(await buildServiceTransaction(service, tx));
    });
  }

  public readonly resolvers = memoized(async function resolvers(
    this: ServiceOwner,
  ): Promise<Record<string, unknown>> {
    let service = await this.service;
    let resolvers = service.resolvers;
    ServiceOwner.resolverMap.set(resolvers, this);
    return resolvers;
  });

  public get id(): string {
    return this.serviceExport.id;
  }

  public async init(): Promise<Service<Tx>> {
    let service = await this.service;
    ServiceOwner.ownerCache.set(service, this);
    return service;
  }
}

class ServiceManagerImpl {
  private readonly serviceExports: Map<string, ServiceExport<unknown, any>> =
    new Map();
  private readonly serviceOwners = new Map<
    ServiceExport<unknown, any>,
    ServiceOwner<unknown, any>
  >();
  private readonly serviceCache = new Map<string, Service>();

  public addService(serviceExport: ServiceExport<any, any>): void {
    this.serviceExports.set(serviceExport.id, serviceExport);
  }

  public async initServices(
    knex: Knex,
    serverConfig: ServerConfig,
  ): Promise<void> {
    for (let serviceExport of this.serviceExports.values()) {
      let owner = new ServiceOwner(knex, serverConfig, serviceExport);
      this.serviceOwners.set(serviceExport, owner);
      await knex.migrate.latest(getMigrationSource(serviceExport));

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
        let serviceTransaction = await buildServiceTransaction(service, tx);
        problems = problems.concat(
          await service.listProblems(serviceTransaction, userId),
        );
      }
    }

    return problems;
  }

  public getServiceResolvers(): Promise<Record<string, unknown>[]> {
    return Promise.all(
      Array.from(
        this.serviceOwners.values(),
        (owner: ServiceOwner): Promise<Record<string, unknown>> =>
          owner.resolvers(),
      ),
    );
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
        let serviceTransaction = await buildServiceTransaction(service, tx);
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
        } catch (e) {
          console.error(e);
        }
      }
    }

    return null;
  }

  public async rollbackDatabase(knex: Knex): Promise<void> {
    for (let serviceExport of this.serviceExports.values()) {
      await knex.raw("DROP SCHEMA IF EXISTS ?? CASCADE", [serviceExport.id]);
    }
  }
}

export const ServiceManager = new ServiceManagerImpl();
