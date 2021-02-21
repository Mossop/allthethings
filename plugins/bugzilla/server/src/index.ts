import path from "path";

import type { DbMigrationHelper, ServerPlugin } from "@allthethings/types";
import type Koa from "koa";
import koaStatic from "koa-static";

import DbMigrationSource from "./db/migrations";

class BuzillaPlugin implements ServerPlugin {
  public readonly id = "bugzilla";
  public readonly serverMiddleware: Koa.Middleware;

  private readonly clientPath: string;

  public constructor() {
    this.clientPath = path.dirname(require.resolve("@allthethings/bugzilla-client/dist/app.js"));
    this.serverMiddleware = koaStatic(this.clientPath, {
      maxAge: 1000 * 10,
    });
  }

  public getClientScripts(): string[] {
    return [`/${this.id}/app.js`];
  }

  public getDbMigrations(helper: DbMigrationHelper): DbMigrationSource {
    return new DbMigrationSource(helper);
  }
}

export default new BuzillaPlugin();
