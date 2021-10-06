import { install } from "source-map-support";

import type { Database } from "../../db";
import { connect, migrate, rollback } from "../../db";
import { parseConfig, User, withTransaction, TaskInfo } from "../core";
import { ServiceManager } from "../core/services";
import type { Transaction, Segment } from "../utils";
import { inSegment } from "../utils";
import { createApiServer } from "./apiserver";
import { Migration0001KnexPrep } from "./migrations/0001-KnexPrep";
import { Migration0002Core } from "./migrations/0002-Core";
import { Migration0003Bugzilla } from "./migrations/0003-Bugzilla";
import { Migration0004Github } from "./migrations/0004-Github";
import { Migration0005Google } from "./migrations/0005-Google";
import { Migration0006Jira } from "./migrations/0006-Jira";
import { Migration0007Phabricator } from "./migrations/0007-Phabricator";
import { Migration0008Knex } from "./migrations/0008-Knex";

install();

async function init(): Promise<void> {
  return inSegment("Server Init", async (segment: Segment) => {
    if (process.argv.length < 3) {
      throw new Error("Must pass the path to a config file.");
    }

    let config = await parseConfig(process.argv[2]);

    let connection = await connect(config.database);
    try {
      ServiceManager.addService(
        (await import("../../services/bugzilla/server")).default,
      );
      ServiceManager.addService(
        (await import("../../services/github/server")).default,
      );
      ServiceManager.addService(
        (await import("../../services/google/server")).default,
      );
      ServiceManager.addService(
        (await import("../../services/jira/server")).default,
      );
      ServiceManager.addService(
        (await import("../../services/phabricator/server")).default,
      );

      await segment.inSegment("DB migrations", async () => {
        await connection.inTransaction(async (db: Database) => {
          let migrations = [
            new Migration0001KnexPrep(),
            new Migration0002Core(),
            new Migration0003Bugzilla(),
            new Migration0004Github(),
            new Migration0005Google(),
            new Migration0006Jira(),
            new Migration0007Phabricator(),
            new Migration0008Knex(),
          ];

          if (process.argv.length >= 4 && process.argv[3] == "rebuild") {
            await rollback(db, { migrations });
          }

          await migrate(db, { migrations });
        });
      });

      await withTransaction(
        connection,
        segment,
        "DB prep",
        async (tx: Transaction): Promise<void> => {
          if (config.admin) {
            let existing = await User.store(tx).findOne({
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

      await ServiceManager.initServices(connection, config);

      await createApiServer(config, connection);
      segment.info("Startup complete");
    } catch (e) {
      await connection.disconnect();
      throw e;
    }
  });
}

init().catch(() => {
  // Will have been logged on exit from the segment.
});
