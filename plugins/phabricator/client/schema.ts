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
  TaskController: any;
};

export type Context = TaskList & {
  readonly __typename?: 'Context';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly rootItems: ItemSet;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ContextParams = {
  readonly name: Scalars['String'];
};

export type CreatePhabricatorAccountParams = {
  readonly url: Scalars['String'];
  readonly apiKey: Scalars['String'];
  readonly queries: ReadonlyArray<Scalars['ID']>;
};


export type FileDetail = {
  readonly __typename?: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
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
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createPhabricatorAccount: PhabricatorAccount;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly createUser: User;
  readonly deleteContext: Scalars['Boolean'];
  readonly deleteItem: Scalars['Boolean'];
  readonly deletePhabricatorAccount: Maybe<Scalars['Boolean']>;
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
  readonly updatePhabricatorAccount: Maybe<PhabricatorAccount>;
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
  user: Maybe<Scalars['ID']>;
  params: ContextParams;
};


export type MutationCreateLinkArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateNoteArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreatePhabricatorAccountArgs = {
  params: CreatePhabricatorAccountParams;
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
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
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


export type MutationDeletePhabricatorAccountArgs = {
  account: Scalars['ID'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUserArgs = {
  id: Maybe<Scalars['ID']>;
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
  controller: Maybe<Scalars['TaskController']>;
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
  section: Maybe<Scalars['ID']>;
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


export type MutationUpdatePhabricatorAccountArgs = {
  id: Scalars['ID'];
  params: UpdatePhabricatorAccountParams;
};

export type NoteDetail = {
  readonly __typename?: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type PhabricatorAccount = {
  readonly __typename?: 'PhabricatorAccount';
  readonly id: Scalars['ID'];
  readonly icon: Scalars['String'];
  readonly url: Scalars['String'];
  readonly email: Scalars['String'];
  readonly apiKey: Scalars['String'];
  readonly enabledQueries: ReadonlyArray<Scalars['ID']>;
};

export type PhabricatorQuery = {
  readonly __typename?: 'PhabricatorQuery';
  readonly queryId: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly description: Scalars['String'];
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

export type Problem = {
  readonly __typename?: 'Problem';
  readonly description: Scalars['String'];
  readonly url: Scalars['String'];
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

export type Query = {
  readonly __typename?: 'Query';
  readonly user: Maybe<User>;
  readonly problems: ReadonlyArray<Problem>;
  readonly users: ReadonlyArray<User>;
  readonly taskList: Maybe<TaskList>;
  readonly pageContent: Scalars['String'];
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};


export type QueryPageContentArgs = {
  path: Scalars['String'];
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
  readonly controller: Scalars['TaskController'];
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

export type UpdatePhabricatorAccountParams = {
  readonly url: Maybe<Scalars['String']>;
  readonly apiKey: Maybe<Scalars['String']>;
  readonly queries: Maybe<ReadonlyArray<Scalars['ID']>>;
};

export type User = {
  readonly __typename?: 'User';
  readonly allItems: ItemSet;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly inbox: ItemSet;
  readonly isAdmin: Scalars['Boolean'];
  readonly phabricatorAccounts: ReadonlyArray<PhabricatorAccount>;
  readonly phabricatorQueries: ReadonlyArray<PhabricatorQuery>;
};

export type ListPhabricatorAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPhabricatorAccountsQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly id: string, readonly phabricatorAccounts: ReadonlyArray<{ readonly __typename: 'PhabricatorAccount', readonly id: string, readonly email: string, readonly icon: string, readonly url: string, readonly apiKey: string, readonly enabledQueries: ReadonlyArray<string> }> }> };

export type ListPhabricatorQueriesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPhabricatorQueriesQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly id: string, readonly phabricatorQueries: ReadonlyArray<{ readonly __typename: 'PhabricatorQuery', readonly queryId: string, readonly name: string, readonly description: string }> }> };

export type CreatePhabricatorAccountMutationVariables = Exact<{
  params: CreatePhabricatorAccountParams;
}>;


export type CreatePhabricatorAccountMutation = { readonly __typename: 'Mutation', readonly createPhabricatorAccount: { readonly __typename: 'PhabricatorAccount', readonly id: string, readonly email: string, readonly icon: string, readonly url: string, readonly apiKey: string, readonly enabledQueries: ReadonlyArray<string> } };

export type UpdatePhabricatorAccountMutationVariables = Exact<{
  id: Scalars['ID'];
  params: UpdatePhabricatorAccountParams;
}>;


export type UpdatePhabricatorAccountMutation = { readonly __typename: 'Mutation', readonly updatePhabricatorAccount: Maybe<{ readonly __typename: 'PhabricatorAccount', readonly id: string, readonly email: string, readonly icon: string, readonly url: string, readonly apiKey: string, readonly enabledQueries: ReadonlyArray<string> }> };

export type DeletePhabricatorAccountMutationVariables = Exact<{
  account: Scalars['ID'];
}>;


export type DeletePhabricatorAccountMutation = { readonly __typename: 'Mutation', readonly deletePhabricatorAccount: Maybe<boolean> };


export const ListPhabricatorAccountsDocument = gql`
    query ListPhabricatorAccounts {
  user {
    id
    phabricatorAccounts {
      id
      email
      icon
      url
      apiKey
      enabledQueries
    }
  }
}
    `;

/**
 * __useListPhabricatorAccountsQuery__
 *
 * To run a query within a React component, call `useListPhabricatorAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPhabricatorAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPhabricatorAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPhabricatorAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListPhabricatorAccountsQuery, ListPhabricatorAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListPhabricatorAccountsQuery, ListPhabricatorAccountsQueryVariables>(ListPhabricatorAccountsDocument, options);
      }
export function useListPhabricatorAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPhabricatorAccountsQuery, ListPhabricatorAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListPhabricatorAccountsQuery, ListPhabricatorAccountsQueryVariables>(ListPhabricatorAccountsDocument, options);
        }
export type ListPhabricatorAccountsQueryHookResult = ReturnType<typeof useListPhabricatorAccountsQuery>;
export type ListPhabricatorAccountsLazyQueryHookResult = ReturnType<typeof useListPhabricatorAccountsLazyQuery>;
export type ListPhabricatorAccountsQueryResult = Apollo.QueryResult<ListPhabricatorAccountsQuery, ListPhabricatorAccountsQueryVariables>;
export function refetchListPhabricatorAccountsQuery(variables?: ListPhabricatorAccountsQueryVariables) {
      return { query: ListPhabricatorAccountsDocument, variables: variables }
    }
export const ListPhabricatorQueriesDocument = gql`
    query ListPhabricatorQueries {
  user {
    id
    phabricatorQueries {
      queryId
      name
      description
    }
  }
}
    `;

/**
 * __useListPhabricatorQueriesQuery__
 *
 * To run a query within a React component, call `useListPhabricatorQueriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPhabricatorQueriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPhabricatorQueriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPhabricatorQueriesQuery(baseOptions?: Apollo.QueryHookOptions<ListPhabricatorQueriesQuery, ListPhabricatorQueriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListPhabricatorQueriesQuery, ListPhabricatorQueriesQueryVariables>(ListPhabricatorQueriesDocument, options);
      }
export function useListPhabricatorQueriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPhabricatorQueriesQuery, ListPhabricatorQueriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListPhabricatorQueriesQuery, ListPhabricatorQueriesQueryVariables>(ListPhabricatorQueriesDocument, options);
        }
export type ListPhabricatorQueriesQueryHookResult = ReturnType<typeof useListPhabricatorQueriesQuery>;
export type ListPhabricatorQueriesLazyQueryHookResult = ReturnType<typeof useListPhabricatorQueriesLazyQuery>;
export type ListPhabricatorQueriesQueryResult = Apollo.QueryResult<ListPhabricatorQueriesQuery, ListPhabricatorQueriesQueryVariables>;
export function refetchListPhabricatorQueriesQuery(variables?: ListPhabricatorQueriesQueryVariables) {
      return { query: ListPhabricatorQueriesDocument, variables: variables }
    }
export const CreatePhabricatorAccountDocument = gql`
    mutation CreatePhabricatorAccount($params: CreatePhabricatorAccountParams!) {
  createPhabricatorAccount(params: $params) {
    id
    email
    icon
    url
    apiKey
    enabledQueries
  }
}
    `;
export type CreatePhabricatorAccountMutationFn = Apollo.MutationFunction<CreatePhabricatorAccountMutation, CreatePhabricatorAccountMutationVariables>;

/**
 * __useCreatePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useCreatePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPhabricatorAccountMutation, { data, loading, error }] = useCreatePhabricatorAccountMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreatePhabricatorAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreatePhabricatorAccountMutation, CreatePhabricatorAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePhabricatorAccountMutation, CreatePhabricatorAccountMutationVariables>(CreatePhabricatorAccountDocument, options);
      }
export type CreatePhabricatorAccountMutationHookResult = ReturnType<typeof useCreatePhabricatorAccountMutation>;
export type CreatePhabricatorAccountMutationResult = Apollo.MutationResult<CreatePhabricatorAccountMutation>;
export type CreatePhabricatorAccountMutationOptions = Apollo.BaseMutationOptions<CreatePhabricatorAccountMutation, CreatePhabricatorAccountMutationVariables>;
export const UpdatePhabricatorAccountDocument = gql`
    mutation UpdatePhabricatorAccount($id: ID!, $params: UpdatePhabricatorAccountParams!) {
  updatePhabricatorAccount(id: $id, params: $params) {
    id
    email
    icon
    url
    apiKey
    enabledQueries
  }
}
    `;
export type UpdatePhabricatorAccountMutationFn = Apollo.MutationFunction<UpdatePhabricatorAccountMutation, UpdatePhabricatorAccountMutationVariables>;

/**
 * __useUpdatePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useUpdatePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePhabricatorAccountMutation, { data, loading, error }] = useUpdatePhabricatorAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useUpdatePhabricatorAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePhabricatorAccountMutation, UpdatePhabricatorAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePhabricatorAccountMutation, UpdatePhabricatorAccountMutationVariables>(UpdatePhabricatorAccountDocument, options);
      }
export type UpdatePhabricatorAccountMutationHookResult = ReturnType<typeof useUpdatePhabricatorAccountMutation>;
export type UpdatePhabricatorAccountMutationResult = Apollo.MutationResult<UpdatePhabricatorAccountMutation>;
export type UpdatePhabricatorAccountMutationOptions = Apollo.BaseMutationOptions<UpdatePhabricatorAccountMutation, UpdatePhabricatorAccountMutationVariables>;
export const DeletePhabricatorAccountDocument = gql`
    mutation DeletePhabricatorAccount($account: ID!) {
  deletePhabricatorAccount(account: $account)
}
    `;
export type DeletePhabricatorAccountMutationFn = Apollo.MutationFunction<DeletePhabricatorAccountMutation, DeletePhabricatorAccountMutationVariables>;

/**
 * __useDeletePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useDeletePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePhabricatorAccountMutation, { data, loading, error }] = useDeletePhabricatorAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useDeletePhabricatorAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeletePhabricatorAccountMutation, DeletePhabricatorAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePhabricatorAccountMutation, DeletePhabricatorAccountMutationVariables>(DeletePhabricatorAccountDocument, options);
      }
export type DeletePhabricatorAccountMutationHookResult = ReturnType<typeof useDeletePhabricatorAccountMutation>;
export type DeletePhabricatorAccountMutationResult = Apollo.MutationResult<DeletePhabricatorAccountMutation>;
export type DeletePhabricatorAccountMutationOptions = Apollo.BaseMutationOptions<DeletePhabricatorAccountMutation, DeletePhabricatorAccountMutationVariables>;