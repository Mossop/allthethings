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

export type JiraAccount = {
  readonly __typename?: 'JiraAccount';
  readonly id: Scalars['ID'];
  readonly serverName: Scalars['String'];
  readonly userName: Scalars['String'];
  readonly url: Scalars['String'];
  readonly email: Scalars['String'];
  readonly apiToken: Scalars['String'];
  readonly searches: ReadonlyArray<JiraSearch>;
};

export type JiraAccountParams = {
  readonly url: Scalars['String'];
  readonly email: Scalars['String'];
  readonly apiToken: Scalars['String'];
};

export type JiraSearch = {
  readonly __typename?: 'JiraSearch';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
  readonly url: Scalars['String'];
};

export type JiraSearchParams = {
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
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
  readonly createJiraAccount: JiraAccount;
  readonly createJiraSearch: JiraSearch;
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly createUser: User;
  readonly deleteContext: Scalars['Boolean'];
  readonly deleteItem: Scalars['Boolean'];
  readonly deleteJiraAccount: Maybe<Scalars['Boolean']>;
  readonly deleteJiraSearch: Maybe<Scalars['Boolean']>;
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
  user: Maybe<Scalars['ID']>;
  params: ContextParams;
};


export type MutationCreateJiraAccountArgs = {
  params: JiraAccountParams;
};


export type MutationCreateJiraSearchArgs = {
  account: Scalars['ID'];
  params: JiraSearchParams;
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


export type MutationDeleteJiraAccountArgs = {
  account: Scalars['ID'];
};


export type MutationDeleteJiraSearchArgs = {
  search: Scalars['ID'];
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

export type User = {
  readonly __typename?: 'User';
  readonly allItems: ItemSet;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly inbox: ItemSet;
  readonly isAdmin: Scalars['Boolean'];
  readonly jiraAccounts: ReadonlyArray<JiraAccount>;
};

export type ListJiraAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListJiraAccountsQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly id: string, readonly jiraAccounts: ReadonlyArray<{ readonly __typename: 'JiraAccount', readonly id: string, readonly serverName: string, readonly userName: string, readonly url: string, readonly email: string, readonly apiToken: string, readonly searches: ReadonlyArray<{ readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> }> }> };

export type CreateJiraAccountMutationVariables = Exact<{
  params: JiraAccountParams;
}>;


export type CreateJiraAccountMutation = { readonly __typename: 'Mutation', readonly createJiraAccount: { readonly __typename: 'JiraAccount', readonly id: string, readonly serverName: string, readonly userName: string, readonly url: string, readonly email: string, readonly apiToken: string, readonly searches: ReadonlyArray<{ readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> } };

export type DeleteJiraAccountMutationVariables = Exact<{
  account: Scalars['ID'];
}>;


export type DeleteJiraAccountMutation = { readonly __typename: 'Mutation', readonly deleteJiraAccount: Maybe<boolean> };

export type CreateJiraSearchMutationVariables = Exact<{
  account: Scalars['ID'];
  params: JiraSearchParams;
}>;


export type CreateJiraSearchMutation = { readonly __typename: 'Mutation', readonly createJiraSearch: { readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string } };

export type DeleteJiraSearchMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteJiraSearchMutation = { readonly __typename: 'Mutation', readonly deleteJiraSearch: Maybe<boolean> };


export const ListJiraAccountsDocument = gql`
    query ListJiraAccounts {
  user {
    id
    jiraAccounts {
      id
      serverName
      userName
      url
      email
      apiToken
      searches {
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
 * __useListJiraAccountsQuery__
 *
 * To run a query within a React component, call `useListJiraAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListJiraAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListJiraAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListJiraAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListJiraAccountsQuery, ListJiraAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListJiraAccountsQuery, ListJiraAccountsQueryVariables>(ListJiraAccountsDocument, options);
      }
export function useListJiraAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListJiraAccountsQuery, ListJiraAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListJiraAccountsQuery, ListJiraAccountsQueryVariables>(ListJiraAccountsDocument, options);
        }
export type ListJiraAccountsQueryHookResult = ReturnType<typeof useListJiraAccountsQuery>;
export type ListJiraAccountsLazyQueryHookResult = ReturnType<typeof useListJiraAccountsLazyQuery>;
export type ListJiraAccountsQueryResult = Apollo.QueryResult<ListJiraAccountsQuery, ListJiraAccountsQueryVariables>;
export function refetchListJiraAccountsQuery(variables?: ListJiraAccountsQueryVariables) {
      return { query: ListJiraAccountsDocument, variables: variables }
    }
export const CreateJiraAccountDocument = gql`
    mutation CreateJiraAccount($params: JiraAccountParams!) {
  createJiraAccount(params: $params) {
    id
    serverName
    userName
    url
    email
    apiToken
    searches {
      id
      name
      query
      url
    }
  }
}
    `;
export type CreateJiraAccountMutationFn = Apollo.MutationFunction<CreateJiraAccountMutation, CreateJiraAccountMutationVariables>;

/**
 * __useCreateJiraAccountMutation__
 *
 * To run a mutation, you first call `useCreateJiraAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJiraAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJiraAccountMutation, { data, loading, error }] = useCreateJiraAccountMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateJiraAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateJiraAccountMutation, CreateJiraAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateJiraAccountMutation, CreateJiraAccountMutationVariables>(CreateJiraAccountDocument, options);
      }
export type CreateJiraAccountMutationHookResult = ReturnType<typeof useCreateJiraAccountMutation>;
export type CreateJiraAccountMutationResult = Apollo.MutationResult<CreateJiraAccountMutation>;
export type CreateJiraAccountMutationOptions = Apollo.BaseMutationOptions<CreateJiraAccountMutation, CreateJiraAccountMutationVariables>;
export const DeleteJiraAccountDocument = gql`
    mutation DeleteJiraAccount($account: ID!) {
  deleteJiraAccount(account: $account)
}
    `;
export type DeleteJiraAccountMutationFn = Apollo.MutationFunction<DeleteJiraAccountMutation, DeleteJiraAccountMutationVariables>;

/**
 * __useDeleteJiraAccountMutation__
 *
 * To run a mutation, you first call `useDeleteJiraAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJiraAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJiraAccountMutation, { data, loading, error }] = useDeleteJiraAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useDeleteJiraAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteJiraAccountMutation, DeleteJiraAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteJiraAccountMutation, DeleteJiraAccountMutationVariables>(DeleteJiraAccountDocument, options);
      }
export type DeleteJiraAccountMutationHookResult = ReturnType<typeof useDeleteJiraAccountMutation>;
export type DeleteJiraAccountMutationResult = Apollo.MutationResult<DeleteJiraAccountMutation>;
export type DeleteJiraAccountMutationOptions = Apollo.BaseMutationOptions<DeleteJiraAccountMutation, DeleteJiraAccountMutationVariables>;
export const CreateJiraSearchDocument = gql`
    mutation CreateJiraSearch($account: ID!, $params: JiraSearchParams!) {
  createJiraSearch(account: $account, params: $params) {
    id
    name
    query
    url
  }
}
    `;
export type CreateJiraSearchMutationFn = Apollo.MutationFunction<CreateJiraSearchMutation, CreateJiraSearchMutationVariables>;

/**
 * __useCreateJiraSearchMutation__
 *
 * To run a mutation, you first call `useCreateJiraSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJiraSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJiraSearchMutation, { data, loading, error }] = useCreateJiraSearchMutation({
 *   variables: {
 *      account: // value for 'account'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateJiraSearchMutation(baseOptions?: Apollo.MutationHookOptions<CreateJiraSearchMutation, CreateJiraSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateJiraSearchMutation, CreateJiraSearchMutationVariables>(CreateJiraSearchDocument, options);
      }
export type CreateJiraSearchMutationHookResult = ReturnType<typeof useCreateJiraSearchMutation>;
export type CreateJiraSearchMutationResult = Apollo.MutationResult<CreateJiraSearchMutation>;
export type CreateJiraSearchMutationOptions = Apollo.BaseMutationOptions<CreateJiraSearchMutation, CreateJiraSearchMutationVariables>;
export const DeleteJiraSearchDocument = gql`
    mutation DeleteJiraSearch($id: ID!) {
  deleteJiraSearch(search: $id)
}
    `;
export type DeleteJiraSearchMutationFn = Apollo.MutationFunction<DeleteJiraSearchMutation, DeleteJiraSearchMutationVariables>;

/**
 * __useDeleteJiraSearchMutation__
 *
 * To run a mutation, you first call `useDeleteJiraSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJiraSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJiraSearchMutation, { data, loading, error }] = useDeleteJiraSearchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJiraSearchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteJiraSearchMutation, DeleteJiraSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteJiraSearchMutation, DeleteJiraSearchMutationVariables>(DeleteJiraSearchDocument, options);
      }
export type DeleteJiraSearchMutationHookResult = ReturnType<typeof useDeleteJiraSearchMutation>;
export type DeleteJiraSearchMutationResult = Apollo.MutationResult<DeleteJiraSearchMutation>;
export type DeleteJiraSearchMutationOptions = Apollo.BaseMutationOptions<DeleteJiraSearchMutation, DeleteJiraSearchMutationVariables>;