/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type CurrentUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = (
  { __typename?: 'Query' }
  & { user?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'email'>
  )> }
);

export type ContextsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ContextsQuery = (
  { __typename?: 'Query' }
  & { user?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'email'>
    & { contexts: Array<(
      { __typename?: 'Context' }
      & Pick<Types.Context, 'id' | 'name'>
    )> }
  )> }
);


export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    email
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, baseOptions);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, baseOptions);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export function refetchCurrentUserQuery(variables?: CurrentUserQueryVariables) {
      return { query: CurrentUserDocument, variables: variables }
    }
export const ContextsDocument = gql`
    query Contexts {
  user {
    email
    contexts {
      id
      name
    }
  }
}
    `;

/**
 * __useContextsQuery__
 *
 * To run a query within a React component, call `useContextsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContextsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContextsQuery({
 *   variables: {
 *   },
 * });
 */
export function useContextsQuery(baseOptions?: Apollo.QueryHookOptions<ContextsQuery, ContextsQueryVariables>) {
        return Apollo.useQuery<ContextsQuery, ContextsQueryVariables>(ContextsDocument, baseOptions);
      }
export function useContextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContextsQuery, ContextsQueryVariables>) {
          return Apollo.useLazyQuery<ContextsQuery, ContextsQueryVariables>(ContextsDocument, baseOptions);
        }
export type ContextsQueryHookResult = ReturnType<typeof useContextsQuery>;
export type ContextsLazyQueryHookResult = ReturnType<typeof useContextsLazyQuery>;
export type ContextsQueryResult = Apollo.QueryResult<ContextsQuery, ContextsQueryVariables>;
export function refetchContextsQuery(variables?: ContextsQueryVariables) {
      return { query: ContextsDocument, variables: variables }
    }