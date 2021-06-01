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
  let htmlFile = require.resolve("@allthethings/client/dist/index.html");

  let clientRoot = path.dirname(htmlFile);
  let uiRoot = path.dirname(require.resolve("@allthethings/ui/dist/ui.js"));
  let context = await buildWebServerContext(config, db);

  let app: WebServer = new koa();
  Object.defineProperties(app.context, {
    ...context,
  });

  app.keys = ["allthethings"];

  app.use(koaMount(
    "/app",
    koaStatic(path.join(clientRoot, "app"), {
      maxAge: 1000 * 60 * 60 * 365,
      immutable: true,
    }),
  ));

  app.use(koaMount(
    "/ui",
    koaStatic(uiRoot, {
      maxAge: 1000 * 60 * 60 * 365,
      immutable: true,
    }),
  ));

  app.use(koaMount(
    "/static",
    koaStatic(path.join(clientRoot, "static"), {
      maxAge: 1000 * 60 * 60 * 365,
      immutable: true,
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

    html = html.replace(
      "{plugins}",
      (await PluginManager.getClientScripts(ctx)).map(
        (script: string): string => `<script defer src="${script}"></script>`,
      ).join("\n"),
    );

    ctx.status = 200;
    ctx.type = "text/html";
    ctx.body = html;
  });

  app.listen(config.port);

  return app;
}
