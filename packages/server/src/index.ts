import { install } from "source-map-support";

import { parseConfig } from "./config";
import { createDbConnection } from "./db";
import { createGqlServer } from "./schema";
import { createWebServer } from "./webserver";

install();

async function init(): Promise<void> {
  if (process.argv.length < 3) {
    throw new Error("Must pass the path to a config file.");
  }

  let config = await parseConfig(process.argv[2]);

  let db = await createDbConnection(config);
  if (process.argv.length >= 4 && process.argv[3] == "rebuild") {
    await db.rollback(true);
  }
  await db.migrate();

  let gqlServer = await createGqlServer(db);
  await createWebServer(config, db, gqlServer);
}

init().catch((e: Error) => console.error(e));
