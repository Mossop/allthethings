import { install } from "source-map-support";

import {
  buildCoreTransaction,
  parseConfig,
  User,
  withTransaction,
  connect,
  migrate,
  rollback,
  TaskInfo,
} from "#server/core";
import type { Transaction, Segment } from "#server/utils";
import { inSegment } from "#server/utils";

import { ServiceManager } from "../core/services";
import { createGqlServer } from "./gqlserver";
import { createWebServer } from "./webserver";

install();

async function init(): Promise<void> {
  return inSegment("init", async (segment: Segment) => {
    if (process.argv.length < 3) {
      throw new Error("Must pass the path to a config file.");
    }

    let config = await parseConfig(process.argv[2]);
    let knex = connect(config.database);

    ServiceManager.addService(
      (await import("#services/bugzilla/server")).default,
    );
    ServiceManager.addService(
      (await import("#services/github/server")).default,
    );
    ServiceManager.addService(
      (await import("#services/google/server")).default,
    );
    ServiceManager.addService((await import("#services/jira/server")).default);
    ServiceManager.addService(
      (await import("#services/phabricator/server")).default,
    );

    if (process.argv.length >= 4 && process.argv[3] == "rebuild") {
      await rollback(knex);
    }

    await migrate(knex);

    await ServiceManager.initServices(knex, config);

    await withTransaction(
      knex,
      segment,
      async (transaction: Transaction): Promise<void> => {
        let tx = buildCoreTransaction(transaction);
        if (config.admin) {
          let existing = await tx.stores.users.first({
            email: config.admin.email,
          });

          if (!existing) {
            segment.info(`Creating admin user ${config.admin.email}`);
            await User.create(tx, {
              ...config.admin,
              isAdmin: true,
            });
          }
        }

        await TaskInfo.updateTaskDetails(tx);
      },
    );

    let gqlServer = await createGqlServer();
    await createWebServer(config, knex, gqlServer);
    segment.info("Startup complete");
  });
}

// eslint-disable-next-line no-console
init().catch((e: Error) => console.error(e));
