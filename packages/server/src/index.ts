import fs from "fs";
import path from "path";

import { ApolloServer } from "apollo-server-koa";
import type Koa from "koa";
import koa from "koa";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";
import { install } from "source-map-support";

import { parseConfig } from "./config";
import { connect, dataSources } from "./db";
import { loadSchema, resolvers } from "./schema";
import { buildContext } from "./schema/context";

install();

async function init(): Promise<void> {
  if (process.argv.length < 3) {
    throw new Error("Must pass the path to a config file.");
  }

  let config = await parseConfig(process.argv[2]);

  let clientRoot = path.normalize(path.join(__dirname, "..", "..", "client", "dist"));

  let client = await connect(config.database);

  let gqlServer = new ApolloServer({
    typeDefs: await loadSchema(),
    resolvers,
    context: buildContext,
    // @ts-ignore
    dataSources: () => dataSources(client),
  });

  let app = new koa();

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
}

init().catch((e: Error) => console.error(e));
