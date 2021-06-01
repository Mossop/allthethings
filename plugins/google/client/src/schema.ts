/* eslint-disable */
import type { DateTime } from 'luxon';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
};

export type Context = ProjectRoot & TaskList & {
  readonly __typename?: 'Context';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ContextParams = {
  readonly name: Scalars['String'];
};


export type FileDetail = {
  readonly __typename?: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type GoogleAccount = {
  readonly __typename?: 'GoogleAccount';
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
};

export type Inbox = {
  readonly __typename?: 'Inbox';
  readonly id: Scalars['ID'];
  readonly items: ReadonlyArray<Item>;
};

export type Item = {
  readonly __typename?: 'Item';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly created: Scalars['DateTime'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
  readonly taskInfo: Maybe<TaskInfo>;
  readonly detail: Maybe<ItemDetail>;
};

export type ItemDetail = PluginDetail | LinkDetail | NoteDetail | FileDetail;

export type ItemParams = {
  readonly summary: Scalars['String'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
};

export type LinkDetail = {
  readonly __typename?: 'LinkDetail';
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
};

export type LinkDetailParams = {
  readonly url: Scalars['String'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly login: Maybe<User>;
  readonly logout: Maybe<Scalars['Boolean']>;
  readonly createContext: Context;
  readonly editContext: Maybe<Context>;
  readonly deleteContext: Scalars['Boolean'];
  readonly createProject: Project;
  readonly moveProject: Maybe<Project>;
  readonly editProject: Maybe<Project>;
  readonly deleteProject: Scalars['Boolean'];
  readonly createSection: Section;
  readonly moveSection: Maybe<Section>;
  readonly editSection: Maybe<Section>;
  readonly deleteSection: Scalars['Boolean'];
  readonly createTask: Item;
  readonly createNote: Item;
  readonly createLink: Item;
  readonly editItem: Maybe<Item>;
  readonly editTaskInfo: Maybe<Item>;
  readonly editTaskController: Maybe<Item>;
  readonly moveItem: Maybe<Item>;
  readonly deleteItem: Scalars['Boolean'];
  readonly archiveItem: Maybe<Item>;
  readonly snoozeItem: Maybe<Item>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  params: ContextParams;
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationCreateProjectArgs = {
  taskList: Maybe<Scalars['ID']>;
  params: ProjectParams;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList: Maybe<Scalars['ID']>;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateSectionArgs = {
  taskList: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationCreateTaskArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
};


export type MutationCreateNoteArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateLinkArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationEditTaskControllerArgs = {
  id: Scalars['ID'];
  controller: Maybe<Scalars['String']>;
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  parent: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationArchiveItemArgs = {
  id: Scalars['ID'];
  archived: Maybe<Scalars['DateTime']>;
};


export type MutationSnoozeItemArgs = {
  id: Scalars['ID'];
  snoozed: Maybe<Scalars['DateTime']>;
};

export type NoteDetail = {
  readonly __typename?: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type PluginDetail = {
  readonly __typename?: 'PluginDetail';
  readonly pluginId: Scalars['String'];
  readonly hasTaskState: Scalars['Boolean'];
  readonly wasEverListed: Scalars['Boolean'];
  readonly isCurrentlyListed: Scalars['Boolean'];
  readonly fields: Scalars['String'];
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type ProjectRoot = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly googleLoginUrl: Scalars['String'];
  readonly root: Maybe<ProjectRoot>;
  readonly taskList: Maybe<TaskList>;
  readonly user: Maybe<User>;
};


export type QueryRootArgs = {
  id: Scalars['ID'];
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};

export type Section = {
  readonly __typename?: 'Section';
  readonly remainingTasks: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type SectionParams = {
  readonly name: Scalars['String'];
};

export type TaskInfo = {
  readonly __typename?: 'TaskInfo';
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
  readonly controller: Scalars['String'];
};

export type TaskInfoParams = {
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
};

export type TaskList = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
};

export type User = ProjectRoot & TaskList & {
  readonly __typename?: 'User';
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly googleAccounts: ReadonlyArray<GoogleAccount>;
  readonly id: Scalars['ID'];
  readonly inbox: Inbox;
  readonly items: ReadonlyArray<Item>;
  readonly projectById: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly remainingTasks: Scalars['Int'];
  readonly sections: ReadonlyArray<Section>;
  readonly subprojects: ReadonlyArray<Project>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ListGoogleAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListGoogleAccountsQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly googleAccounts: ReadonlyArray<{ readonly __typename: 'GoogleAccount', readonly id: string, readonly email: string }> }> };

export type RequestLoginUrlQueryVariables = Exact<{ [key: string]: never; }>;


export type RequestLoginUrlQuery = { readonly __typename: 'Query', readonly googleLoginUrl: string };


export const ListGoogleAccountsDocument = gql`
    query ListGoogleAccounts {
  user {
    googleAccounts {
      id
      email
    }
  }
}
    `;

/**
 * __useListGoogleAccountsQuery__
 *
 * To run a query within a React component, call `useListGoogleAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListGoogleAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListGoogleAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListGoogleAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListGoogleAccountsQuery, ListGoogleAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListGoogleAccountsQuery, ListGoogleAccountsQueryVariables>(ListGoogleAccountsDocument, options);
      }
export function useListGoogleAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListGoogleAccountsQuery, ListGoogleAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListGoogleAccountsQuery, ListGoogleAccountsQueryVariables>(ListGoogleAccountsDocument, options);
        }
export type ListGoogleAccountsQueryHookResult = ReturnType<typeof useListGoogleAccountsQuery>;
export type ListGoogleAccountsLazyQueryHookResult = ReturnType<typeof useListGoogleAccountsLazyQuery>;
export type ListGoogleAccountsQueryResult = Apollo.QueryResult<ListGoogleAccountsQuery, ListGoogleAccountsQueryVariables>;
export function refetchListGoogleAccountsQuery(variables?: ListGoogleAccountsQueryVariables) {
      return { query: ListGoogleAccountsDocument, variables: variables }
    }
export const RequestLoginUrlDocument = gql`
    query RequestLoginUrl {
  googleLoginUrl
}
    `;

/**
 * __useRequestLoginUrlQuery__
 *
 * To run a query within a React component, call `useRequestLoginUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useRequestLoginUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRequestLoginUrlQuery({
 *   variables: {
 *   },
 * });
 */
export function useRequestLoginUrlQuery(baseOptions?: Apollo.QueryHookOptions<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>(RequestLoginUrlDocument, options);
      }
export function useRequestLoginUrlLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>(RequestLoginUrlDocument, options);
        }
export type RequestLoginUrlQueryHookResult = ReturnType<typeof useRequestLoginUrlQuery>;
export type RequestLoginUrlLazyQueryHookResult = ReturnType<typeof useRequestLoginUrlLazyQuery>;
export type RequestLoginUrlQueryResult = Apollo.QueryResult<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>;
export function refetchRequestLoginUrlQuery(variables?: RequestLoginUrlQueryVariables) {
      return { query: RequestLoginUrlDocument, variables: variables }
    }