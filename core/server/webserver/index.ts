import { promises as fs } from "fs";
import path from "path";

import type { ApolloServer } from "apollo-server-koa";
import koa from "koa";
import type Koa from "koa";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";

import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";
import PluginManager from "../plugins";
import type { WebServerContext } from "./context";
import { buildWebServerContext } from "./context";

export type WebServer = Koa<Koa.DefaultState, WebServerContext>;

export async function createWebServer(
  config: ServerConfig,
  db: DatabaseConnection,
  gqlServer: ApolloServer,
): Promise<WebServer> {
  let webRoot = path.join(__dirname, "..", "..", "..", "web");

  let htmlFile = path.join(webRoot, "index.html");
  let context = await buildWebServerContext(config, db);

  let app: WebServer = new koa();
  Object.defineProperties(app.context, {
    ...context,
  });

  app.keys = ["allthethings"];

  app.use(koaMount(
    "/app",
    koaStatic(path.join(webRoot, "app"), {
      maxAge: 1000 * 60 * 60 * 365,
      immutable: true,
    }),
  ));

  app.use(koaMount(
    "/static",
    koaStatic(path.join(webRoot, "static"), {
      maxAge: 1000 * 60 * 60 * 365,
    }),
  ));

  app.use(koaSession({
    renew: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }, app as unknown as Koa));

  app.use(gqlServer.getMiddleware());

  await PluginManager.registerServerMiddleware(app);

  app.use(async (ctx: Koa.Context) => {
    let html = await fs.readFile(htmlFile, {
      encoding: "utf8",
    });

    ctx.status = 200;
    ctx.type = "text/html";
    ctx.body = html;
  });

  app.listen(config.port);

  return app;
}
