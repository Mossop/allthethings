/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserState {
  __typename: "User";
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface ContextState {
  __typename: "Context";
  id: string;
  stub: string;
  name: string;
}

export interface ProjectState {
  __typename: "Project";
  id: string;
  parentId: string | null;
  stub: string;
  name: string;
}

export type ServerProjectState = ProjectState & { dueTasks: number };

export type ServerContextState = ContextState & { projects: ServerProjectState[]; dueTasks: number };

export type ServerUserState = UserState & { contexts: ServerContextState[]; inbox: number };

export interface ServerProblem {
  url: string;
  description: string;
}

export interface ServerState {
  user: ServerUserState | null;
  problems: ServerProblem[];
  schemaVersion: string;
}

export interface ProjectParams {
  name: string;
}

/**
 * Make all properties in T optional
 */
export interface PartialProjectParams {
  name?: string;
}

export interface ContextParams {
  name: string;
}

/**
 * Make all properties in T optional
 */
export interface PartialContextParams {
  name?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title No title
 */
export class Api<SecurityDataType extends unknown = unknown> extends HttpClient<SecurityDataType> {
  page = {
    /**
     * No description
     *
     * @name GetPageContent
     * @request GET:/api/page
     * @response `200` `string` Ok
     */
    getPageContent: (query: { path: string }, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  login = {
    /**
     * No description
     *
     * @name Login
     * @request POST:/api/login
     * @response `200` `UserState` Ok
     */
    login: (data: LoginParams, params: RequestParams = {}) =>
      this.request<UserState, any>({
        path: `/api/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  logout = {
    /**
     * No description
     *
     * @name Logout
     * @request POST:/api/logout
     * @response `204` `void` No content
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/logout`,
        method: "POST",
        ...params,
      }),
  };
  state = {
    /**
     * No description
     *
     * @name GetState
     * @request GET:/api/state
     * @response `200` `ServerState` Ok
     */
    getState: (query: { dueBefore: string }, params: RequestParams = {}) =>
      this.request<ServerState, any>({
        path: `/api/state`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  project = {
    /**
     * No description
     *
     * @name CreateProject
     * @request PUT:/api/project
     * @response `200` `ProjectState` Ok
     */
    createProject: (data: { params: ProjectParams; taskListId: string }, params: RequestParams = {}) =>
      this.request<ProjectState, any>({
        path: `/api/project`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditProject
     * @request PATCH:/api/project
     * @response `200` `ProjectState` Ok
     */
    editProject: (data: { params: PartialProjectParams; id: string }, params: RequestParams = {}) =>
      this.request<ProjectState, any>({
        path: `/api/project`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteProject
     * @request DELETE:/api/project
     * @response `204` `void` No content
     */
    deleteProject: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/project`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name MoveProject
     * @request PATCH:/api/project/move
     * @response `200` `ProjectState` Ok
     */
    moveProject: (data: { taskListId: string; id: string }, params: RequestParams = {}) =>
      this.request<ProjectState, any>({
        path: `/api/project/move`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  context = {
    /**
     * No description
     *
     * @name CreateContext
     * @request PUT:/api/context
     * @response `200` `ContextState` Ok
     */
    createContext: (data: { params: ContextParams }, params: RequestParams = {}) =>
      this.request<ContextState, any>({
        path: `/api/context`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditContext
     * @request PATCH:/api/context
     * @response `200` `ContextState` Ok
     */
    editContext: (data: { params: PartialContextParams; id: string }, params: RequestParams = {}) =>
      this.request<ContextState, any>({
        path: `/api/context`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteContext
     * @request DELETE:/api/context
     * @response `204` `void` No content
     */
    deleteContext: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/context`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}