/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type ListContextStateQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ListContextStateQuery = { readonly __typename?: 'Query', readonly user: Types.Maybe<{ readonly __typename?: 'User', readonly email: string, readonly id: string, readonly subprojects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly subprojects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string }>, readonly sections: ReadonlyArray<{ readonly __typename?: 'Section', readonly id: string, readonly name: string }> }>, readonly contexts: ReadonlyArray<{ readonly __typename?: 'Context', readonly stub: string, readonly name: string, readonly id: string, readonly subprojects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly subprojects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string }>, readonly sections: ReadonlyArray<{ readonly __typename?: 'Section', readonly id: string, readonly name: string }> }> }> }> };

export type ListTaskListQueryVariables = Types.Exact<{
  taskList: Types.Scalars['ID'];
}>;


export type ListTaskListQuery = { readonly __typename?: 'Query', readonly taskList: Types.Maybe<{ readonly __typename?: 'User', readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }>, readonly sections: ReadonlyArray<{ readonly __typename?: 'Section', readonly id: string, readonly name: string, readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }> }> } | { readonly __typename?: 'Context', readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }>, readonly sections: ReadonlyArray<{ readonly __typename?: 'Section', readonly id: string, readonly name: string, readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }> }> } | { readonly __typename?: 'Project', readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }>, readonly sections: ReadonlyArray<{ readonly __typename?: 'Section', readonly id: string, readonly name: string, readonly items: ReadonlyArray<{ readonly __typename?: 'Task', readonly id: string }> }> }> };


export const ListContextStateDocument = gql`
    query ListContextState {
  user {
    email
    id
    subprojects {
      id
    }
    projects {
      id
      stub
      name
      subprojects {
        id
      }
      sections {
        id
        name
      }
    }
    contexts {
      stub
      name
      id
      subprojects {
        id
      }
      projects {
        id
        stub
        name
        subprojects {
          id
        }
        sections {
          id
          name
        }
      }
    }
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
        return Apollo.useQuery<ListContextStateQuery, ListContextStateQueryVariables>(ListContextStateDocument, baseOptions);
      }
export function useListContextStateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListContextStateQuery, ListContextStateQueryVariables>) {
          return Apollo.useLazyQuery<ListContextStateQuery, ListContextStateQueryVariables>(ListContextStateDocument, baseOptions);
        }
export type ListContextStateQueryHookResult = ReturnType<typeof useListContextStateQuery>;
export type ListContextStateLazyQueryHookResult = ReturnType<typeof useListContextStateLazyQuery>;
export type ListContextStateQueryResult = Apollo.QueryResult<ListContextStateQuery, ListContextStateQueryVariables>;
export function refetchListContextStateQuery(variables?: ListContextStateQueryVariables) {
      return { query: ListContextStateDocument, variables: variables }
    }
export const ListTaskListDocument = gql`
    query ListTaskList($taskList: ID!) {
  taskList(id: $taskList) {
    items {
      id
    }
    sections {
      id
      name
      items {
        id
      }
    }
  }
}
    `;

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
        return Apollo.useQuery<ListTaskListQuery, ListTaskListQueryVariables>(ListTaskListDocument, baseOptions);
      }
export function useListTaskListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListTaskListQuery, ListTaskListQueryVariables>) {
          return Apollo.useLazyQuery<ListTaskListQuery, ListTaskListQueryVariables>(ListTaskListDocument, baseOptions);
        }
export type ListTaskListQueryHookResult = ReturnType<typeof useListTaskListQuery>;
export type ListTaskListLazyQueryHookResult = ReturnType<typeof useListTaskListLazyQuery>;
export type ListTaskListQueryResult = Apollo.QueryResult<ListTaskListQuery, ListTaskListQueryVariables>;
export function refetchListTaskListQuery(variables?: ListTaskListQueryVariables) {
      return { query: ListTaskListDocument, variables: variables }
    }