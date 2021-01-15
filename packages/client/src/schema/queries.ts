/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type CurrentUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = (
  { __typename?: 'Query' }
  & { user?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'id' | 'email'>
  )> }
);

export type NamedContextsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NamedContextsQuery = (
  { __typename?: 'Query' }
  & { user?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'id' | 'email'>
    & { namedContexts: Array<(
      { __typename?: 'NamedContext' }
      & Pick<Types.NamedContext, 'id' | 'name'>
    )> }
  )> }
);


export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    id
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
export const NamedContextsDocument = gql`
    query NamedContexts {
  user {
    id
    email
    namedContexts {
      id
      name
    }
  }
}
    `;

/**
 * __useNamedContextsQuery__
 *
 * To run a query within a React component, call `useNamedContextsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNamedContextsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNamedContextsQuery({
 *   variables: {
 *   },
 * });
 */
export function useNamedContextsQuery(baseOptions?: Apollo.QueryHookOptions<NamedContextsQuery, NamedContextsQueryVariables>) {
        return Apollo.useQuery<NamedContextsQuery, NamedContextsQueryVariables>(NamedContextsDocument, baseOptions);
      }
export function useNamedContextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NamedContextsQuery, NamedContextsQueryVariables>) {
          return Apollo.useLazyQuery<NamedContextsQuery, NamedContextsQueryVariables>(NamedContextsDocument, baseOptions);
        }
export type NamedContextsQueryHookResult = ReturnType<typeof useNamedContextsQuery>;
export type NamedContextsLazyQueryHookResult = ReturnType<typeof useNamedContextsLazyQuery>;
export type NamedContextsQueryResult = Apollo.QueryResult<NamedContextsQuery, NamedContextsQueryVariables>;
export function refetchNamedContextsQuery(variables?: NamedContextsQueryVariables) {
      return { query: NamedContextsDocument, variables: variables }
    }