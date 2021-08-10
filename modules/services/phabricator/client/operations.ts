/* eslint-disable */
import * as Schema from "#schema";
import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {};
export type ListPhabricatorAccountsQueryVariables = Schema.Exact<{
  [key: string]: never;
}>;

export type ListPhabricatorAccountsQuery = {
  readonly __typename: "Query";
  readonly user: Schema.Maybe<{
    readonly __typename: "User";
    readonly id: string;
    readonly phabricatorAccounts: ReadonlyArray<{
      readonly __typename: "PhabricatorAccount";
      readonly id: string;
      readonly email: string;
      readonly icon: string;
      readonly url: string;
      readonly apiKey: string;
      readonly enabledQueries: ReadonlyArray<string>;
    }>;
  }>;
};

export type ListPhabricatorQueriesQueryVariables = Schema.Exact<{
  [key: string]: never;
}>;

export type ListPhabricatorQueriesQuery = {
  readonly __typename: "Query";
  readonly user: Schema.Maybe<{
    readonly __typename: "User";
    readonly id: string;
    readonly phabricatorQueries: ReadonlyArray<{
      readonly __typename: "PhabricatorQuery";
      readonly queryId: string;
      readonly name: string;
      readonly description: string;
    }>;
  }>;
};

export type CreatePhabricatorAccountMutationVariables = Schema.Exact<{
  params: Schema.CreatePhabricatorAccountParams;
}>;

export type CreatePhabricatorAccountMutation = {
  readonly __typename: "Mutation";
  readonly createPhabricatorAccount: {
    readonly __typename: "PhabricatorAccount";
    readonly id: string;
    readonly email: string;
    readonly icon: string;
    readonly url: string;
    readonly apiKey: string;
    readonly enabledQueries: ReadonlyArray<string>;
  };
};

export type UpdatePhabricatorAccountMutationVariables = Schema.Exact<{
  id: Schema.Scalars["ID"];
  params: Schema.UpdatePhabricatorAccountParams;
}>;

export type UpdatePhabricatorAccountMutation = {
  readonly __typename: "Mutation";
  readonly updatePhabricatorAccount: Schema.Maybe<{
    readonly __typename: "PhabricatorAccount";
    readonly id: string;
    readonly email: string;
    readonly icon: string;
    readonly url: string;
    readonly apiKey: string;
    readonly enabledQueries: ReadonlyArray<string>;
  }>;
};

export type DeletePhabricatorAccountMutationVariables = Schema.Exact<{
  account: Schema.Scalars["ID"];
}>;

export type DeletePhabricatorAccountMutation = {
  readonly __typename: "Mutation";
  readonly deletePhabricatorAccount: Schema.Maybe<boolean>;
};

export const OperationNames = {
  Query: {
    ListPhabricatorAccounts: "ListPhabricatorAccounts",
    ListPhabricatorQueries: "ListPhabricatorQueries",
  },
  Mutation: {
    CreatePhabricatorAccount: "CreatePhabricatorAccount",
    UpdatePhabricatorAccount: "UpdatePhabricatorAccount",
    DeletePhabricatorAccount: "DeletePhabricatorAccount",
  },
};

export const ListPhabricatorAccountsDocument = gql`
  query ListPhabricatorAccounts {
    user {
      id
      phabricatorAccounts {
        id
        email
        icon
        url
        apiKey
        enabledQueries
      }
    }
  }
`;

/**
 * __useListPhabricatorAccountsQuery__
 *
 * To run a query within a React component, call `useListPhabricatorAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPhabricatorAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPhabricatorAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPhabricatorAccountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListPhabricatorAccountsQuery,
    ListPhabricatorAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ListPhabricatorAccountsQuery,
    ListPhabricatorAccountsQueryVariables
  >(ListPhabricatorAccountsDocument, options);
}
export function useListPhabricatorAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListPhabricatorAccountsQuery,
    ListPhabricatorAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ListPhabricatorAccountsQuery,
    ListPhabricatorAccountsQueryVariables
  >(ListPhabricatorAccountsDocument, options);
}
export type ListPhabricatorAccountsQueryHookResult = ReturnType<
  typeof useListPhabricatorAccountsQuery
>;
export type ListPhabricatorAccountsLazyQueryHookResult = ReturnType<
  typeof useListPhabricatorAccountsLazyQuery
>;
export type ListPhabricatorAccountsQueryResult = Apollo.QueryResult<
  ListPhabricatorAccountsQuery,
  ListPhabricatorAccountsQueryVariables
>;
export function refetchListPhabricatorAccountsQuery(
  variables?: ListPhabricatorAccountsQueryVariables,
) {
  return { query: ListPhabricatorAccountsDocument, variables: variables };
}
export const ListPhabricatorQueriesDocument = gql`
  query ListPhabricatorQueries {
    user {
      id
      phabricatorQueries {
        queryId
        name
        description
      }
    }
  }
`;

/**
 * __useListPhabricatorQueriesQuery__
 *
 * To run a query within a React component, call `useListPhabricatorQueriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPhabricatorQueriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPhabricatorQueriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPhabricatorQueriesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListPhabricatorQueriesQuery,
    ListPhabricatorQueriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ListPhabricatorQueriesQuery,
    ListPhabricatorQueriesQueryVariables
  >(ListPhabricatorQueriesDocument, options);
}
export function useListPhabricatorQueriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListPhabricatorQueriesQuery,
    ListPhabricatorQueriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ListPhabricatorQueriesQuery,
    ListPhabricatorQueriesQueryVariables
  >(ListPhabricatorQueriesDocument, options);
}
export type ListPhabricatorQueriesQueryHookResult = ReturnType<
  typeof useListPhabricatorQueriesQuery
>;
export type ListPhabricatorQueriesLazyQueryHookResult = ReturnType<
  typeof useListPhabricatorQueriesLazyQuery
>;
export type ListPhabricatorQueriesQueryResult = Apollo.QueryResult<
  ListPhabricatorQueriesQuery,
  ListPhabricatorQueriesQueryVariables
>;
export function refetchListPhabricatorQueriesQuery(
  variables?: ListPhabricatorQueriesQueryVariables,
) {
  return { query: ListPhabricatorQueriesDocument, variables: variables };
}
export const CreatePhabricatorAccountDocument = gql`
  mutation CreatePhabricatorAccount($params: CreatePhabricatorAccountParams!) {
    createPhabricatorAccount(params: $params) {
      id
      email
      icon
      url
      apiKey
      enabledQueries
    }
  }
`;
export type CreatePhabricatorAccountMutationFn = Apollo.MutationFunction<
  CreatePhabricatorAccountMutation,
  CreatePhabricatorAccountMutationVariables
>;

/**
 * __useCreatePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useCreatePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPhabricatorAccountMutation, { data, loading, error }] = useCreatePhabricatorAccountMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreatePhabricatorAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePhabricatorAccountMutation,
    CreatePhabricatorAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreatePhabricatorAccountMutation,
    CreatePhabricatorAccountMutationVariables
  >(CreatePhabricatorAccountDocument, options);
}
export type CreatePhabricatorAccountMutationHookResult = ReturnType<
  typeof useCreatePhabricatorAccountMutation
>;
export type CreatePhabricatorAccountMutationResult =
  Apollo.MutationResult<CreatePhabricatorAccountMutation>;
export type CreatePhabricatorAccountMutationOptions =
  Apollo.BaseMutationOptions<
    CreatePhabricatorAccountMutation,
    CreatePhabricatorAccountMutationVariables
  >;
export const UpdatePhabricatorAccountDocument = gql`
  mutation UpdatePhabricatorAccount(
    $id: ID!
    $params: UpdatePhabricatorAccountParams!
  ) {
    updatePhabricatorAccount(id: $id, params: $params) {
      id
      email
      icon
      url
      apiKey
      enabledQueries
    }
  }
`;
export type UpdatePhabricatorAccountMutationFn = Apollo.MutationFunction<
  UpdatePhabricatorAccountMutation,
  UpdatePhabricatorAccountMutationVariables
>;

/**
 * __useUpdatePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useUpdatePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePhabricatorAccountMutation, { data, loading, error }] = useUpdatePhabricatorAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useUpdatePhabricatorAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePhabricatorAccountMutation,
    UpdatePhabricatorAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdatePhabricatorAccountMutation,
    UpdatePhabricatorAccountMutationVariables
  >(UpdatePhabricatorAccountDocument, options);
}
export type UpdatePhabricatorAccountMutationHookResult = ReturnType<
  typeof useUpdatePhabricatorAccountMutation
>;
export type UpdatePhabricatorAccountMutationResult =
  Apollo.MutationResult<UpdatePhabricatorAccountMutation>;
export type UpdatePhabricatorAccountMutationOptions =
  Apollo.BaseMutationOptions<
    UpdatePhabricatorAccountMutation,
    UpdatePhabricatorAccountMutationVariables
  >;
export const DeletePhabricatorAccountDocument = gql`
  mutation DeletePhabricatorAccount($account: ID!) {
    deletePhabricatorAccount(account: $account)
  }
`;
export type DeletePhabricatorAccountMutationFn = Apollo.MutationFunction<
  DeletePhabricatorAccountMutation,
  DeletePhabricatorAccountMutationVariables
>;

/**
 * __useDeletePhabricatorAccountMutation__
 *
 * To run a mutation, you first call `useDeletePhabricatorAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePhabricatorAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePhabricatorAccountMutation, { data, loading, error }] = useDeletePhabricatorAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useDeletePhabricatorAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeletePhabricatorAccountMutation,
    DeletePhabricatorAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeletePhabricatorAccountMutation,
    DeletePhabricatorAccountMutationVariables
  >(DeletePhabricatorAccountDocument, options);
}
export type DeletePhabricatorAccountMutationHookResult = ReturnType<
  typeof useDeletePhabricatorAccountMutation
>;
export type DeletePhabricatorAccountMutationResult =
  Apollo.MutationResult<DeletePhabricatorAccountMutation>;
export type DeletePhabricatorAccountMutationOptions =
  Apollo.BaseMutationOptions<
    DeletePhabricatorAccountMutation,
    DeletePhabricatorAccountMutationVariables
  >;
