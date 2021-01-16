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
      & Pick<Types.NamedContext, 'id' | 'name' | 'stub'>
    )> }
  )> }
);

export type LookupOwnerQueryVariables = Types.Exact<{
  stubs: Array<Types.Scalars['String']> | Types.Scalars['String'];
}>;


export type LookupOwnerQuery = (
  { __typename?: 'Query' }
  & { user?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'id'>
    & { descend?: Types.Maybe<(
      { __typename?: 'User' }
      & Pick<Types.User, 'id'>
      & { context: (
        { __typename?: 'User' }
        & Pick<Types.User, 'id'>
      ) | (
        { __typename?: 'NamedContext' }
        & Pick<Types.NamedContext, 'id'>
      ) }
    ) | (
      { __typename?: 'NamedContext' }
      & Pick<Types.NamedContext, 'id'>
      & { context: (
        { __typename?: 'User' }
        & Pick<Types.User, 'id'>
      ) | (
        { __typename?: 'NamedContext' }
        & Pick<Types.NamedContext, 'id'>
      ) }
    ) | (
      { __typename?: 'Project' }
      & Pick<Types.Project, 'id'>
      & { context: (
        { __typename?: 'User' }
        & Pick<Types.User, 'id'>
      ) | (
        { __typename?: 'NamedContext' }
        & Pick<Types.NamedContext, 'id'>
      ) }
    )> }
  )> }
);

export type ListProjectsQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ListProjectsQuery = (
  { __typename?: 'Query' }
  & { context?: Types.Maybe<(
    { __typename?: 'User' }
    & { projects: Array<(
      { __typename?: 'Project' }
      & Pick<Types.Project, 'id' | 'stub' | 'name'>
      & { parent?: Types.Maybe<(
        { __typename?: 'Project' }
        & Pick<Types.Project, 'id'>
      )> }
    )> }
  ) | (
    { __typename?: 'NamedContext' }
    & { projects: Array<(
      { __typename?: 'Project' }
      & Pick<Types.Project, 'id' | 'stub' | 'name'>
      & { parent?: Types.Maybe<(
        { __typename?: 'Project' }
        & Pick<Types.Project, 'id'>
      )> }
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
      stub
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
export const LookupOwnerDocument = gql`
    query LookupOwner($stubs: [String!]!) {
  user {
    id
    descend(stubs: $stubs) {
      id
      context {
        id
      }
    }
  }
}
    `;

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
export function useLookupOwnerQuery(baseOptions: Apollo.QueryHookOptions<LookupOwnerQuery, LookupOwnerQueryVariables>) {
        return Apollo.useQuery<LookupOwnerQuery, LookupOwnerQueryVariables>(LookupOwnerDocument, baseOptions);
      }
export function useLookupOwnerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LookupOwnerQuery, LookupOwnerQueryVariables>) {
          return Apollo.useLazyQuery<LookupOwnerQuery, LookupOwnerQueryVariables>(LookupOwnerDocument, baseOptions);
        }
export type LookupOwnerQueryHookResult = ReturnType<typeof useLookupOwnerQuery>;
export type LookupOwnerLazyQueryHookResult = ReturnType<typeof useLookupOwnerLazyQuery>;
export type LookupOwnerQueryResult = Apollo.QueryResult<LookupOwnerQuery, LookupOwnerQueryVariables>;
export function refetchLookupOwnerQuery(variables?: LookupOwnerQueryVariables) {
      return { query: LookupOwnerDocument, variables: variables }
    }
export const ListProjectsDocument = gql`
    query ListProjects($id: ID!) {
  context(id: $id) {
    projects {
      id
      stub
      name
      parent {
        id
      }
    }
  }
}
    `;

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
export function useListProjectsQuery(baseOptions: Apollo.QueryHookOptions<ListProjectsQuery, ListProjectsQueryVariables>) {
        return Apollo.useQuery<ListProjectsQuery, ListProjectsQueryVariables>(ListProjectsDocument, baseOptions);
      }
export function useListProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListProjectsQuery, ListProjectsQueryVariables>) {
          return Apollo.useLazyQuery<ListProjectsQuery, ListProjectsQueryVariables>(ListProjectsDocument, baseOptions);
        }
export type ListProjectsQueryHookResult = ReturnType<typeof useListProjectsQuery>;
export type ListProjectsLazyQueryHookResult = ReturnType<typeof useListProjectsLazyQuery>;
export type ListProjectsQueryResult = Apollo.QueryResult<ListProjectsQuery, ListProjectsQueryVariables>;
export function refetchListProjectsQuery(variables?: ListProjectsQueryVariables) {
      return { query: ListProjectsDocument, variables: variables }
    }