import { install } from "source-map-support";

import { parseConfig } from "./config";
import { AppDataSources, createDbConnection } from "./db";
import PluginManager from "./plugins";
import { createGqlServer } from "./schema";
import { createWebServer } from "./webserver";

install();

async function init(): Promise<void> {
  if (process.argv.length < 3) {
    throw new Error("Must pass the path to a config file.");
  }

  let config = await parseConfig(process.argv[2]);
  let db = await createDbConnection(config);
  await PluginManager.loadPlugins(db, config);

  if (process.argv.length >= 4 && process.argv[3] == "rebuild") {
    await db.rollback(true);
  }
  await db.migrate();

  if (config.admin) {
    let dataSources = new AppDataSources(db);
    let existing = await dataSources.users.find({
      email: config.admin.email,
    });

    if (existing.length == 0) {
      console.log(`Creating admin user ${config.admin.email}`);
      await dataSources.users.create({
        ...config.admin,
        isAdmin: true,
      });
    }
  }

  let gqlServer = await createGqlServer();
  await createWebServer(config, db, gqlServer);
  await PluginManager.startPlugins();
}

init().catch((e: Error) => console.error(e));
