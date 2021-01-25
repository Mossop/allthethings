import fs from "fs";
import path from "path";

import type { ApolloServer } from "apollo-server-koa";
import koa from "koa";
import type Koa from "koa";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";

import type { ServerConfig } from "../config";
import type { DatabaseConnection } from "../db/connection";
import type { AppContext } from "./context";
import { buildContext } from "./context";

export async function createWebServer(
  config: ServerConfig,
  db: DatabaseConnection,
  gqlServer: ApolloServer,
): Promise<Koa> {
  let clientRoot = path.normalize(path.join(__dirname, "..", "..", "..", "client", "dist"));
  let context = await buildContext(config, db);

  let app = new koa();
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
    "/static",
    koaStatic(path.join(clientRoot, "static"), {
      maxAge: 1000 * 60 * 60 * 365,
      immutable: true,
    }),
  ));

  app.use((ctx: Koa.Context & AppContext, next: Koa.Next) => {
    return ctx.inTransaction(next);
  });

  app.use(koaSession({
    renew: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }, app));

  app.use(gqlServer.getMiddleware());

  app.use((ctx: Koa.Context) => {
    let stream = fs.createReadStream(path.join(clientRoot, "index.html"));
    ctx.status = 200;
    ctx.type = "text/html";
    ctx.body = stream;
  });

  app.listen(config.port);

  return app;
}
