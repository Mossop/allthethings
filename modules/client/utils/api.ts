import equal from "fast-deep-equal/es6";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TypedEmitter } from "#utils";

import { Api } from "./client";
import type { HttpResponse, RequestParams } from "./client";
import { log } from "./logging";

export type ApiMethod<A extends unknown[], D, E> = (
  ...args: [...A, RequestParams]
) => Promise<HttpResponse<D, E>>;

export type QueryOptions = Omit<
  RequestParams,
  "cancelToken" | "credentials"
> & {
  pollInterval?: number;
};

export function useApi(): Api {
  return api;
}

interface QueryEvents<D, E> {
  data: [data: D];
  error: [error: E];
}

export class Query<
  A extends unknown[],
  D,
  E extends Error = Error,
> extends TypedEmitter<QueryEvents<D, E>> {
  protected data: D | undefined = undefined;
  protected error: E | undefined = undefined;
  protected cancelToken = Symbol();
  protected nextPoll: number | null = 0;
  protected pendingResult = false;

  public constructor(
    protected readonly api: Api,
    protected readonly method: ApiMethod<A, D, E>,
    protected readonly args: A,
    protected readonly options: QueryOptions = {},
    protected paused: boolean = false,
  ) {
    super();

    if (!paused) {
      void this.poll();
    }
  }

  public start(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;

    if (this.pendingResult) {
      this.pendingResult = false;

      if (this.error) {
        this.emit("error", this.error);
      } else {
        this.emit("data", this.data!);
      }
    }

    this.schedulePoll();
  }

  protected schedulePoll(): void {
    if (this.nextPoll === null) {
      return;
    }

    let now = Date.now();
    if (now > this.nextPoll) {
      void this.poll();
    } else {
      setTimeout(() => {
        void this.poll();
      }, this.nextPoll - now);
    }
  }

  public stop(): void {
    if (this.paused) {
      return;
    }

    this.paused = true;
    this.api.abortRequest(this.cancelToken);
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

  protected setError(error: E): void {
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

  protected async poll(): Promise<void> {
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
      this.schedulePoll();
    }
  }
}

export interface QueryHookResult<D, E> {
  loading: boolean;
  data?: D;
  error?: E;
}

export type QueryHook<A extends unknown[], D, E> = (
  ...args: A
) => QueryHookResult<D, E>;

export function queryHook<A extends unknown[], D, E extends Error = Error>(
  methodGetter: (api: Api) => ApiMethod<A, D, E>,
  options: QueryOptions = {},
): QueryHook<A, D, E> {
  return (...args: A): QueryHookResult<D, E> => {
    let api = useApi();
    let method = useMemo(() => methodGetter(api), [api]);
    let [state, setState] = useState<QueryHookResult<D, E>>({ loading: true });

    let setData = useCallback(
      (data: D) =>
        setState({
          loading: false,
          data,
        }),
      [],
    );

    let setError = useCallback(
      (error: E) =>
        setState({
          loading: false,
          error,
        }),
      [],
    );

    let queryRef = useRef<Query<A, D, E>>();
    let previousArgs = useRef<A>(args);

    let query: Query<A, D, E>;
    if (!queryRef.current || !equal(args, previousArgs.current)) {
      queryRef.current = new Query(api, method, args, options, true);
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

export type MutationOptions = Omit<RequestParams, "cancelToken">;

export type Mutation<A extends unknown[], D> = (...args: A) => Promise<D>;

export type MutationHook<A extends unknown[], D> = () => Mutation<A, D>;

export function mutationHook<A extends unknown[], D, E>(
  methodGetter: (api: Api) => ApiMethod<A, D, E>,
  options: MutationOptions = {},
): MutationHook<A, D> {
  return (): Mutation<A, D> => {
    let api = useApi();
    let method = methodGetter(api);
    let cancelToken = useMemo(() => Symbol(), []);

    useEffect(() => {
      return () => api.abortRequest(cancelToken);
    }, [cancelToken, api]);

    return useCallback(
      async (...args: A): Promise<D> => {
        let response = await method(...args, {
          ...options,
          cancelToken,
        });
        if (response.error) {
          throw response.error;
        }

        return response.data;
      },
      [method, cancelToken],
    );
  };
}

let url = new URL(document.URL);
let port = url.port ? parseInt(url.port) : 80;
let baseUrl = `http://${url.hostname}:${port + 10}`;
export const api = new Api({ baseUrl });
