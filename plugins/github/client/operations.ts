/* eslint-disable */
import * as Schema from '#schema';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ListGithubAccountsQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type ListGithubAccountsQuery = { readonly __typename: 'Query', readonly user: Schema.Maybe<{ readonly __typename: 'User', readonly id: string, readonly githubAccounts: ReadonlyArray<{ readonly __typename: 'GithubAccount', readonly id: string, readonly user: string, readonly avatar: string, readonly loginUrl: string, readonly searches: ReadonlyArray<{ readonly __typename: 'GithubSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string }> }> }> };

export type RequestLoginUrlQueryVariables = Schema.Exact<{ [key: string]: never; }>;


export type RequestLoginUrlQuery = { readonly __typename: 'Query', readonly githubLoginUrl: string };

export type CreateGithubSearchMutationVariables = Schema.Exact<{
  account: Schema.Scalars['ID'];
  params: Schema.GithubSearchParams;
}>;


export type CreateGithubSearchMutation = { readonly __typename: 'Mutation', readonly createGithubSearch: { readonly __typename: 'GithubSearch', readonly id: string, readonly name: string, readonly query: string, readonly url: string } };

export const OperationNames = {
  Query: {
    ListGithubAccounts: 'ListGithubAccounts',
    RequestLoginUrl: 'RequestLoginUrl'
  },
  Mutation: {
    CreateGithubSearch: 'CreateGithubSearch'
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
export const CreateGithubSearchDocument = gql`
    mutation CreateGithubSearch($account: ID!, $params: GithubSearchParams!) {
  createGithubSearch(account: $account, params: $params) {
    id
    name
    query
    url
  }
}
    `;
export type CreateGithubSearchMutationFn = Apollo.MutationFunction<CreateGithubSearchMutation, CreateGithubSearchMutationVariables>;

/**
 * __useCreateGithubSearchMutation__
 *
 * To run a mutation, you first call `useCreateGithubSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGithubSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGithubSearchMutation, { data, loading, error }] = useCreateGithubSearchMutation({
 *   variables: {
 *      account: // value for 'account'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateGithubSearchMutation(baseOptions?: Apollo.MutationHookOptions<CreateGithubSearchMutation, CreateGithubSearchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGithubSearchMutation, CreateGithubSearchMutationVariables>(CreateGithubSearchDocument, options);
      }
export type CreateGithubSearchMutationHookResult = ReturnType<typeof useCreateGithubSearchMutation>;
export type CreateGithubSearchMutationResult = Apollo.MutationResult<CreateGithubSearchMutation>;
export type CreateGithubSearchMutationOptions = Apollo.BaseMutationOptions<CreateGithubSearchMutation, CreateGithubSearchMutationVariables>;