import { promises as fs } from "fs";
import path from "path";

import type { ApolloServer } from "apollo-server-koa";
import busboy from "async-busboy";
import type { Knex } from "knex";
import koa from "koa";
import type Koa from "koa";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";

import type { ServerConfig } from "#server/core";
import {
  buildServiceTransaction,
  ServiceManager,
  buildCoreTransaction,
  withTransaction,
} from "#server/core";
import type {
  Service,
  ServiceWebContext,
  ServiceWebContextExtras,
  Transaction,
} from "#server/utils";
import type { DescriptorsFor } from "#utils";
import { defer } from "#utils";

interface ExtraContext {
  readonly userId: string | null;
  login(userId: string): void;
  logout(): void;
  startTransaction(): Promise<Transaction>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

export type WebServerContext = ExtraContext & Koa.DefaultContext & Koa.ExtendableContext;

interface TransactionHolder {
  transaction: Promise<Transaction>;
  reject: (reason?: Error) => void;
  resolve: () => void;
  complete: Promise<void>;
}

export async function buildWebServerContext(
  config: ServerConfig,
  knex: Knex,
): Promise<DescriptorsFor<ExtraContext>> {
  let transactions = new WeakMap<WebServerContext, TransactionHolder>();

  return {
    userId: {
      enumerable: true,
      get(this: WebServerContext): string | null {
        return this.session?.userId as string | undefined ?? null;
      },
    },

    login: {
      enumerable: true,
      value: function login(this: WebServerContext, userId: string): void {
        if (!this.session) {
          throw new Error("Session is not initialized.");
        }

        this.session.userId = userId;
        this.session.save();
      },
    },

    logout: {
      enumerable: true,
      value: function logout(this: WebServerContext): void {
        if (!this.session) {
          return;
        }

        this.session.userId = null;
        this.session.save();
      },
    },

    startTransaction: {
      enumerable: true,
      value: async function startTransaction(
        this: WebServerContext,
      ): Promise<Transaction> {
        let holder = transactions.get(this);
        if (!holder) {
          let deferred = defer<void>();
          let deferredTransaction = defer<Transaction>();

          holder = {
            complete: Promise.resolve(),
            resolve: deferred.resolve,
            reject: deferred.reject,
            transaction: deferredTransaction.promise,
          };

          transactions.set(this, holder);

          holder.complete = withTransaction(knex, (tx: Transaction): Promise<void> => {
            deferredTransaction.resolve(tx);
            return deferred.promise;
          });
        }

        return holder.transaction;
      },
    },

    commitTransaction: {
      enumerable: true,
      value: async function commitTransaction(this: WebServerContext): Promise<void> {
        let holder = transactions.get(this);
        if (!holder) {
          return;
        }

        transactions.delete(this);

        holder.resolve();
        await holder.complete;
      },
    },

    rollbackTransaction: {
      enumerable: true,
      value: async function rollbackTransaction(this: WebServerContext): Promise<void> {
        let holder = transactions.get(this);
        if (!holder) {
          return;
        }

        transactions.delete(this);

        holder.reject();
        try {
          await holder.complete;
        } catch (e) {
          // expected.
        }
      },
    },
  };
}

export type WebServer = Koa<Koa.DefaultState, WebServerContext>;

async function transactionMiddleware(ctx: WebServerContext, next: Koa.Next): Promise<void> {
  try {
    await next();
    await ctx.commitTransaction();
  } catch (e) {
    await ctx.rollbackTransaction();
    throw e;
  }
}

async function authMiddleware(ctx: WebServerContext): Promise<unknown> {
  try {
    if (ctx.method == "POST") {
      if (ctx.path == "/login") {
        let { fields } = await busboy(ctx.req);

        if (fields.email && fields.password) {
          let tx = buildCoreTransaction(await ctx.startTransaction());
          let user = await tx.stores.users.first({ email: fields.email });
          if (user && await user.verifyUser(fields.password)) {
            ctx.login(user.id);
            ctx.status = 200;
            ctx.body = "ok";
            return;
          }
        }

        ctx.status = 401;
        ctx.body = "fail";
        return;
      } else if (ctx.path == "/logout") {
        ctx.logout();
        ctx.body = "ok";
        return;
      }
    }

    ctx.status = 404;
    ctx.body = "fail";
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = "fail";
  }
}

export async function createWebServer(
  config: ServerConfig,
  knex: Knex,
  gqlServer: ApolloServer,
): Promise<WebServer> {
  let webRoot = path.join(__dirname, "..", "..", "web");

  let htmlFile = path.join(webRoot, "index.html");
  let context = await buildWebServerContext(config, knex);

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

  app.use(transactionMiddleware);

  app.use(gqlServer.getMiddleware());

  app.use(koaMount("/api", authMiddleware));

  ServiceManager.services.forEach((service: Service) => {
    if (service.webMiddleware) {
      let id = ServiceManager.getServiceId(service);
      app.use(koaMount(
        `/service/${id}`,
        async (ctx: WebServerContext, next: Koa.Next): Promise<void> => {
          if (!ctx.userId) {
            throw new Error("Not authenticated.");
          }

          let transaction = await ctx.startTransaction();
          let serviceTransaction = await buildServiceTransaction(service, transaction);

          let serviceContextDescriptors: DescriptorsFor<ServiceWebContextExtras> = {
            userId: {
              enumerable: true,
              value: ctx.userId,
            },
            transaction: {
              enumerable: true,
              value: serviceTransaction,
            },
          };

          let sctx: Koa.ParameterizedContext<unknown, ServiceWebContext> = Object.create(
            ctx,
            serviceContextDescriptors,
          );

          return service.webMiddleware?.(sctx, next);
        },
      ));
    }
  });

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
