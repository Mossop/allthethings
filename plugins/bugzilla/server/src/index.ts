import path from "path";

import type { ServerPlugin } from "@allthethings/types";
import type Koa from "koa";
import koaStatic from "koa-static";

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
}

export default new BuzillaPlugin();
