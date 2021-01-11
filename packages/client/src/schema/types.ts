/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Context = {
  __typename?: 'Context';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  contexts: Array<Context>;
};

export type ContextsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContextsQuery = (
  { __typename?: 'Query' }
  & { contexts: Array<(
    { __typename?: 'Context' }
    & Pick<Context, 'id' | 'name'>
  )> }
);


export const ContextsDocument = gql`
    query contexts {
  contexts {
    id
    name
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