import fs from "fs";
import path from "path";

import { ApolloServer } from "apollo-server-koa";
import type Koa from "koa";
import koa from "koa";
import koaMount from "koa-mount";
import koaRouter from "koa-router";
import koaSession from "koa-session";
import koaStatic from "koa-static";
import { MongoClient } from "mongodb";

import { dataSources } from "./db";
import { loadSchema, resolvers } from "./schema";
import { buildContext } from "./schema/context";

async function init(): Promise<void> {
  let clientRoot = path.normalize(path.join(__dirname, "..", "..", "client", "dist"));

  let client = new MongoClient("mongodb://localhost:27017/test");
  await client.connect();

  let router = new koaRouter();

  router.get("/", (ctx: Koa.Context) => {
    let stream = fs.createReadStream(path.join(clientRoot, "index.html"));
    ctx.status = 200;
    ctx.type = "text/html";
    ctx.body = stream;
  });

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

  app.use(koaSession({
    renew: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }, app));

  app.use(router.routes());

  app.use(gqlServer.getMiddleware());
  app.listen(3000);
}

init().catch((e: Error) => console.error(e));
