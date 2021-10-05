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

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickPhabricatorAccountEntityIdOrEmailOrUrlOrApiKey {
  id: string;
  email: string;
  url: string;
  apiKey: string;
}

export type PhabricatorAccountState = PickPhabricatorAccountEntityIdOrEmailOrUrlOrApiKey & {
  enabledQueries: string[];
  icon: string;
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickPhabricatorAccountEntityUrlOrApiKey {
  url: string;
  apiKey: string;
}

export type PhabricatorAccountParams = PickPhabricatorAccountEntityUrlOrApiKey & { queries: string[] };

/**
 * Make all properties in T optional
 */
export interface PartialPhabricatorAccountParams {
  url?: string;
  apiKey?: string;
  queries?: string[];
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickPhabricatorQueryEntityQueryId {
  queryId: string;
}

export type PhabricatorQueryState = PickPhabricatorQueryEntityQueryId & { description: string; name: string };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickJiraAccountEntityExcludeKeysUserId {
  id: string;
  apiToken: string;
  email: string;
  serverName: string;
  url: string;
  userName: string;
}

export type OmitJiraAccountEntityUserId = PickJiraAccountEntityExcludeKeysUserId;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickJiraSearchEntityExcludeKeysAccountId {
  id: string;
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitJiraSearchEntityAccountId = PickJiraSearchEntityExcludeKeysAccountId;

export type JiraSearchState = OmitJiraSearchEntityAccountId & { url: string };

export type JiraAccountState = OmitJiraAccountEntityUserId & { searches: JiraSearchState[] };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickJiraAccountEntityExcludeKeysIdOrUserIdOrServerNameOrUserName {
  apiToken: string;
  email: string;
  url: string;
}

export type OmitJiraAccountEntityIdOrUserIdOrServerNameOrUserName =
  PickJiraAccountEntityExcludeKeysIdOrUserIdOrServerNameOrUserName;

export type JiraAccountParams = OmitJiraAccountEntityIdOrUserIdOrServerNameOrUserName;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickJiraSearchEntityExcludeKeysIdOrAccountId {
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitJiraSearchEntityIdOrAccountId = PickJiraSearchEntityExcludeKeysIdOrAccountId;

export type JiraSearchParams = OmitJiraSearchEntityIdOrAccountId;

/**
 * Make all properties in T optional
 */
export interface PartialJiraSearchParams {
  name?: string;
  query?: string;
  dueOffset?: string | null;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGoogleAccountEntityExcludeKeysUserIdOrAccessTokenOrRefreshTokenOrExpiry {
  id: string;
  email: string;
  avatar: string | null;
}

export type OmitGoogleAccountEntityUserIdOrAccessTokenOrRefreshTokenOrExpiry =
  PickGoogleAccountEntityExcludeKeysUserIdOrAccessTokenOrRefreshTokenOrExpiry;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGoogleMailSearchEntityExcludeKeysAccountId {
  id: string;
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitGoogleMailSearchEntityAccountId = PickGoogleMailSearchEntityExcludeKeysAccountId;

export type GoogleMailSearchState = OmitGoogleMailSearchEntityAccountId & { url: string };

export type GoogleAccountState = OmitGoogleAccountEntityUserIdOrAccessTokenOrRefreshTokenOrExpiry & {
  mailSearches: GoogleMailSearchState[];
  loginUrl: string;
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGoogleMailSearchStateExcludeKeysIdOrUrlOrAccountId {
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitGoogleMailSearchStateIdOrUrlOrAccountId = PickGoogleMailSearchStateExcludeKeysIdOrUrlOrAccountId;

export type GoogleMailSearchParams = OmitGoogleMailSearchStateIdOrUrlOrAccountId;

/**
 * Make all properties in T optional
 */
export interface PartialGoogleMailSearchParams {
  name?: string;
  query?: string;
  dueOffset?: string | null;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGithubAccountEntityExcludeKeysUserIdOrToken {
  id: string;
  user: string;
  avatar: string;
}

export type OmitGithubAccountEntityUserIdOrToken = PickGithubAccountEntityExcludeKeysUserIdOrToken;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGithubSearchEntityExcludeKeysAccountId {
  id: string;
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitGithubSearchEntityAccountId = PickGithubSearchEntityExcludeKeysAccountId;

export type GithubSearchState = OmitGithubSearchEntityAccountId & { url: string };

export type GithubAccountState = OmitGithubAccountEntityUserIdOrToken & {
  searches: GithubSearchState[];
  loginUrl: string;
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickGithubSearchEntityExcludeKeysIdOrAccountId {
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitGithubSearchEntityIdOrAccountId = PickGithubSearchEntityExcludeKeysIdOrAccountId;

export type GithubSearchParams = OmitGithubSearchEntityIdOrAccountId;

/**
 * Make all properties in T optional
 */
export interface PartialGithubSearchParams {
  name?: string;
  query?: string;
  dueOffset?: string | null;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickBugzillaAccountEntityIdOrNameOrIconOrUrl {
  id: string;
  name: string;
  icon: string | null;
  url: string;
}

export enum SearchType {
  Quicksearch = "quick",
  Advanced = "advanced",
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickBugzillaSearchEntityExcludeKeysAccountId {
  id: string;
  name: string;
  query: string;
  type: SearchType;
  dueOffset: string | null;
}

export type OmitBugzillaSearchEntityAccountId = PickBugzillaSearchEntityExcludeKeysAccountId;

export type BugzillaSearchState = OmitBugzillaSearchEntityAccountId & { url: string };

export type BugzillaAccountState = PickBugzillaAccountEntityIdOrNameOrIconOrUrl & { searches: BugzillaSearchState[] };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickBugzillaAccountEntityExcludeKeysIdOrUserIdOrIcon {
  name: string;
  url: string;
  username: string | null;
  password: string | null;
}

export type OmitBugzillaAccountEntityIdOrUserIdOrIcon = PickBugzillaAccountEntityExcludeKeysIdOrUserIdOrIcon;

export type BugzillaAccountParams = OmitBugzillaAccountEntityIdOrUserIdOrIcon;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickBugzillaSearchEntityExcludeKeysIdOrAccountIdOrType {
  name: string;
  query: string;
  dueOffset: string | null;
}

export type OmitBugzillaSearchEntityIdOrAccountIdOrType = PickBugzillaSearchEntityExcludeKeysIdOrAccountIdOrType;

export type BugzillaSearchParams = OmitBugzillaSearchEntityIdOrAccountIdOrType;

/**
 * Make all properties in T optional
 */
export interface PartialBugzillaSearchParams {
  name?: string;
  query?: string;
  dueOffset?: string | null;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickUserEntityExcludeKeysPassword {
  email: string;
  isAdmin: boolean;
  id: string;
}

export type OmitUserEntityPassword = PickUserEntityExcludeKeysPassword;

export type UserState = OmitUserEntityPassword & { __typename: "User" };

export interface LoginParams {
  email: string;
  password: string;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickUserEntityExcludeKeysId {
  password: string;
  email: string;
  isAdmin: boolean;
}

export type OmitUserEntityId = PickUserEntityExcludeKeysId;

export type UserParams = OmitUserEntityId;

/**
 * Make all properties in T optional
 */
export interface PartialUserParams {
  password?: string;
  email?: string;
  isAdmin?: boolean;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickContextEntityExcludeKeysIdOrUserIdOrStub {
  name: string;
}

export type OmitContextEntityIdOrUserIdOrStub = PickContextEntityExcludeKeysIdOrUserIdOrStub;

export type ContextParams = OmitContextEntityIdOrUserIdOrStub;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickContextEntityIdOrStub {
  id: string;
  stub: string;
}

export type ContextState = ContextParams & PickContextEntityIdOrStub & { __typename: "Context" };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickProjectEntityExcludeKeysIdOrContextIdOrUserIdOrParentIdOrStub {
  name: string;
}

export type OmitProjectEntityIdOrContextIdOrUserIdOrParentIdOrStub =
  PickProjectEntityExcludeKeysIdOrContextIdOrUserIdOrParentIdOrStub;

export type ProjectParams = OmitProjectEntityIdOrContextIdOrUserIdOrParentIdOrStub;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickProjectEntityIdOrParentIdOrStub {
  id: string;
  stub: string;
  parentId: string | null;
}

export type ProjectState = ProjectParams & PickProjectEntityIdOrParentIdOrStub & { __typename: "Project" };

export type ServerProjectState = ProjectState & { dueTasks: number };

export type ServerContextState = ContextState & { projects: ServerProjectState[]; dueTasks: number };

export type ServerUserState = UserState & { contexts: ServerContextState[]; inbox: number };

export interface Problem {
  url: string;
  description: string;
}

export interface ServerState {
  user: ServerUserState | null;
  problems: Problem[];
  schemaVersion: string;
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickApiItemFilterExcludeKeysItemHolderId {
  isTask?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  doneBefore?: string;
  doneAfter?: string;
  isDue?: boolean;
  isDone?: boolean;
  isSnoozed?: boolean;
  isArchived?: boolean;
}

export type OmitApiItemFilterItemHolderId = PickApiItemFilterExcludeKeysItemHolderId;

/**
* A DateTime is an immutable data structure representing a specific date and time and accompanying methods.
It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.

A DateTime comprises of:
* A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
* A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
* Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.

Here is a brief overview of the most commonly used functionality it provides:

* **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link DateTime.local}, {@link DateTime.utc}, and (most flexibly) {@link DateTime.fromObject}.
To create one from a standard string format, use {@link DateTime.fromISO}, {@link DateTime.fromHTTP}, and {@link DateTime.fromRFC2822}.
To create one from a custom string format, use {@link DateTime.fromFormat}. To create one from a native JS date, use {@link DateTime.fromJSDate}.
* **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link DateTime#toObject }), use the {@link DateTime#year },
{@link DateTime#month }, {@link DateTime#day }, {@link DateTime#hour }, {@link DateTime#minute }, {@link DateTime#second }, {@link DateTime#millisecond } accessors.
* **Week calendar**: For ISO week calendar attributes, see the {@link DateTime#weekYear }, {@link DateTime#weekNumber }, and {@link DateTime#weekday } accessors.
* **Configuration** See the {@link DateTime#locale } and {@link DateTime#numberingSystem } accessors.
* **Transformation**: To transform the DateTime into other DateTimes, use {@link DateTime#set }, {@link DateTime#reconfigure }, {@link DateTime#setZone }, {@link DateTime#setLocale },
{@link DateTime.plus}, {@link DateTime#minus }, {@link DateTime#endOf }, {@link DateTime#startOf }, {@link DateTime#toUTC }, and {@link DateTime#toLocal }.
* **Output**: To convert the DateTime to other representations, use the {@link DateTime#toRelative }, {@link DateTime#toRelativeCalendar }, {@link DateTime#toJSON }, {@link DateTime#toISO },
{@link DateTime#toHTTP }, {@link DateTime#toObject }, {@link DateTime#toRFC2822 }, {@link DateTime#toString }, {@link DateTime#toLocaleString }, {@link DateTime#toFormat },
{@link DateTime#toMillis } and {@link DateTime#toJSDate }.

There's plenty others documented below. In addition, for more information on subtler topics
like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
*/
export type DateTime = string;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickItemEntityExcludeKeysIdOrUserIdOrSectionIdOrSectionIndexOrTypeOrCreated {
  summary: string;
  archived: DateTime | null;
  snoozed: DateTime | null;
}

export type OmitItemEntityIdOrUserIdOrSectionIdOrSectionIndexOrTypeOrCreated =
  PickItemEntityExcludeKeysIdOrUserIdOrSectionIdOrSectionIndexOrTypeOrCreated;

export type ItemParams = OmitItemEntityIdOrUserIdOrSectionIdOrSectionIndexOrTypeOrCreated;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickItemEntityIdOrCreated {
  id: string;

  /**
   * A DateTime is an immutable data structure representing a specific date and time and accompanying methods.
   * It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
   *
   * A DateTime comprises of:
   * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
   * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
   * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
   *
   * Here is a brief overview of the most commonly used functionality it provides:
   *
   * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link DateTime.local}, {@link DateTime.utc}, and (most flexibly) {@link DateTime.fromObject}.
   * To create one from a standard string format, use {@link DateTime.fromISO}, {@link DateTime.fromHTTP}, and {@link DateTime.fromRFC2822}.
   * To create one from a custom string format, use {@link DateTime.fromFormat}. To create one from a native JS date, use {@link DateTime.fromJSDate}.
   * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link DateTime#toObject }), use the {@link DateTime#year },
   * {@link DateTime#month }, {@link DateTime#day }, {@link DateTime#hour }, {@link DateTime#minute }, {@link DateTime#second }, {@link DateTime#millisecond } accessors.
   * * **Week calendar**: For ISO week calendar attributes, see the {@link DateTime#weekYear }, {@link DateTime#weekNumber }, and {@link DateTime#weekday } accessors.
   * * **Configuration** See the {@link DateTime#locale } and {@link DateTime#numberingSystem } accessors.
   * * **Transformation**: To transform the DateTime into other DateTimes, use {@link DateTime#set }, {@link DateTime#reconfigure }, {@link DateTime#setZone }, {@link DateTime#setLocale },
   * {@link DateTime.plus}, {@link DateTime#minus }, {@link DateTime#endOf }, {@link DateTime#startOf }, {@link DateTime#toUTC }, and {@link DateTime#toLocal }.
   * * **Output**: To convert the DateTime to other representations, use the {@link DateTime#toRelative }, {@link DateTime#toRelativeCalendar }, {@link DateTime#toJSON }, {@link DateTime#toISO },
   * {@link DateTime#toHTTP }, {@link DateTime#toObject }, {@link DateTime#toRFC2822 }, {@link DateTime#toString }, {@link DateTime#toLocaleString }, {@link DateTime#toFormat },
   * {@link DateTime#toMillis } and {@link DateTime#toJSDate }.
   *
   * There's plenty others documented below. In addition, for more information on subtler topics
   * like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
   */
  created: DateTime;
}

export enum TaskController {
  Manual = "manual",
  ServiceList = "list",
  Service = "service",
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickTaskInfoEntityDueOrDoneOrController {
  due: DateTime | null;
  done: DateTime | null;
  controller: TaskController;
}

export type TaskInfoState = PickTaskInfoEntityDueOrDoneOrController & { __typename: "TaskInfo" };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickLinkDetailEntityExcludeKeysIdOrIcon {
  url: string;
}

export type OmitLinkDetailEntityIdOrIcon = PickLinkDetailEntityExcludeKeysIdOrIcon;

export type LinkDetailParams = OmitLinkDetailEntityIdOrIcon;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickLinkDetailEntityIcon {
  icon: string | null;
}

export type LinkDetailState = LinkDetailParams & PickLinkDetailEntityIcon & { __typename: "LinkDetail" };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickNoteDetailEntityExcludeKeysIdOrUrl {
  note: string;
}

export type OmitNoteDetailEntityIdOrUrl = PickNoteDetailEntityExcludeKeysIdOrUrl;

export type NoteDetailParams = OmitNoteDetailEntityIdOrUrl;

export type NoteDetailState = NoteDetailParams & { __typename: "NoteDetail" };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickServiceDetailEntityExcludeKeysIdOrTaskDueOrTaskDone {
  serviceId: string;
  hasTaskState: boolean;
}

export type OmitServiceDetailEntityIdOrTaskDueOrTaskDone = PickServiceDetailEntityExcludeKeysIdOrTaskDueOrTaskDone;

export interface ServiceListEntity {
  id: string;
  serviceId: string;
  name: string;
  url: string | null;
}

export type ServiceListState = ServiceListEntity & { __typename: "ServiceList" };

export type ServiceDetailState = OmitServiceDetailEntityIdOrTaskDueOrTaskDone & {
  lists: ServiceListState[];
  fields: any;
  isCurrentlyListed: boolean;
  wasEverListed: boolean;
  __typename: "ServiceDetail";
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickFileDetailEntityExcludeKeysIdOrPathOrSizeOrMimetype {
  filename: string;
}

export type OmitFileDetailEntityIdOrPathOrSizeOrMimetype = PickFileDetailEntityExcludeKeysIdOrPathOrSizeOrMimetype;

export type FileDetailParams = OmitFileDetailEntityIdOrPathOrSizeOrMimetype;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickFileDetailEntitySizeOrMimetype {
  /** @format double */
  size: number;
  mimetype: string;
}

export type FileDetailState = FileDetailParams & PickFileDetailEntitySizeOrMimetype & { __typename: "FileDetail" };

export type ItemDetailState =
  | LinkDetailState
  | NoteDetailState
  | ServiceDetailState
  | FileDetailState
  | (LinkDetailState & NoteDetailState & ServiceDetailState & FileDetailState);

export type ItemState = ItemParams &
  PickItemEntityIdOrCreated & { detail: ItemDetailState | null; taskInfo: TaskInfoState | null; __typename: "Item" };

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickSectionEntityExcludeKeysIdOrUserIdOrProjectIdOrIndexOrStub {
  name: string;
}

export type OmitSectionEntityIdOrUserIdOrProjectIdOrIndexOrStub =
  PickSectionEntityExcludeKeysIdOrUserIdOrProjectIdOrIndexOrStub;

export type SectionParams = OmitSectionEntityIdOrUserIdOrProjectIdOrIndexOrStub;

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export interface PickSectionEntityIdOrStub {
  id: string;
  stub: string;
}

export type SectionState = SectionParams & PickSectionEntityIdOrStub & { __typename: "Section" };

export type SectionContents = SectionState & { items: ItemState[] };

export type ProjectContents = ProjectState & { sections: SectionContents[]; items: ItemState[] };

export type ContextContents = ContextState & { sections: SectionContents[]; items: ItemState[] };

/**
 * Make all properties in T optional
 */
export interface PartialProjectParams {
  name?: string;
}

/**
 * Make all properties in T optional
 */
export interface PartialContextParams {
  name?: string;
}

/**
 * Make all properties in T optional
 */
export interface PartialSectionParams {
  name?: string;
}

export interface ApiItemFilter {
  itemHolderId?: string | null;
  isTask?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  doneBefore?: string;
  doneAfter?: string;
  isDue?: boolean;
  isDone?: boolean;
  isSnoozed?: boolean;
  isArchived?: boolean;
}

/**
 * Make all properties in T optional
 */
export interface PartialDueStringOrNullDoneStringOrNull {
  due?: string | null;
  done?: string | null;
}

/**
 * Make all properties in T optional
 */
export interface PartialItemParams {
  summary?: string;
  archived?: DateTime | null;
  snoozed?: DateTime | null;
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
  phabricator = {
    /**
     * No description
     *
     * @name ListAccounts
     * @request GET:/service/phabricator/account
     * @response `200` `(PhabricatorAccountState)[]` Ok
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<PhabricatorAccountState[], any>({
        path: `/service/phabricator/account`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateAccount
     * @request PUT:/service/phabricator/account
     * @response `200` `PhabricatorAccountState` Ok
     */
    createAccount: (data: { params: PhabricatorAccountParams }, params: RequestParams = {}) =>
      this.request<PhabricatorAccountState, any>({
        path: `/service/phabricator/account`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditAccount
     * @request PATCH:/service/phabricator/account
     * @response `200` `PhabricatorAccountState` Ok
     */
    editAccount: (data: { params: PartialPhabricatorAccountParams; id: string }, params: RequestParams = {}) =>
      this.request<PhabricatorAccountState, any>({
        path: `/service/phabricator/account`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteAccount
     * @request DELETE:/service/phabricator/account
     * @response `204` `void` No content
     */
    deleteAccount: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/phabricator/account`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name ListQueries
     * @request GET:/service/phabricator/query
     * @response `200` `(PhabricatorQueryState)[]` Ok
     */
    listQueries: (params: RequestParams = {}) =>
      this.request<PhabricatorQueryState[], any>({
        path: `/service/phabricator/query`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  jira = {
    /**
     * No description
     *
     * @name ListAccounts
     * @request GET:/service/jira/account
     * @response `200` `(JiraAccountState)[]` Ok
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<JiraAccountState[], any>({
        path: `/service/jira/account`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateAccount
     * @request PUT:/service/jira/account
     * @response `200` `JiraAccountState` Ok
     */
    createAccount: (data: { params: JiraAccountParams }, params: RequestParams = {}) =>
      this.request<JiraAccountState, any>({
        path: `/service/jira/account`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteAccount
     * @request DELETE:/service/jira/account
     * @response `204` `void` No content
     */
    deleteAccount: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/jira/account`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateSearch
     * @request PUT:/service/jira/search
     * @response `200` `JiraSearchState` Ok
     */
    createSearch: (data: { params: JiraSearchParams; accountId: string }, params: RequestParams = {}) =>
      this.request<JiraSearchState, any>({
        path: `/service/jira/search`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditSearch
     * @request PATCH:/service/jira/search
     * @response `200` `JiraSearchState` Ok
     */
    editSearch: (data: { params: PartialJiraSearchParams; id: string }, params: RequestParams = {}) =>
      this.request<JiraSearchState, any>({
        path: `/service/jira/search`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteSearch
     * @request DELETE:/service/jira/search
     * @response `204` `void` No content
     */
    deleteSearch: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/jira/search`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  google = {
    /**
     * No description
     *
     * @name GetLoginUrl
     * @request GET:/service/google/loginUrl
     * @response `200` `DateTime` Ok
     */
    getLoginUrl: (params: RequestParams = {}) =>
      this.request<DateTime, any>({
        path: `/service/google/loginUrl`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ListAccounts
     * @request GET:/service/google/accounts
     * @response `200` `(GoogleAccountState)[]` Ok
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<GoogleAccountState[], any>({
        path: `/service/google/accounts`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateSearch
     * @request PUT:/service/google/search
     * @response `200` `GoogleMailSearchState` Ok
     */
    createSearch: (data: { params: GoogleMailSearchParams; accountId: string }, params: RequestParams = {}) =>
      this.request<GoogleMailSearchState, any>({
        path: `/service/google/search`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditSearch
     * @request PATCH:/service/google/search
     * @response `200` `GoogleMailSearchState` Ok
     */
    editSearch: (data: { params: PartialGoogleMailSearchParams; id: string }, params: RequestParams = {}) =>
      this.request<GoogleMailSearchState, any>({
        path: `/service/google/search`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteSearch
     * @request DELETE:/service/google/search
     * @response `204` `void` No content
     */
    deleteSearch: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/google/search`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  github = {
    /**
     * No description
     *
     * @name GetLoginUrl
     * @request GET:/service/github/loginUrl
     * @response `200` `DateTime` Ok
     */
    getLoginUrl: (params: RequestParams = {}) =>
      this.request<DateTime, any>({
        path: `/service/github/loginUrl`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ListAccounts
     * @request GET:/service/github/accounts
     * @response `200` `(GithubAccountState)[]` Ok
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<GithubAccountState[], any>({
        path: `/service/github/accounts`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateSearch
     * @request PUT:/service/github/search
     * @response `200` `GithubSearchState` Ok
     */
    createSearch: (data: { params: GithubSearchParams; accountId: string }, params: RequestParams = {}) =>
      this.request<GithubSearchState, any>({
        path: `/service/github/search`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditSearch
     * @request PATCH:/service/github/search
     * @response `200` `GithubSearchState` Ok
     */
    editSearch: (data: { params: PartialGithubSearchParams; id: string }, params: RequestParams = {}) =>
      this.request<GithubSearchState, any>({
        path: `/service/github/search`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteSearch
     * @request DELETE:/service/github/search
     * @response `204` `void` No content
     */
    deleteSearch: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/github/search`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  bugzilla = {
    /**
     * No description
     *
     * @name ListAccounts
     * @request GET:/service/bugzilla/account
     * @response `200` `(BugzillaAccountState)[]` Ok
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<BugzillaAccountState[], any>({
        path: `/service/bugzilla/account`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateAccount
     * @request PUT:/service/bugzilla/account
     * @response `200` `BugzillaAccountState` Ok
     */
    createAccount: (data: { params: BugzillaAccountParams }, params: RequestParams = {}) =>
      this.request<BugzillaAccountState, any>({
        path: `/service/bugzilla/account`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteAccount
     * @request DELETE:/service/bugzilla/account
     * @response `204` `void` No content
     */
    deleteAccount: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/bugzilla/account`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateSearch
     * @request PUT:/service/bugzilla/search
     * @response `200` `BugzillaSearchState` Ok
     */
    createSearch: (data: { params: BugzillaSearchParams; accountId: string }, params: RequestParams = {}) =>
      this.request<BugzillaSearchState, any>({
        path: `/service/bugzilla/search`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditSearch
     * @request PATCH:/service/bugzilla/search
     * @response `200` `BugzillaSearchState` Ok
     */
    editSearch: (data: { params: PartialBugzillaSearchParams; id: string }, params: RequestParams = {}) =>
      this.request<BugzillaSearchState, any>({
        path: `/service/bugzilla/search`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteSearch
     * @request DELETE:/service/bugzilla/search
     * @response `204` `void` No content
     */
    deleteSearch: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service/bugzilla/search`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  page = {
    /**
     * No description
     *
     * @name GetPageContent
     * @request GET:/api/page
     * @response `200` `DateTime` Ok
     */
    getPageContent: (query: { path: string }, params: RequestParams = {}) =>
      this.request<DateTime, any>({
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
  users = {
    /**
     * No description
     *
     * @name ListUsers
     * @request GET:/api/users
     * @response `200` `(UserState)[]` Ok
     */
    listUsers: (params: RequestParams = {}) =>
      this.request<UserState[], any>({
        path: `/api/users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateUser
     * @request PUT:/api/users
     * @response `200` `UserState` Ok
     */
    createUser: (data: UserParams, params: RequestParams = {}) =>
      this.request<UserState, any>({
        path: `/api/users`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditUser
     * @request PATCH:/api/users
     * @response `200` `UserState` Ok
     */
    editUser: (data: PartialUserParams & { currentPassword?: string; id?: string }, params: RequestParams = {}) =>
      this.request<UserState, any>({
        path: `/api/users`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteUser
     * @request DELETE:/api/users
     * @response `204` `void` No content
     */
    deleteUser: (data: { id?: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/users`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  state = {
    /**
     * No description
     *
     * @name GetState
     * @request POST:/api/state
     * @response `200` `ServerState` Ok
     */
    getState: (
      data: {
        itemFilter:
          | OmitApiItemFilterItemHolderId
          | OmitApiItemFilterItemHolderId[]
          | (OmitApiItemFilterItemHolderId & OmitApiItemFilterItemHolderId[]);
      },
      params: RequestParams = {},
    ) =>
      this.request<ServerState, any>({
        path: `/api/state`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
     * @name ListContents
     * @request POST:/api/project/contents
     * @response `200` `(ProjectContents | ContextContents | (ProjectContents & ContextContents))` Ok
     */
    listContents: (
      data: {
        itemFilter?:
          | OmitApiItemFilterItemHolderId
          | OmitApiItemFilterItemHolderId[]
          | (OmitApiItemFilterItemHolderId & OmitApiItemFilterItemHolderId[]);
        id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ProjectContents | ContextContents | (ProjectContents & ContextContents), any>({
        path: `/api/project/contents`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
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
  section = {
    /**
     * No description
     *
     * @name CreateSection
     * @request PUT:/api/section
     * @response `200` `SectionState` Ok
     */
    createSection: (
      data: { params: SectionParams; beforeId?: string | null; taskListId: string },
      params: RequestParams = {},
    ) =>
      this.request<SectionState, any>({
        path: `/api/section`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditSection
     * @request PATCH:/api/section
     * @response `200` `SectionState` Ok
     */
    editSection: (data: { params: PartialSectionParams; id: string }, params: RequestParams = {}) =>
      this.request<SectionState, any>({
        path: `/api/section`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteSection
     * @request DELETE:/api/section
     * @response `204` `void` No content
     */
    deleteSection: (data: { id: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/section`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  item = {
    /**
     * No description
     *
     * @name ListItems
     * @request POST:/api/item/list
     * @response `200` `(ItemState)[]` Ok
     */
    listItems: (
      data: { itemFilter: ApiItemFilter | ApiItemFilter[] | (ApiItemFilter & ApiItemFilter[]) },
      params: RequestParams = {},
    ) =>
      this.request<ItemState[], any>({
        path: `/api/item/list`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateTask
     * @request PUT:/api/item/task
     * @response `200` `ItemState` Ok
     */
    createTask: (
      data: {
        task?: { done?: string | null; due?: string | null };
        item: ItemParams;
        beforeId?: string | null;
        itemHolderId?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ItemState, any>({
        path: `/api/item/task`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditTask
     * @request PATCH:/api/item/task
     * @response `200` `ItemState` Ok
     */
    editTask: (data: { params: PartialDueStringOrNullDoneStringOrNull; id: string }, params: RequestParams = {}) =>
      this.request<ItemState, any>({
        path: `/api/item/task`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditTaskController
     * @request PATCH:/api/item/task/controller
     * @response `200` `ItemState` Ok
     */
    editTaskController: (data: { controller: TaskController | null; id: string }, params: RequestParams = {}) =>
      this.request<ItemState, any>({
        path: `/api/item/task/controller`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateLink
     * @request PUT:/api/item/link
     * @response `200` `ItemState` Ok
     */
    createLink: (
      data: {
        isTask: boolean;
        link: LinkDetailParams;
        item: ItemParams;
        beforeId?: string | null;
        itemHolderId?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ItemState, any>({
        path: `/api/item/link`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name MoveItem
     * @request PATCH:/api/item/move
     * @response `200` `ItemState` Ok
     */
    moveItem: (
      data: { beforeId?: string | null; itemHolderId: string | null; id: string },
      params: RequestParams = {},
    ) =>
      this.request<ItemState, any>({
        path: `/api/item/move`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EditItem
     * @request PATCH:/api/item
     * @response `200` `ItemState` Ok
     */
    editItem: (data: { params: PartialItemParams; id: string }, params: RequestParams = {}) =>
      this.request<ItemState, any>({
        path: `/api/item`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteItem
     * @request DELETE:/api/item
     * @response `200` `ItemState` Ok
     */
    deleteItem: (data: { id: string }, params: RequestParams = {}) =>
      this.request<ItemState, any>({
        path: `/api/item`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
