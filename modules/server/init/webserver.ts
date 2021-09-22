import { promises as fs } from "fs";
import path from "path";

import type { ApolloServer } from "apollo-server-koa";
import busboy from "async-busboy";
import koa from "koa";
import type Koa from "koa";
import koaMount from "koa-mount";
import koaSession from "koa-session";
import koaStatic from "koa-static";

import type { Database } from "#db";
import type { ServerConfig } from "#server/core";
import {
  User,
  buildServiceTransaction,
  ServiceManager,
  withTransaction,
} from "#server/core";
import {
  RootSegment,
  Service,
  ServiceWebContext,
  ServiceWebContextExtras,
  Transaction,
} from "#server/utils";
import { log, Segment } from "#server/utils";
import type { DescriptorsFor } from "#utils";
import { defer } from "#utils";

interface ExtraContext {
  readonly userId: string | null;
  readonly segment: Segment;
  login(userId: string): void;
  logout(): void;
  startTransaction(operation: string, writable?: boolean): Promise<Transaction>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

export type WebServerContext = ExtraContext &
  Koa.DefaultContext &
  Koa.ExtendableContext;

interface TransactionHolder {
  transaction: Promise<Transaction>;
  reject: (reason?: Error) => void;
  resolve: () => void;
  complete: Promise<void>;
}

export async function buildWebServerContext(
  config: ServerConfig,
  db: Database,
): Promise<DescriptorsFor<ExtraContext>> {
  let transactions = new WeakMap<WebServerContext, TransactionHolder>();
  let segments = new WeakMap<WebServerContext, Segment>();

  return {
    userId: {
      enumerable: true,
      get(this: WebServerContext): string | null {
        return (this.session?.userId as string | undefined) ?? null;
      },
    },

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
        operation: string,
        writable: boolean = true,
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

          holder.complete = withTransaction(
            db,
            this.segment,
            operation,
            (tx: Transaction): Promise<void> => {
              deferredTransaction.resolve(tx);
              return deferred.promise;
            },
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

async function authMiddleware(ctx: WebServerContext): Promise<unknown> {
  try {
    if (ctx.method == "POST") {
      if (ctx.path == "/login") {
        let { fields } = await busboy(ctx.req);

        if (fields.email && fields.password) {
          let tx = await ctx.startTransaction("Authentication", false);
          let user = await User.store(tx).findOne({ email: fields.email });
          if (user && (await user.verifyUser(fields.password))) {
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
  } catch (error) {
    ctx.segment.error("Failed in authentication middleware", { error });
    ctx.status = 500;
    ctx.body = "fail";
  }
}

export async function createWebServer(
  config: ServerConfig,
  db: Database,
  gqlServer: ApolloServer,
): Promise<WebServer> {
  let webRoot = path.join(__dirname, "..", "..", "web");

  let htmlFile = path.join(webRoot, "index.html");
  let context = await buildWebServerContext(config, db);

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

  app.use(transactionMiddleware);

  app.use(gqlServer.getMiddleware());

  app.use(koaMount("/api", authMiddleware));

  ServiceManager.services.forEach((service: Service) => {
    if (service.webMiddleware) {
      let id = ServiceManager.getServiceId(service);
      app.use(
        koaMount(
          `/service/${id}`,
          async (ctx: WebServerContext, next: Koa.Next): Promise<void> => {
            if (!ctx.userId) {
              throw new Error("Not authenticated.");
            }

            let transaction = await ctx.startTransaction(
              "Service request",
              true,
            );
            let serviceTransaction = await buildServiceTransaction(
              service,
              transaction,
            );

            let serviceContextDescriptors: DescriptorsFor<ServiceWebContextExtras> =
              {
                userId: {
                  enumerable: true,
                  value: ctx.userId,
                },
                transaction: {
                  enumerable: true,
                  value: serviceTransaction,
                },
              };

            let sctx: Koa.ParameterizedContext<unknown, ServiceWebContext> =
              Object.create(ctx, serviceContextDescriptors);

            return service.webMiddleware?.(sctx, next);
          },
        ),
      );
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
