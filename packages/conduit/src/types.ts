/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GenericAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (params?: Record<string, unknown>): Promise<any>;
  [K: string]: GenericAPI;
}

export enum RevisionStatus {
  Draft = "draft",
  NeedsReview = "needs-review",
  NeedsRevision = "needs-revision",
  ChangesPlanned = "changes-planned",
  Accepted = "accepted",
  Closed = "published",
  Abandoned = "abandoned",
}

export function isClosed(status: RevisionStatus): boolean {
  return status == RevisionStatus.Closed || status == RevisionStatus.Abandoned;
}

export function isOpen(status: RevisionStatus): boolean {
  return !isClosed(status);
}

export type PaginatedRequest<R> = R & {
  before?: string | null;
  after?: string | null;
  order?: string | null;
  limit?: number;
};

export interface PaginatedResult<R> {
  data: R[];
  cursor: {
    limit: number;
    after: string | null;
    before: string | null;
    order: string | null;
  };
}

export type SimpleApiMethod<R> = () => Promise<R>;
export type ApiMethod<R, A> = (arg: A) => Promise<R>;
export type PaginatedApiMethod<R, A> = ApiMethod<PaginatedResult<R>, PaginatedRequest<A>>;

export interface Conduit {
  user: User;
  differential: Differential;

  [K: string]: GenericAPI;
}

export type User = GenericAPI & {
  whoami: SimpleApiMethod<User$Result>;
};

export interface User$Result {
  phid: string;
  userName: string;
  realName: string;
  image: string;
  uri: string;
  roles: string[];
  primaryEmail: string;
}

export type Differential = GenericAPI & {
  revision: Differential$Revision;
};

export type Differential$Revision = GenericAPI & {
  search: PaginatedApiMethod<
    Differential$Revision$Search$Result,
    Differential$Revision$Search$Params
  >;
};

export interface Differential$Revision$Search$Params {
  queryKey?: string;
  constraints?: Differential$Revision$Search$Constraints;
  attachments?: Differential$Revision$Search$Attachments;
  order?: string | string[];
  before?: string | null;
  after?: string | null;
  limit?: number;
}

export interface Differential$Revision$Search$Constraints {
  ids?: number[];
  phids?: string[];
  responsiblePHIDs?: string[];
  authorPHIDs?: string[];
  reviewerPHIDs?: string[];
  repositoryPHIDs?: string[];
  statuses?: string[];
  createdStart?: number;
  createdEnd?: number;
  modifiedStart?: number;
  modifiedEnd?: number;
  affectedPaths?: string[];
  query?: string;
  subscribers?: string[];
  projects?: string[];
}

export interface Differential$Revision$Search$Attachments {
  reviewers?: boolean;
  subscribers?: boolean;
  projects?: boolean;
  "reviewers-extra"?: boolean;
}

export interface Differential$Revision$Search$Result {
  id: number;
  type: "DREV";
  phid: string;
  fields: {
    title: string;
    uri: string;
    authorPHID: string;
    status: {
      value: RevisionStatus;
      name: string;
      closed: boolean;
      "color.ansi": string;
    };
    repositoryPHID: string;
    diffPHID: string;
    summary: string;
    testPlan: string;
    isDraft: boolean;
    holdAsDraft: boolean;
    dateCreated: number;
    dateModified: number;
    policy: {
      view: string;
      edit: string;
    };
  };
  attachments: {
    subscribers?: {
      subscriberPHIDs: string[];
      subscriberCount: number;
      viewerIsSubscribed: boolean;
    };
    reviewers?: {
      reviewers: {
        reviewerPHID: string;
        status: string;
        isBlocking: boolean;
        actorPHID: string | null;
      }[];
    };
    projects?: {
      projectPHIDs: string[];
    };
    "reviewers-extra"?: {
      "reviewers-extra": {
        reviewerPHID: string;
        voidedPHID: string | null;
        diffPHID: string | null;
      }[];
    };
  };
}
