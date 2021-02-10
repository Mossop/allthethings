/* eslint-disable */
import * as Types from './types';

import { RootFields_User_Fragment, RootFields_Context_Fragment, ItemFields_Task_Fragment, ItemFields_File_Fragment, ItemFields_Note_Fragment, ItemFields_Link_Fragment } from './fragments';
import { gql } from '@apollo/client';
import { RootFieldsFragmentDoc, ItemFieldsFragmentDoc } from './fragments';
import * as Apollo from '@apollo/client';
export type ListContextStateQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ListContextStateQuery = { readonly __typename: 'Query', readonly user: Types.Maybe<(
    { readonly __typename: 'User', readonly id: string, readonly email: string, readonly contexts: ReadonlyArray<(
      { readonly __typename: 'Context', readonly id: string, readonly stub: string, readonly name: string }
      & RootFields_Context_Fragment
    )> }
    & RootFields_User_Fragment
  )> };

export type ListTaskListQueryVariables = Types.Exact<{
  taskList: Types.Scalars['ID'];
}>;


export type ListTaskListQuery = { readonly __typename: 'Query', readonly taskList: Types.Maybe<{ readonly __typename: 'User', readonly remainingTasks: number, readonly items: ReadonlyArray<(
      { readonly __typename: 'Task' }
      & ItemFields_Task_Fragment
    ) | (
      { readonly __typename: 'File' }
      & ItemFields_File_Fragment
    ) | (
      { readonly __typename: 'Note' }
      & ItemFields_Note_Fragment
    ) | (
      { readonly __typename: 'Link' }
      & ItemFields_Link_Fragment
    )>, readonly sections: ReadonlyArray<{ readonly __typename: 'Section', readonly id: string, readonly name: string, readonly remainingTasks: number, readonly items: ReadonlyArray<(
        { readonly __typename: 'Task' }
        & ItemFields_Task_Fragment
      ) | (
        { readonly __typename: 'File' }
        & ItemFields_File_Fragment
      ) | (
        { readonly __typename: 'Note' }
        & ItemFields_Note_Fragment
      ) | (
        { readonly __typename: 'Link' }
        & ItemFields_Link_Fragment
      )> }> } | { readonly __typename: 'Context', readonly remainingTasks: number, readonly items: ReadonlyArray<(
      { readonly __typename: 'Task' }
      & ItemFields_Task_Fragment
    ) | (
      { readonly __typename: 'File' }
      & ItemFields_File_Fragment
    ) | (
      { readonly __typename: 'Note' }
      & ItemFields_Note_Fragment
    ) | (
      { readonly __typename: 'Link' }
      & ItemFields_Link_Fragment
    )>, readonly sections: ReadonlyArray<{ readonly __typename: 'Section', readonly id: string, readonly name: string, readonly remainingTasks: number, readonly items: ReadonlyArray<(
        { readonly __typename: 'Task' }
        & ItemFields_Task_Fragment
      ) | (
        { readonly __typename: 'File' }
        & ItemFields_File_Fragment
      ) | (
        { readonly __typename: 'Note' }
        & ItemFields_Note_Fragment
      ) | (
        { readonly __typename: 'Link' }
        & ItemFields_Link_Fragment
      )> }> } | { readonly __typename: 'Project', readonly remainingTasks: number, readonly items: ReadonlyArray<(
      { readonly __typename: 'Task' }
      & ItemFields_Task_Fragment
    ) | (
      { readonly __typename: 'File' }
      & ItemFields_File_Fragment
    ) | (
      { readonly __typename: 'Note' }
      & ItemFields_Note_Fragment
    ) | (
      { readonly __typename: 'Link' }
      & ItemFields_Link_Fragment
    )>, readonly sections: ReadonlyArray<{ readonly __typename: 'Section', readonly id: string, readonly name: string, readonly remainingTasks: number, readonly items: ReadonlyArray<(
        { readonly __typename: 'Task' }
        & ItemFields_Task_Fragment
      ) | (
        { readonly __typename: 'File' }
        & ItemFields_File_Fragment
      ) | (
        { readonly __typename: 'Note' }
        & ItemFields_Note_Fragment
      ) | (
        { readonly __typename: 'Link' }
        & ItemFields_Link_Fragment
      )> }> }> };


export const ListContextStateDocument = gql`
    query ListContextState {
  user {
    id
    email
    ...rootFields
    contexts {
      id
      stub
      name
      ...rootFields
    }
  }
}
    ${RootFieldsFragmentDoc}`;

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
    remainingTasks
    items {
      ...itemFields
    }
    sections {
      id
      name
      remainingTasks
      items {
        ...itemFields
      }
    }
  }
}
    ${ItemFieldsFragmentDoc}`;

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