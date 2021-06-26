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
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly rootItems: ItemSet;
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
  readonly avatar: Maybe<Scalars['String']>;
  readonly mailSearches: ReadonlyArray<GoogleMailSearch>;
};

export type GoogleMailSearch = {
  readonly __typename?: 'GoogleMailSearch';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
  readonly url: Scalars['String'];
};

export type GoogleMailSearchParams = {
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
};

export type Inbox = {
  readonly __typename?: 'Inbox';
  readonly id: Scalars['ID'];
  readonly items: ItemSet;
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

export type ItemSet = {
  readonly __typename?: 'ItemSet';
  readonly count: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly snoozed: ItemSet;
  readonly archived: ItemSet;
  readonly due: ItemSet;
  readonly isTask: ItemSet;
};


export type ItemSetSnoozedArgs = {
  isSnoozed: Maybe<Scalars['Boolean']>;
};


export type ItemSetArchivedArgs = {
  isArchived: Maybe<Scalars['Boolean']>;
};


export type ItemSetDueArgs = {
  before: Maybe<Scalars['DateTime']>;
  after: Maybe<Scalars['DateTime']>;
};


export type ItemSetIsTaskArgs = {
  done: Maybe<Scalars['Boolean']>;
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
  readonly archiveItem: Maybe<Item>;
  readonly changePassword: Maybe<User>;
  readonly createContext: Context;
  readonly createGoogleMailSearch: GoogleMailSearch;
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly createUser: User;
  readonly deleteContext: Scalars['Boolean'];
  readonly deleteItem: Scalars['Boolean'];
  readonly deleteProject: Scalars['Boolean'];
  readonly deleteSection: Scalars['Boolean'];
  readonly deleteUser: Maybe<Scalars['Boolean']>;
  readonly editContext: Maybe<Context>;
  readonly editItem: Maybe<Item>;
  readonly editProject: Maybe<Project>;
  readonly editSection: Maybe<Section>;
  readonly editTaskController: Maybe<Item>;
  readonly editTaskInfo: Maybe<Item>;
  readonly login: Maybe<User>;
  readonly logout: Maybe<Scalars['Boolean']>;
  readonly markItemDue: Maybe<Item>;
  readonly moveItem: Maybe<Item>;
  readonly moveProject: Maybe<Project>;
  readonly moveSection: Maybe<Section>;
  readonly snoozeItem: Maybe<Item>;
};


export type MutationArchiveItemArgs = {
  id: Scalars['ID'];
  archived: Maybe<Scalars['DateTime']>;
};


export type MutationChangePasswordArgs = {
  id: Maybe<Scalars['ID']>;
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationCreateContextArgs = {
  params: ContextParams;
};


export type MutationCreateGoogleMailSearchArgs = {
  account: Scalars['ID'];
  params: GoogleMailSearchParams;
};


export type MutationCreateLinkArgs = {
  list: Scalars['ID'];
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateNoteArgs = {
  list: Scalars['ID'];
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateProjectArgs = {
  taskList: Scalars['ID'];
  params: ProjectParams;
};


export type MutationCreateSectionArgs = {
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationCreateTaskArgs = {
  list: Scalars['ID'];
  item: ItemParams;
};


export type MutationCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  isAdmin: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationEditTaskControllerArgs = {
  id: Scalars['ID'];
  controller: Maybe<Scalars['String']>;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationMarkItemDueArgs = {
  id: Scalars['ID'];
  due: Maybe<Scalars['DateTime']>;
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  list: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
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
  readonly lists: ReadonlyArray<PluginList>;
};

export type PluginList = {
  readonly __typename?: 'PluginList';
  readonly id: Scalars['ID'];
  readonly pluginId: Scalars['String'];
  readonly name: Scalars['String'];
  readonly url: Maybe<Scalars['String']>;
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type ProjectRoot = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly rootItems: ItemSet;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly googleLoginUrl: Scalars['String'];
  readonly pageContent: Scalars['String'];
  readonly root: Maybe<ProjectRoot>;
  readonly taskList: Maybe<TaskList>;
  readonly user: Maybe<User>;
  readonly users: ReadonlyArray<User>;
};


export type QueryPageContentArgs = {
  path: Scalars['String'];
};


export type QueryRootArgs = {
  id: Scalars['ID'];
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};

export type Section = {
  readonly __typename?: 'Section';
  readonly items: ItemSet;
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
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
};

export type User = ProjectRoot & TaskList & {
  readonly __typename?: 'User';
  readonly allItems: ItemSet;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly googleAccounts: ReadonlyArray<GoogleAccount>;
  readonly id: Scalars['ID'];
  readonly inbox: Inbox;
  readonly isAdmin: Scalars['Boolean'];
  readonly items: ItemSet;
  readonly projectById: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly rootItems: ItemSet;
  readonly sections: ReadonlyArray<Section>;
  readonly subprojects: ReadonlyArray<Project>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ListGoogleAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListGoogleAccountsQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly id: string, readonly googleAccounts: ReadonlyArray<{ readonly __typename: 'GoogleAccount', readonly id: string, readonly email: string, readonly avatar: Maybe<string>, readonly mailSearches: ReadonlyArray<{ readonly __typename: 'GoogleMailSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> }> }> };

export type RequestLoginUrlQueryVariables = Exact<{ [key: string]: never; }>;


export type RequestLoginUrlQuery = { readonly __typename: 'Query', readonly googleLoginUrl: string };

export type CreateGoogleMailSearchMutationVariables = Exact<{
  account: Scalars['ID'];
  params: GoogleMailSearchParams;
}>;


export type CreateGoogleMailSearchMutation = { readonly __typename: 'Mutation', readonly createGoogleMailSearch: { readonly __typename: 'GoogleMailSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string } };


export const ListGoogleAccountsDocument = gql`
    query ListGoogleAccounts {
  user {
    id
    googleAccounts {
      id
      email
      avatar
      mailSearches {
        id
        name
        query
        url
      }
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
export const CreateGoogleMailSearchDocument = gql`
    mutation CreateGoogleMailSearch($account: ID!, $params: GoogleMailSearchParams!) {
  createGoogleMailSearch(account: $account, params: $params) {
    id
    name
    query
    url
  }
}
    `;
export type CreateGoogleMailSearchMutationFn = Apollo.MutationFunction<CreateGoogleMailSearchMutation, CreateGoogleMailSearchMutationVariables>;

/**
 * __useCreateGoogleMailSearchMutation__
 *
 * To run a mutation, you first call `useCreateGoogleMailSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGoogleMailSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGoogleMailSearchMutation, { data, loading, error }] = useCreateGoogleMailSearchMutation({
 *   variables: {
 *      account: // value for 'account'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateGoogleMailSearchMutation(baseOptions?: Apollo.MutationHookOptions<CreateGoogleMailSearchMutation, CreateGoogleMailSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGoogleMailSearchMutation, CreateGoogleMailSearchMutationVariables>(CreateGoogleMailSearchDocument, options);
      }
export type CreateGoogleMailSearchMutationHookResult = ReturnType<typeof useCreateGoogleMailSearchMutation>;
export type CreateGoogleMailSearchMutationResult = Apollo.MutationResult<CreateGoogleMailSearchMutation>;
export type CreateGoogleMailSearchMutationOptions = Apollo.BaseMutationOptions<CreateGoogleMailSearchMutation, CreateGoogleMailSearchMutationVariables>;