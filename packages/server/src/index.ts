import { ApolloServer } from "apollo-server-koa";
import koa from "koa";
import koaRouter from "koa-router";
import { MongoClient } from "mongodb";

import { dataSources } from "./db";
import { loadSchema, resolvers } from "./schema";
import { buildContext } from "./schema/context";

async function init(): Promise<void> {
  let client = new MongoClient("mongodb://localhost:27017/test");
  await client.connect();

  let app = new koa();
  let router = new koaRouter();
  let port = 3000;

  let gqlServer = new ApolloServer({
    typeDefs: await loadSchema(),
    resolvers,
    context: buildContext,
    // @ts-ignore
    dataSources: () => dataSources(client),
  });

  app.use(gqlServer.getMiddleware());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(port);
}

init().catch((e: Error) => console.error(e));
