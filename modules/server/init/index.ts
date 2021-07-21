import { install } from "source-map-support";

import {
  buildCoreTransaction,
  parseConfig,
  User,
  withTransaction,
  connect,
  migrate,
  rollback,
} from "#server/core";
import type { Transaction } from "#server/utils";

import { ServiceManager } from "../core/services";
import { createGqlServer } from "./gqlserver";
import { createWebServer } from "./webserver";

install();

async function init(): Promise<void> {
  if (process.argv.length < 3) {
    throw new Error("Must pass the path to a config file.");
  }

  let config = await parseConfig(process.argv[2]);
  let knex = connect(config.database);

  ServiceManager.addService((await import("#services/bugzilla/server")).default);
  ServiceManager.addService((await import("#services/github/server")).default);
  ServiceManager.addService((await import("#services/google/server")).default);
  ServiceManager.addService((await import("#services/jira/server")).default);
  ServiceManager.addService((await import("#services/phabricator/server")).default);

  if (process.argv.length >= 4 && process.argv[3] == "rebuild") {
    await rollback(knex);
  }

  await migrate(knex);

  await ServiceManager.initServices(knex, config);

  if (config.admin) {
    let admin = config.admin;
    await withTransaction(
      knex,
      async (transaction: Transaction): Promise<void> => {
        let tx = buildCoreTransaction(transaction);
        let existing = await tx.stores.users.first({
          email: admin.email,
        });

        if (!existing) {
          console.log(`Creating admin user ${admin.email}`);
          await User.create(tx, {
            ...admin,
            isAdmin: true,
          });
        }
      },
    );
  }

  let gqlServer = await createGqlServer();
  await createWebServer(config, knex, gqlServer);
}

init().catch((e: Error) => console.error(e));
