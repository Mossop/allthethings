/* eslint-disable */
import * as Types from './types';

import { ClientItemFieldsFragment } from './fragments';
import { gql } from '@apollo/client';
import { ClientItemFieldsFragmentDoc } from './fragments';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ListContextStateQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ListContextStateQuery = { readonly __typename: 'Query', readonly user: Types.Maybe<{ readonly __typename: 'User', readonly id: string, readonly email: string, readonly isAdmin: boolean, readonly inbox: { readonly __typename: 'ItemSet', readonly count: number }, readonly contexts: ReadonlyArray<{ readonly __typename: 'Context', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: { readonly __typename: 'ItemSet', readonly isTask: { readonly __typename: 'ItemSet', readonly count: number } }, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: { readonly __typename: 'ItemSet', readonly isTask: { readonly __typename: 'ItemSet', readonly count: number } }, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }> }> }> }>, readonly problems: ReadonlyArray<{ readonly __typename: 'Problem', readonly description: string, readonly url: string }> };

export type PageContentQueryVariables = Types.Exact<{
  path: Types.Scalars['String'];
}>;


export type PageContentQuery = { readonly __typename: 'Query', readonly pageContent: string };

export type ListUsersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ListUsersQuery = { readonly __typename: 'Query', readonly users: ReadonlyArray<{ readonly __typename: 'User', readonly id: string, readonly email: string, readonly isAdmin: boolean }> };

export type ListInboxQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ListInboxQuery = { readonly __typename: 'Query', readonly user: Types.Maybe<{ readonly __typename: 'User', readonly inbox: { readonly __typename: 'ItemSet', readonly items: ReadonlyArray<(
        { readonly __typename: 'Item' }
        & ClientItemFieldsFragment
      )> } }> };

export type ListTaskListQueryVariables = Types.Exact<{
  taskList: Types.Scalars['ID'];
}>;


export type ListTaskListQuery = { readonly __typename: 'Query', readonly taskList: Types.Maybe<{ readonly __typename: 'Context', readonly items: { readonly __typename: 'ItemSet', readonly items: ReadonlyArray<(
        { readonly __typename: 'Item' }
        & ClientItemFieldsFragment
      )> }, readonly sections: ReadonlyArray<{ readonly __typename: 'Section', readonly id: string, readonly name: string, readonly items: { readonly __typename: 'ItemSet', readonly remaining: { readonly __typename: 'ItemSet', readonly count: number }, readonly items: ReadonlyArray<(
          { readonly __typename: 'Item' }
          & ClientItemFieldsFragment
        )> } }> } | { readonly __typename: 'Project', readonly items: { readonly __typename: 'ItemSet', readonly items: ReadonlyArray<(
        { readonly __typename: 'Item' }
        & ClientItemFieldsFragment
      )> }, readonly sections: ReadonlyArray<{ readonly __typename: 'Section', readonly id: string, readonly name: string, readonly items: { readonly __typename: 'ItemSet', readonly remaining: { readonly __typename: 'ItemSet', readonly count: number }, readonly items: ReadonlyArray<(
          { readonly __typename: 'Item' }
          & ClientItemFieldsFragment
        )> } }> }> };


export const ListContextStateDocument = gql`
    query ListContextState {
  user {
    id
    email
    isAdmin
    inbox {
      count
    }
    contexts {
      id
      stub
      name
      remainingTasks: items {
        isTask(done: false) {
          count
        }
      }
      subprojects {
        id
      }
      projects {
        id
        stub
        name
        remainingTasks: items {
          isTask(done: false) {
            count
          }
        }
        subprojects {
          id
        }
      }
    }
  }
  problems {
    description
    url
  }
}
    `;

/**
 * __useListContextStateQuery__
 *
 * To run a query within a React component, call `useListContextStateQuery` and pass it any options that fit your needs.
 * When your component renders, `useListContextStateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListContextStateQuery({
 *   variables: {
 *   },
 * });
 */
export function useListContextStateQuery(baseOptions?: Apollo.QueryHookOptions<ListContextStateQuery, ListContextStateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListContextStateQuery, ListContextStateQueryVariables>(ListContextStateDocument, options);
      }
export function useListContextStateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListContextStateQuery, ListContextStateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListContextStateQuery, ListContextStateQueryVariables>(ListContextStateDocument, options);
        }
export type ListContextStateQueryHookResult = ReturnType<typeof useListContextStateQuery>;
export type ListContextStateLazyQueryHookResult = ReturnType<typeof useListContextStateLazyQuery>;
export type ListContextStateQueryResult = Apollo.QueryResult<ListContextStateQuery, ListContextStateQueryVariables>;
export function refetchListContextStateQuery(variables?: ListContextStateQueryVariables) {
      return { query: ListContextStateDocument, variables: variables }
    }
export const PageContentDocument = gql`
    query PageContent($path: String!) {
  pageContent(path: $path)
}
    `;

/**
 * __usePageContentQuery__
 *
 * To run a query within a React component, call `usePageContentQuery` and pass it any options that fit your needs.
 * When your component renders, `usePageContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePageContentQuery({
 *   variables: {
 *      path: // value for 'path'
 *   },
 * });
 */
export function usePageContentQuery(baseOptions: Apollo.QueryHookOptions<PageContentQuery, PageContentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PageContentQuery, PageContentQueryVariables>(PageContentDocument, options);
      }
export function usePageContentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PageContentQuery, PageContentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PageContentQuery, PageContentQueryVariables>(PageContentDocument, options);
        }
export type PageContentQueryHookResult = ReturnType<typeof usePageContentQuery>;
export type PageContentLazyQueryHookResult = ReturnType<typeof usePageContentLazyQuery>;
export type PageContentQueryResult = Apollo.QueryResult<PageContentQuery, PageContentQueryVariables>;
export function refetchPageContentQuery(variables?: PageContentQueryVariables) {
      return { query: PageContentDocument, variables: variables }
    }
export const ListUsersDocument = gql`
    query ListUsers {
  users {
    id
    email
    isAdmin
  }
}
    `;

/**
 * __useListUsersQuery__
 *
 * To run a query within a React component, call `useListUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListUsersQuery(baseOptions?: Apollo.QueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
      }
export function useListUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
        }
export type ListUsersQueryHookResult = ReturnType<typeof useListUsersQuery>;
export type ListUsersLazyQueryHookResult = ReturnType<typeof useListUsersLazyQuery>;
export type ListUsersQueryResult = Apollo.QueryResult<ListUsersQuery, ListUsersQueryVariables>;
export function refetchListUsersQuery(variables?: ListUsersQueryVariables) {
      return { query: ListUsersDocument, variables: variables }
    }
export const ListInboxDocument = gql`
    query ListInbox {
  user {
    inbox {
      items {
        ...clientItemFields
      }
    }
  }
}
    ${ClientItemFieldsFragmentDoc}`;

/**
 * __useListInboxQuery__
 *
 * To run a query within a React component, call `useListInboxQuery` and pass it any options that fit your needs.
 * When your component renders, `useListInboxQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListInboxQuery({
 *   variables: {
 *   },
 * });
 */
export function useListInboxQuery(baseOptions?: Apollo.QueryHookOptions<ListInboxQuery, ListInboxQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListInboxQuery, ListInboxQueryVariables>(ListInboxDocument, options);
      }
export function useListInboxLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListInboxQuery, ListInboxQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListInboxQuery, ListInboxQueryVariables>(ListInboxDocument, options);
        }
export type ListInboxQueryHookResult = ReturnType<typeof useListInboxQuery>;
export type ListInboxLazyQueryHookResult = ReturnType<typeof useListInboxLazyQuery>;
export type ListInboxQueryResult = Apollo.QueryResult<ListInboxQuery, ListInboxQueryVariables>;
export function refetchListInboxQuery(variables?: ListInboxQueryVariables) {
      return { query: ListInboxDocument, variables: variables }
    }
export const ListTaskListDocument = gql`
    query ListTaskList($taskList: ID!) {
  taskList(id: $taskList) {
    items {
      items {
        ...clientItemFields
      }
    }
    sections {
      id
      name
      items {
        remaining: isTask(done: false) {
          count
        }
        items {
          ...clientItemFields
        }
      }
    }
  }
}
    ${ClientItemFieldsFragmentDoc}`;

/**
 * __useListTaskListQuery__
 *
 * To run a query within a React component, call `useListTaskListQuery` and pass it any options that fit your needs.
 * When your component renders, `useListTaskListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListTaskListQuery({
 *   variables: {
 *      taskList: // value for 'taskList'
 *   },
 * });
 */
export function useListTaskListQuery(baseOptions: Apollo.QueryHookOptions<ListTaskListQuery, ListTaskListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListTaskListQuery, ListTaskListQueryVariables>(ListTaskListDocument, options);
      }
export function useListTaskListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListTaskListQuery, ListTaskListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListTaskListQuery, ListTaskListQueryVariables>(ListTaskListDocument, options);
        }
export type ListTaskListQueryHookResult = ReturnType<typeof useListTaskListQuery>;
export type ListTaskListLazyQueryHookResult = ReturnType<typeof useListTaskListLazyQuery>;
export type ListTaskListQueryResult = Apollo.QueryResult<ListTaskListQuery, ListTaskListQueryVariables>;
export function refetchListTaskListQuery(variables?: ListTaskListQueryVariables) {
      return { query: ListTaskListDocument, variables: variables }
    }