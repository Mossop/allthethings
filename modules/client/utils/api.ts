import equal from "fast-deep-equal/es6";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Deferred } from "#utils";
import { defer, TypedEmitter } from "#utils";

import { Api } from "./client";
import type { HttpResponse, RequestParams } from "./client";
import { log } from "./logging";
import type { Token } from "./refresh";
import { addRefreshable, refresh, removeRefreshable } from "./refresh";

export type ApiMethod<A extends unknown[], D> = (
  ...args: [...A, RequestParams]
) => Promise<HttpResponse<D, Error | undefined | null>>;

export type QueryOptions = Omit<
  RequestParams,
  "cancelToken" | "credentials"
> & {
  pollInterval?: number;
};

interface QueryEvents<D> {
  load: [];
  data: [data: D];
  error: [error: Error];
}

export class Query<
  A extends unknown[] = unknown[],
  D = unknown,
> extends TypedEmitter<QueryEvents<D>> {
  protected data: D | undefined = undefined;
  protected error: Error | undefined = undefined;
  protected cancelToken = Symbol();
  protected nextPoll: number | null = 0;
  protected pendingResult = false;
  protected timer: number | null = null;
  protected polls: Deferred<D>[] = [];
  protected loading = false;

  public constructor(
    protected readonly method: ApiMethod<A, D>,
    protected readonly args: A,
    protected readonly options: QueryOptions = {},
    protected paused: boolean = false,
  ) {
    super();

    if (!paused) {
      addRefreshable(method, this);
    }

    this.schedule();
  }

  public start(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    addRefreshable(this.method, this);

    if (this.pendingResult) {
      this.pendingResult = false;

      if (this.error) {
        this.emit("error", this.error);
      } else {
        this.emit("data", this.data!);
      }
    }

    this.schedule();
  }

  protected schedule(): void {
    if (this.paused || this.nextPoll === null) {
      return;
    }

    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = window.setTimeout(() => {
      this.timer = null;

      void this.request();
    }, Math.max(0, this.nextPoll - Date.now()));
  }

  public stop(): void {
    if (this.paused) {
      return;
    }

    this.paused = true;
    removeRefreshable(this.method, this);
    api.abortRequest(this.cancelToken);
  }

  public refresh(): Promise<D> {
    let deferred = defer<D>();
    this.polls.push(deferred);

    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }

    void this.request();

    return deferred.promise;
  }

  protected setData(data: D): void {
    this.data = data;
    this.error = undefined;

    if (!equal(this.data, data)) {
      return;
    }

    if (!this.paused) {
      this.emit("data", this.data);
    } else {
      this.pendingResult = true;
    }
  }

  protected setError(error: Error): void {
    // @ts-ignore
    log.error(error);

    this.error = error;
    this.data = undefined;

    if (!this.paused) {
      this.emit("error", this.error);
    } else {
      this.pendingResult = true;
    }
  }

  protected async request(): Promise<void> {
    if (this.loading) {
      await new Promise<void>((resolve: () => void): void =>
        this.once("load", resolve),
      );
    }

    this.nextPoll = null;
    this.loading = true;

    let pollers = this.polls.splice(0, this.polls.length);

    try {
      let credentials: RequestCredentials = "include";

      let response = await this.method(...this.args, {
        ...this.options,
        credentials,
        cancelToken: this.cancelToken,
      });

      if (response.error) {
        this.setError(response.error);
      } else {
        this.setData(response.data);
      }
    } catch (e) {
      this.setError(e);
    }

    if (this.options.pollInterval) {
      this.nextPoll = Date.now() + this.options.pollInterval;
    }

    this.schedule();
    this.loading = false;

    this.emit("load");

    for (let poller of pollers) {
      if (this.error) {
        poller.reject(this.error);
      } else {
        poller.resolve(this.data!);
      }
    }
  }
}

export interface RequestState {
  loading: boolean;
  error?: Error;
}

export type QueryHookResult<D> = [data: D | undefined, state: RequestState];

export type QueryHook<A extends unknown[], D> = (
  ...args: A
) => QueryHookResult<D>;

export function queryHook<A extends unknown[], D>(
  method: ApiMethod<A, D>,
  options: QueryOptions = {},
): QueryHook<A, D> {
  return (...args: A): QueryHookResult<D> => {
    let [state, setState] = useState<QueryHookResult<D>>([
      undefined,
      { loading: true },
    ]);

    let setData = useCallback(
      (data: D) => setState([data, { loading: false }]),
      [],
    );

    let setError = useCallback(
      (error: Error) =>
        setState([
          undefined,
          {
            loading: false,
            error,
          },
        ]),
      [],
    );

    let queryRef = useRef<Query<A, D>>();
    let previousArgs = useRef<A>(args);

    let query: Query<A, D>;
    if (!queryRef.current || !equal(args, previousArgs.current)) {
      queryRef.current = new Query(method, args, options, true);
      previousArgs.current = args;
    }
    query = queryRef.current;

    useEffect(() => {
      query.on("data", setData);
      query.on("error", setError);
      query.start();

      return () => {
        query.stop();
        query.off("data", setData);
        query.off("error", setError);
      };
    }, [query, setData, setError]);

    return state;
  };
}

export type MutationOptions = Omit<RequestParams, "cancelToken"> & {
  refreshTokens?: Token[];
};

export type Mutation<A extends unknown[], D> = (...args: A) => Promise<D>;

export type MutationHook<A extends unknown[], D> = () => [
  mutation: Mutation<A, D>,
  state: RequestState,
];

export function mutationHook<A extends unknown[], D>(
  method: ApiMethod<A, D>,
  options: MutationOptions = {},
): MutationHook<A, D> {
  return (): [mutation: Mutation<A, D>, state: RequestState] => {
    let cancelToken = useMemo(() => Symbol(), []);
    let [state, setState] = useState<RequestState>({
      loading: false,
      error: undefined,
    });

    useEffect(() => {
      return () => api.abortRequest(cancelToken);
    }, [cancelToken]);

    let mutation = useCallback(
      async (...args: A): Promise<D> => {
        setState({ loading: true, error: undefined });

        let credentials: RequestCredentials = "include";
        let response = await method(...args, {
          ...options,
          cancelToken,
          credentials,
        });
        if (response.error) {
          setState({ loading: false, error: response.error });
          throw response.error;
        }

        if (options.refreshTokens) {
          await Promise.all(
            options.refreshTokens.map(
              (token: Token): Promise<void> => refresh(token),
            ),
          );
        }

        setState({ loading: false, error: undefined });
        return response.data;
      },
      [cancelToken],
    );

    return [mutation, state];
  };
}

let url = new URL(document.URL);
let port = url.port ? parseInt(url.port) : 80;
let baseUrl = `http://${url.hostname}:${port + 10}`;
export const api = new Api({ baseUrl });
