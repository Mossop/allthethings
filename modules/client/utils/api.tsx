import equal from "fast-deep-equal/es6";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TypedEmitter } from "#utils";

import type { ApiConfig, HttpResponse, RequestParams } from "./client";
import { Api as Client } from "./client";
import { log } from "./logging";
import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export type Api = Client<unknown>;

export type ApiMethod<A extends unknown[], D, E> = (
  ...args: [...A, RequestParams]
) => Promise<HttpResponse<D, E>>;

export type QueryOptions = Omit<RequestParams, "cancelToken">;

const ApiContext = createContext<Api | null>(null);

export function useApi(): Api {
  let api = useContext(ApiContext);
  if (api) {
    return api;
  }

  throw new Error("Cannot use API outside of the API provider.");
}

export const ApiProvider = ReactMemo(function ApiProvider({
  children,
  ...config
}: ApiConfig & ReactChildren): ReactResult {
  let api = new Client(config);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
});

interface QueryEvents<D, E> {
  data: [data: D];
  error: [error: E];
}

class Query<A extends unknown[], D, E> extends TypedEmitter<QueryEvents<D, E>> {
  protected loading = true;
  protected data: D | undefined = undefined;
  protected error: E | undefined = undefined;
  protected cancelToken = Symbol();

  public constructor(
    protected readonly api: Api,
    protected readonly method: ApiMethod<A, D, E>,
    protected readonly args: A,
    protected readonly options: QueryOptions = {},
    protected paused: boolean = false,
  ) {
    super();

    void this.poll();
  }

  public start(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    if (this.loading) {
      void this.poll();
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
    this.loading = false;

    if (!this.paused) {
      this.emit("data", this.data);
    }
  }

  protected setError(error: E): void {
    // @ts-ignore
    log.error(error);

    this.error = error;
    this.data = undefined;
    this.loading = false;

    if (!this.paused) {
      this.emit("error", this.error);
    }
  }

  protected async poll(): Promise<void> {
    if (this.paused) {
      return;
    }

    try {
      let response = await this.method(...this.args, {
        ...this.options,
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

export function queryHook<A extends unknown[], D, E>(
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
