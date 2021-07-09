/* eslint-disable */
import * as Schema from '#schema';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ListJiraAccountsQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type ListJiraAccountsQuery = { readonly __typename: 'Query', readonly user: Schema.Maybe<{ readonly __typename: 'User', readonly id: string, readonly jiraAccounts: ReadonlyArray<{ readonly __typename: 'JiraAccount', readonly id: string, readonly serverName: string, readonly userName: string, readonly url: string, readonly email: string, readonly apiToken: string, readonly searches: ReadonlyArray<{ readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> }> }> };

export type CreateJiraAccountMutationVariables = Schema.Exact<{
  params: Schema.JiraAccountParams;
}>;


export type CreateJiraAccountMutation = { readonly __typename: 'Mutation', readonly createJiraAccount: { readonly __typename: 'JiraAccount', readonly id: string, readonly serverName: string, readonly userName: string, readonly url: string, readonly email: string, readonly apiToken: string, readonly searches: ReadonlyArray<{ readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> } };

export type DeleteJiraAccountMutationVariables = Schema.Exact<{
  account: Schema.Scalars['ID'];
}>;


export type DeleteJiraAccountMutation = { readonly __typename: 'Mutation', readonly deleteJiraAccount: Schema.Maybe<boolean> };

export type CreateJiraSearchMutationVariables = Schema.Exact<{
  account: Schema.Scalars['ID'];
  params: Schema.JiraSearchParams;
}>;


export type CreateJiraSearchMutation = { readonly __typename: 'Mutation', readonly createJiraSearch: { readonly __typename: 'JiraSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string } };

export type DeleteJiraSearchMutationVariables = Schema.Exact<{
  id: Schema.Scalars['ID'];
}>;


export type DeleteJiraSearchMutation = { readonly __typename: 'Mutation', readonly deleteJiraSearch: Schema.Maybe<boolean> };


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