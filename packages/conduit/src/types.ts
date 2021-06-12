/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GenericAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (params?: Record<string, unknown>): Promise<any>;
  [K: string]: GenericAPI;
}

export type ApiMethod<R, A extends unknown[] = []> = (...args: A) => Promise<R>;

export interface Conduit {
  user: User;
  differential: Differential;

  [K: string]: GenericAPI;
}

export type User = GenericAPI & {
  whoami: ApiMethod<User$Result>;
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
  search: ApiMethod<Differential$Revision$Search$Result[], [Differential$Revision$Search$Params]>;
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

interface Differential$Revision$Search$Constraints {
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

interface Differential$Revision$Search$Attachments {
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
      value: string;
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
