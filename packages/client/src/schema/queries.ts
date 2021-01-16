/* eslint-disable */
import * as Types from './types';

import * as Operations from './operations';
import * as Apollo from '@apollo/client';


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
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<Operations.CurrentUserQuery, Operations.CurrentUserQueryVariables>) {
        return Apollo.useQuery<Operations.CurrentUserQuery, Operations.CurrentUserQueryVariables>(Operations.CurrentUser, baseOptions);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operations.CurrentUserQuery, Operations.CurrentUserQueryVariables>) {
          return Apollo.useLazyQuery<Operations.CurrentUserQuery, Operations.CurrentUserQueryVariables>(Operations.CurrentUser, baseOptions);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<Operations.CurrentUserQuery, Operations.CurrentUserQueryVariables>;
export function refetchCurrentUserQuery(variables?: Operations.CurrentUserQueryVariables) {
      return { query: Operations.CurrentUser, variables: variables }
    }

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
export function useNamedContextsQuery(baseOptions?: Apollo.QueryHookOptions<Operations.NamedContextsQuery, Operations.NamedContextsQueryVariables>) {
        return Apollo.useQuery<Operations.NamedContextsQuery, Operations.NamedContextsQueryVariables>(Operations.NamedContexts, baseOptions);
      }
export function useNamedContextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operations.NamedContextsQuery, Operations.NamedContextsQueryVariables>) {
          return Apollo.useLazyQuery<Operations.NamedContextsQuery, Operations.NamedContextsQueryVariables>(Operations.NamedContexts, baseOptions);
        }
export type NamedContextsQueryHookResult = ReturnType<typeof useNamedContextsQuery>;
export type NamedContextsLazyQueryHookResult = ReturnType<typeof useNamedContextsLazyQuery>;
export type NamedContextsQueryResult = Apollo.QueryResult<Operations.NamedContextsQuery, Operations.NamedContextsQueryVariables>;
export function refetchNamedContextsQuery(variables?: Operations.NamedContextsQueryVariables) {
      return { query: Operations.NamedContexts, variables: variables }
    }

/**
 * __useLookupOwnerQuery__
 *
 * To run a query within a React component, call `useLookupOwnerQuery` and pass it any options that fit your needs.
 * When your component renders, `useLookupOwnerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLookupOwnerQuery({
 *   variables: {
 *      stubs: // value for 'stubs'
 *   },
 * });
 */
export function useLookupOwnerQuery(baseOptions: Apollo.QueryHookOptions<Operations.LookupOwnerQuery, Operations.LookupOwnerQueryVariables>) {
        return Apollo.useQuery<Operations.LookupOwnerQuery, Operations.LookupOwnerQueryVariables>(Operations.LookupOwner, baseOptions);
      }
export function useLookupOwnerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operations.LookupOwnerQuery, Operations.LookupOwnerQueryVariables>) {
          return Apollo.useLazyQuery<Operations.LookupOwnerQuery, Operations.LookupOwnerQueryVariables>(Operations.LookupOwner, baseOptions);
        }
export type LookupOwnerQueryHookResult = ReturnType<typeof useLookupOwnerQuery>;
export type LookupOwnerLazyQueryHookResult = ReturnType<typeof useLookupOwnerLazyQuery>;
export type LookupOwnerQueryResult = Apollo.QueryResult<Operations.LookupOwnerQuery, Operations.LookupOwnerQueryVariables>;
export function refetchLookupOwnerQuery(variables?: Operations.LookupOwnerQueryVariables) {
      return { query: Operations.LookupOwner, variables: variables }
    }

/**
 * __useListProjectsQuery__
 *
 * To run a query within a React component, call `useListProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListProjectsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useListProjectsQuery(baseOptions: Apollo.QueryHookOptions<Operations.ListProjectsQuery, Operations.ListProjectsQueryVariables>) {
        return Apollo.useQuery<Operations.ListProjectsQuery, Operations.ListProjectsQueryVariables>(Operations.ListProjects, baseOptions);
      }
export function useListProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operations.ListProjectsQuery, Operations.ListProjectsQueryVariables>) {
          return Apollo.useLazyQuery<Operations.ListProjectsQuery, Operations.ListProjectsQueryVariables>(Operations.ListProjects, baseOptions);
        }
export type ListProjectsQueryHookResult = ReturnType<typeof useListProjectsQuery>;
export type ListProjectsLazyQueryHookResult = ReturnType<typeof useListProjectsLazyQuery>;
export type ListProjectsQueryResult = Apollo.QueryResult<Operations.ListProjectsQuery, Operations.ListProjectsQueryVariables>;
export function refetchListProjectsQuery(variables?: Operations.ListProjectsQueryVariables) {
      return { query: Operations.ListProjects, variables: variables }
    }