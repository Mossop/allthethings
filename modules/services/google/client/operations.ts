/* eslint-disable */
import * as Schema from "#schema";
import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {};
export type ListGoogleAccountsQueryVariables = Schema.Exact<{
  [key: string]: never;
}>;

export type ListGoogleAccountsQuery = {
  readonly __typename: "Query";
  readonly user: Schema.Maybe<{
    readonly __typename: "User";
    readonly id: string;
    readonly googleAccounts: ReadonlyArray<{
      readonly __typename: "GoogleAccount";
      readonly id: string;
      readonly email: string;
      readonly avatar: Schema.Maybe<string>;
      readonly loginUrl: string;
      readonly mailSearches: ReadonlyArray<{
        readonly __typename: "GoogleMailSearch";
        readonly id: string;
        readonly name: string;
        readonly query: string;
        readonly url: string;
      }>;
    }>;
  }>;
};

export type RequestLoginUrlQueryVariables = Schema.Exact<{
  [key: string]: never;
}>;

export type RequestLoginUrlQuery = {
  readonly __typename: "Query";
  readonly googleLoginUrl: string;
};

export type CreateGoogleMailSearchMutationVariables = Schema.Exact<{
  account: Schema.Scalars["ID"];
  params: Schema.GoogleMailSearchParams;
}>;

export type CreateGoogleMailSearchMutation = {
  readonly __typename: "Mutation";
  readonly createGoogleMailSearch: {
    readonly __typename: "GoogleMailSearch";
    readonly id: string;
    readonly name: string;
    readonly query: string;
    readonly url: string;
  };
};

export const OperationNames = {
  Query: {
    ListGoogleAccounts: "ListGoogleAccounts",
    RequestLoginUrl: "RequestLoginUrl",
  },
  Mutation: {
    CreateGoogleMailSearch: "CreateGoogleMailSearch",
  },
};

export const ListGoogleAccountsDocument = gql`
  query ListGoogleAccounts {
    user {
      id
      googleAccounts {
        id
        email
        avatar
        loginUrl
        mailSearches {
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
 * __useListGoogleAccountsQuery__
 *
 * To run a query within a React component, call `useListGoogleAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListGoogleAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListGoogleAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListGoogleAccountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListGoogleAccountsQuery,
    ListGoogleAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ListGoogleAccountsQuery,
    ListGoogleAccountsQueryVariables
  >(ListGoogleAccountsDocument, options);
}
export function useListGoogleAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListGoogleAccountsQuery,
    ListGoogleAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ListGoogleAccountsQuery,
    ListGoogleAccountsQueryVariables
  >(ListGoogleAccountsDocument, options);
}
export type ListGoogleAccountsQueryHookResult = ReturnType<
  typeof useListGoogleAccountsQuery
>;
export type ListGoogleAccountsLazyQueryHookResult = ReturnType<
  typeof useListGoogleAccountsLazyQuery
>;
export type ListGoogleAccountsQueryResult = Apollo.QueryResult<
  ListGoogleAccountsQuery,
  ListGoogleAccountsQueryVariables
>;
export function refetchListGoogleAccountsQuery(
  variables?: ListGoogleAccountsQueryVariables,
) {
  return { query: ListGoogleAccountsDocument, variables: variables };
}
export const RequestLoginUrlDocument = gql`
  query RequestLoginUrl {
    googleLoginUrl
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
export function useRequestLoginUrlQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RequestLoginUrlQuery,
    RequestLoginUrlQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<RequestLoginUrlQuery, RequestLoginUrlQueryVariables>(
    RequestLoginUrlDocument,
    options,
  );
}
export function useRequestLoginUrlLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RequestLoginUrlQuery,
    RequestLoginUrlQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RequestLoginUrlQuery,
    RequestLoginUrlQueryVariables
  >(RequestLoginUrlDocument, options);
}
export type RequestLoginUrlQueryHookResult = ReturnType<
  typeof useRequestLoginUrlQuery
>;
export type RequestLoginUrlLazyQueryHookResult = ReturnType<
  typeof useRequestLoginUrlLazyQuery
>;
export type RequestLoginUrlQueryResult = Apollo.QueryResult<
  RequestLoginUrlQuery,
  RequestLoginUrlQueryVariables
>;
export function refetchRequestLoginUrlQuery(
  variables?: RequestLoginUrlQueryVariables,
) {
  return { query: RequestLoginUrlDocument, variables: variables };
}
export const CreateGoogleMailSearchDocument = gql`
  mutation CreateGoogleMailSearch(
    $account: ID!
    $params: GoogleMailSearchParams!
  ) {
    createGoogleMailSearch(account: $account, params: $params) {
      id
      name
      query
      url
    }
  }
`;
export type CreateGoogleMailSearchMutationFn = Apollo.MutationFunction<
  CreateGoogleMailSearchMutation,
  CreateGoogleMailSearchMutationVariables
>;

/**
 * __useCreateGoogleMailSearchMutation__
 *
 * To run a mutation, you first call `useCreateGoogleMailSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGoogleMailSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGoogleMailSearchMutation, { data, loading, error }] = useCreateGoogleMailSearchMutation({
 *   variables: {
 *      account: // value for 'account'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateGoogleMailSearchMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGoogleMailSearchMutation,
    CreateGoogleMailSearchMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateGoogleMailSearchMutation,
    CreateGoogleMailSearchMutationVariables
  >(CreateGoogleMailSearchDocument, options);
}
export type CreateGoogleMailSearchMutationHookResult = ReturnType<
  typeof useCreateGoogleMailSearchMutation
>;
export type CreateGoogleMailSearchMutationResult =
  Apollo.MutationResult<CreateGoogleMailSearchMutation>;
export type CreateGoogleMailSearchMutationOptions = Apollo.BaseMutationOptions<
  CreateGoogleMailSearchMutation,
  CreateGoogleMailSearchMutationVariables
>;
