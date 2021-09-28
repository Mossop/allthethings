import { promises as fs } from "fs";
import path from "path";

import Router from "@koa/router";
import koa from "koa";
import type Koa from "koa";
import koaBody from "koa-body";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";

import type { Database } from "#db";
import type { ServerConfig } from "#server/core";
import { addCoreRoutes, ServiceManager, withTransaction } from "#server/core";
import type { Service, Transaction, WebContext, Segment } from "#server/utils";
import { RootSegment, log } from "#server/utils";
import type { DescriptorsFor } from "#utils";
import { defer } from "#utils";

interface TransactionHolder {
  writable: boolean;
  transaction: Promise<Transaction>;
  reject: (reason?: Error) => void;
  resolve: () => void;
  complete: Promise<void>;
}

type ExtraContext = WebContext & {
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
};

type WebServerContext = ExtraContext &
  Koa.DefaultContext &
  Koa.ExtendableContext;

export async function buildWebServerContext(
  db: Database,
): Promise<DescriptorsFor<ExtraContext>> {
  let transactions = new WeakMap<WebServerContext, TransactionHolder>();
  let segments = new WeakMap<WebServerContext, Segment>();

  return {
    segment: {
      enumerable: true,
      get(this: WebServerContext): Segment {
        let segment = segments.get(this);
        if (!segment) {
          segment = new RootSegment(log, "Web Request", {
            path: this.path,
          });
          segments.set(this, segment);
        }

        return segment.current;
      },
    },

    startTransaction: {
      enumerable: true,
      value: async function startTransaction(
        this: WebServerContext,
        writable: boolean = true,
      ): Promise<Transaction> {
        let holder = transactions.get(this);
        if (!holder) {
          let deferred = defer<void>();
          let deferredTransaction = defer<Transaction>();

          holder = {
            writable,
            complete: Promise.resolve(),
            resolve: deferred.resolve,
            reject: deferred.reject,
            transaction: deferredTransaction.promise,
          };

          transactions.set(this, holder);

          holder.complete = withTransaction(
            db,
            this.segment,
            this.path,
            (tx: Transaction): Promise<void> => {
              deferredTransaction.resolve(tx);
              return deferred.promise;
            },
          );
        } else if (writable && !holder.writable) {
          throw new Error(
            "Attempt to open a writable transaction within a read-only transaction.",
          );
        }

        return holder.transaction;
      },
    },

    commitTransaction: {
      enumerable: true,
      value: async function commitTransaction(
        this: WebServerContext,
      ): Promise<void> {
        let segment = segments.get(this);
        segments.delete(this);

        let holder = transactions.get(this);
        transactions.delete(this);

        if (!holder) {
          segment?.finish();
          return;
        }

        holder.resolve();
        await holder.complete;

        segment?.finish();
      },
    },

    rollbackTransaction: {
      enumerable: true,
      value: async function rollbackTransaction(
        this: WebServerContext,
      ): Promise<void> {
        let segment = segments.get(this);
        segments.delete(this);

        let holder = transactions.get(this);
        transactions.delete(this);

        if (!holder) {
          segment?.finish();
          return;
        }

        holder.reject();
        try {
          await holder.complete;
        } catch (e) {
          // expected.
        }

        segment?.finish();
      },
    },
  };
}

export type WebServer = Koa<Koa.DefaultState, WebServerContext>;

async function transactionMiddleware(
  ctx: WebServerContext,
  next: Koa.Next,
): Promise<void> {
  try {
    await next();
    ctx.segment.trace("Request complete");
    await ctx.commitTransaction();
  } catch (error) {
    ctx.segment.error("Error during request", { error });
    await ctx.rollbackTransaction();
    throw error;
  }
}

export async function createApiServer(
  config: ServerConfig,
  db: Database,
): Promise<WebServer> {
  let webRoot = path.join(__dirname, "..", "..", "web");

  let htmlFile = path.join(webRoot, "index.html");
  let context = await buildWebServerContext(db);

  let app: WebServer = new koa();
  Object.defineProperties(app.context, {
    ...context,
  });

  app.keys = ["allthethings"];

  app.use(
    koaMount(
      "/app",
      koaStatic(path.join(webRoot, "app"), {
        maxAge: 1000 * 60 * 60 * 365,
        immutable: true,
      }),
    ),
  );

  app.use(
    koaMount(
      "/static",
      koaStatic(path.join(webRoot, "static"), {
        maxAge: 1000 * 60 * 60 * 365,
      }),
    ),
  );

  app.use(
    koaSession(
      {
        renew: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
      app as unknown as Koa,
    ),
  );

  app.use(async (ctx: WebServerContext, next: Koa.Next): Promise<void> => {
    if (ctx.get("Origin")) {
      ctx.set("Access-Control-Allow-Origin", ctx.get("Origin"));
      ctx.set("Access-Control-Allow-Credentials", "true");
    }

    if (ctx.method == "OPTIONS") {
      ctx.status = 204;
      if (ctx.get("Access-Control-Request-Method")) {
        ctx.set(
          "Access-Control-Allow-Methods",
          ctx.get("Access-Control-Request-Method"),
        );
      }

      if (ctx.get("Access-Control-Request-Headers")) {
        ctx.set(
          "Access-Control-Allow-Headers",
          ctx.get("Access-Control-Request-Headers"),
        );
      }
    } else {
      await next();
    }
  });

  app.use(transactionMiddleware);

  app.use(koaBody());

  let router = new Router({
    prefix: "/api",
  });
  addCoreRoutes(router);

  app.use(router.routes()).use(router.allowedMethods());

  ServiceManager.services.forEach((service: Service) => {
    if (service.addWebRoutes) {
      let router = new Router({
        prefix: `/service/${ServiceManager.getServiceId(service)}`,
      });

      service.addWebRoutes(router);

      app.use(router.routes()).use(router.allowedMethods());
    }
  });

  app.use(async (ctx: Koa.Context) => {
    // A previous middleware may have already returned content.
    if (ctx.body) {
      return;
    }

    let html = await fs.readFile(htmlFile, {
      encoding: "utf8",
    });

    ctx.status = 200;
    ctx.type = "text/html";
    ctx.body = html;
  });

  app.listen(config.port + 10);

  return app;
}