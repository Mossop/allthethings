/* eslint-disable */
import * as Schema from '#schema';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ListBugzillaAccountsQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type ListBugzillaAccountsQuery = { readonly __typename: 'Query', readonly user: Schema.Maybe<{ readonly __typename: 'User', readonly id: string, readonly bugzillaAccounts: ReadonlyArray<{ readonly __typename: 'BugzillaAccount', readonly id: string, readonly name: string, readonly icon: Schema.Maybe<string>, readonly url: string, readonly searches: ReadonlyArray<{ readonly __typename: 'BugzillaSearch', readonly id: string, readonly name: string, readonly type: string, readonly query: string, readonly url: string }> }> }> };

export type CreateBugzillaAccountMutationVariables = Schema.Exact<{
  params: Schema.BugzillaAccountParams;
}>;


export type CreateBugzillaAccountMutation = { readonly __typename: 'Mutation', readonly createBugzillaAccount: { readonly __typename: 'BugzillaAccount', readonly id: string, readonly name: string, readonly icon: Schema.Maybe<string>, readonly url: string, readonly searches: ReadonlyArray<{ readonly __typename: 'BugzillaSearch', readonly id: string, readonly name: string, readonly type: string, readonly query: string, readonly url: string }> } };

export type DeleteBugzillaAccountMutationVariables = Schema.Exact<{
  account: Schema.Scalars['ID'];
}>;


export type DeleteBugzillaAccountMutation = { readonly __typename: 'Mutation', readonly deleteBugzillaAccount: Schema.Maybe<boolean> };

export type CreateBugzillaSearchMutationVariables = Schema.Exact<{
  account: Schema.Scalars['ID'];
  params: Schema.BugzillaSearchParams;
}>;


export type CreateBugzillaSearchMutation = { readonly __typename: 'Mutation', readonly createBugzillaSearch: { readonly __typename: 'BugzillaSearch', readonly id: string, readonly name: string, readonly type: string, readonly query: string, readonly url: string } };

export type DeleteBugzillaSearchMutationVariables = Schema.Exact<{
  search: Schema.Scalars['ID'];
}>;


export type DeleteBugzillaSearchMutation = { readonly __typename: 'Mutation', readonly deleteBugzillaSearch: Schema.Maybe<boolean> };


export const ListBugzillaAccountsDocument = gql`
    query ListBugzillaAccounts {
  user {
    id
    bugzillaAccounts {
      id
      name
      icon
      url
      searches {
        id
        name
        type
        query
        url
      }
    }
  }
}
    `;

/**
 * __useListBugzillaAccountsQuery__
 *
 * To run a query within a React component, call `useListBugzillaAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListBugzillaAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListBugzillaAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListBugzillaAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>(ListBugzillaAccountsDocument, options);
      }
export function useListBugzillaAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>(ListBugzillaAccountsDocument, options);
        }
export type ListBugzillaAccountsQueryHookResult = ReturnType<typeof useListBugzillaAccountsQuery>;
export type ListBugzillaAccountsLazyQueryHookResult = ReturnType<typeof useListBugzillaAccountsLazyQuery>;
export type ListBugzillaAccountsQueryResult = Apollo.QueryResult<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>;
export function refetchListBugzillaAccountsQuery(variables?: ListBugzillaAccountsQueryVariables) {
      return { query: ListBugzillaAccountsDocument, variables: variables }
    }
export const CreateBugzillaAccountDocument = gql`
    mutation CreateBugzillaAccount($params: BugzillaAccountParams!) {
  createBugzillaAccount(params: $params) {
    id
    name
    icon
    url
    searches {
      id
      name
      type
      query
      url
    }
  }
}
    `;
export type CreateBugzillaAccountMutationFn = Apollo.MutationFunction<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>;

/**
 * __useCreateBugzillaAccountMutation__
 *
 * To run a mutation, you first call `useCreateBugzillaAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBugzillaAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBugzillaAccountMutation, { data, loading, error }] = useCreateBugzillaAccountMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateBugzillaAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>(CreateBugzillaAccountDocument, options);
      }
export type CreateBugzillaAccountMutationHookResult = ReturnType<typeof useCreateBugzillaAccountMutation>;
export type CreateBugzillaAccountMutationResult = Apollo.MutationResult<CreateBugzillaAccountMutation>;
export type CreateBugzillaAccountMutationOptions = Apollo.BaseMutationOptions<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>;
export const DeleteBugzillaAccountDocument = gql`
    mutation DeleteBugzillaAccount($account: ID!) {
  deleteBugzillaAccount(account: $account)
}
    `;
export type DeleteBugzillaAccountMutationFn = Apollo.MutationFunction<DeleteBugzillaAccountMutation, DeleteBugzillaAccountMutationVariables>;

/**
 * __useDeleteBugzillaAccountMutation__
 *
 * To run a mutation, you first call `useDeleteBugzillaAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBugzillaAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBugzillaAccountMutation, { data, loading, error }] = useDeleteBugzillaAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useDeleteBugzillaAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBugzillaAccountMutation, DeleteBugzillaAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBugzillaAccountMutation, DeleteBugzillaAccountMutationVariables>(DeleteBugzillaAccountDocument, options);
      }
export type DeleteBugzillaAccountMutationHookResult = ReturnType<typeof useDeleteBugzillaAccountMutation>;
export type DeleteBugzillaAccountMutationResult = Apollo.MutationResult<DeleteBugzillaAccountMutation>;
export type DeleteBugzillaAccountMutationOptions = Apollo.BaseMutationOptions<DeleteBugzillaAccountMutation, DeleteBugzillaAccountMutationVariables>;
export const CreateBugzillaSearchDocument = gql`
    mutation CreateBugzillaSearch($account: ID!, $params: BugzillaSearchParams!) {
  createBugzillaSearch(account: $account, params: $params) {
    id
    name
    type
    query
    url
  }
}
    `;
export type CreateBugzillaSearchMutationFn = Apollo.MutationFunction<CreateBugzillaSearchMutation, CreateBugzillaSearchMutationVariables>;

/**
 * __useCreateBugzillaSearchMutation__
 *
 * To run a mutation, you first call `useCreateBugzillaSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBugzillaSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBugzillaSearchMutation, { data, loading, error }] = useCreateBugzillaSearchMutation({
 *   variables: {
 *      account: // value for 'account'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateBugzillaSearchMutation(baseOptions?: Apollo.MutationHookOptions<CreateBugzillaSearchMutation, CreateBugzillaSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBugzillaSearchMutation, CreateBugzillaSearchMutationVariables>(CreateBugzillaSearchDocument, options);
      }
export type CreateBugzillaSearchMutationHookResult = ReturnType<typeof useCreateBugzillaSearchMutation>;
export type CreateBugzillaSearchMutationResult = Apollo.MutationResult<CreateBugzillaSearchMutation>;
export type CreateBugzillaSearchMutationOptions = Apollo.BaseMutationOptions<CreateBugzillaSearchMutation, CreateBugzillaSearchMutationVariables>;
export const DeleteBugzillaSearchDocument = gql`
    mutation DeleteBugzillaSearch($search: ID!) {
  deleteBugzillaSearch(search: $search)
}
    `;
export type DeleteBugzillaSearchMutationFn = Apollo.MutationFunction<DeleteBugzillaSearchMutation, DeleteBugzillaSearchMutationVariables>;

/**
 * __useDeleteBugzillaSearchMutation__
 *
 * To run a mutation, you first call `useDeleteBugzillaSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBugzillaSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBugzillaSearchMutation, { data, loading, error }] = useDeleteBugzillaSearchMutation({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useDeleteBugzillaSearchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBugzillaSearchMutation, DeleteBugzillaSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBugzillaSearchMutation, DeleteBugzillaSearchMutationVariables>(DeleteBugzillaSearchDocument, options);
      }
export type DeleteBugzillaSearchMutationHookResult = ReturnType<typeof useDeleteBugzillaSearchMutation>;
export type DeleteBugzillaSearchMutationResult = Apollo.MutationResult<DeleteBugzillaSearchMutation>;
export type DeleteBugzillaSearchMutationOptions = Apollo.BaseMutationOptions<DeleteBugzillaSearchMutation, DeleteBugzillaSearchMutationVariables>;