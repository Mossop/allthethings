/* eslint-disable */
import * as Schema from '#schema';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ListGithubAccountsQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type ListGithubAccountsQuery = { readonly __typename: 'Query', readonly user: Schema.Maybe<{ readonly __typename: 'User', readonly id: string, readonly githubAccounts: ReadonlyArray<{ readonly __typename: 'GithubAccount', readonly id: string, readonly user: string, readonly avatar: string, readonly loginUrl: string }> }> };

export type RequestLoginUrlQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type RequestLoginUrlQuery = { readonly __typename: 'Query', readonly githubLoginUrl: string };

export const OperationNames = {
  Query: {
    ListGithubAccounts: 'ListGithubAccounts',
    RequestLoginUrl: 'RequestLoginUrl'
  }
}

export const ListGithubAccountsDocument = gql`
    query ListGithubAccounts {
  user {
    id
    githubAccounts {
      id
      user
      avatar
      loginUrl
    }
  }
}
    `;

/**
 * __useListGithubAccountsQuery__
 *
 * To run a query within a React component, call `useListGithubAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListGithubAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListGithubAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListGithubAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListGithubAccountsQuery, ListGithubAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListGithubAccountsQuery, ListGithubAccountsQueryVariables>(ListGithubAccountsDocument, options);
      }
export function useListGithubAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListGithubAccountsQuery, ListGithubAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListGithubAccountsQuery, ListGithubAccountsQueryVariables>(ListGithubAccountsDocument, options);
        }
export type ListGithubAccountsQueryHookResult = ReturnType<typeof useListGithubAccountsQuery>;
export type ListGithubAccountsLazyQueryHookResult = ReturnType<typeof useListGithubAccountsLazyQuery>;
export type ListGithubAccountsQueryResult = Apollo.QueryResult<ListGithubAccountsQuery, ListGithubAccountsQueryVariables>;
export function refetchListGithubAccountsQuery(variables?: ListGithubAccountsQueryVariables) {
      return { query: ListGithubAccountsDocument, variables: variables }
    }
export const RequestLoginUrlDocument = gql`
    query RequestLoginUrl {
  githubLoginUrl
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