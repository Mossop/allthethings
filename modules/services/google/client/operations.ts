/* eslint-disable */
import * as Schema from "../../../schema";
import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {};
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
    readonly dueOffset: Schema.Maybe<Schema.Scalars["DateTimeOffset"]>;
    readonly url: string;
  };
};

export type EditGoogleMailSearchMutationVariables = Schema.Exact<{
  id: Schema.Scalars["ID"];
  params: Schema.GoogleMailSearchParams;
}>;

export type EditGoogleMailSearchMutation = {
  readonly __typename: "Mutation";
  readonly editGoogleMailSearch: Schema.Maybe<{
    readonly __typename: "GoogleMailSearch";
    readonly id: string;
    readonly name: string;
    readonly query: string;
    readonly dueOffset: Schema.Maybe<Schema.Scalars["DateTimeOffset"]>;
    readonly url: string;
  }>;
};

export type DeleteGoogleMailSearchMutationVariables = Schema.Exact<{
  id: Schema.Scalars["ID"];
}>;

export type DeleteGoogleMailSearchMutation = {
  readonly __typename: "Mutation";
  readonly deleteGoogleMailSearch: boolean;
};

export const OperationNames = {
  Mutation: {
    CreateGoogleMailSearch: "CreateGoogleMailSearch",
    EditGoogleMailSearch: "EditGoogleMailSearch",
    DeleteGoogleMailSearch: "DeleteGoogleMailSearch",
  },
};

export const CreateGoogleMailSearchDocument = gql`
  mutation CreateGoogleMailSearch(
    $account: ID!
    $params: GoogleMailSearchParams!
  ) {
    createGoogleMailSearch(account: $account, params: $params) {
      id
      name
      query
      dueOffset
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
export const EditGoogleMailSearchDocument = gql`
  mutation EditGoogleMailSearch($id: ID!, $params: GoogleMailSearchParams!) {
    editGoogleMailSearch(id: $id, params: $params) {
      id
      name
      query
      dueOffset
      url
    }
  }
`;
export type EditGoogleMailSearchMutationFn = Apollo.MutationFunction<
  EditGoogleMailSearchMutation,
  EditGoogleMailSearchMutationVariables
>;

/**
 * __useEditGoogleMailSearchMutation__
 *
 * To run a mutation, you first call `useEditGoogleMailSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditGoogleMailSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editGoogleMailSearchMutation, { data, loading, error }] = useEditGoogleMailSearchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditGoogleMailSearchMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditGoogleMailSearchMutation,
    EditGoogleMailSearchMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditGoogleMailSearchMutation,
    EditGoogleMailSearchMutationVariables
  >(EditGoogleMailSearchDocument, options);
}
export type EditGoogleMailSearchMutationHookResult = ReturnType<
  typeof useEditGoogleMailSearchMutation
>;
export type EditGoogleMailSearchMutationResult =
  Apollo.MutationResult<EditGoogleMailSearchMutation>;
export type EditGoogleMailSearchMutationOptions = Apollo.BaseMutationOptions<
  EditGoogleMailSearchMutation,
  EditGoogleMailSearchMutationVariables
>;
export const DeleteGoogleMailSearchDocument = gql`
  mutation DeleteGoogleMailSearch($id: ID!) {
    deleteGoogleMailSearch(id: $id)
  }
`;
export type DeleteGoogleMailSearchMutationFn = Apollo.MutationFunction<
  DeleteGoogleMailSearchMutation,
  DeleteGoogleMailSearchMutationVariables
>;

/**
 * __useDeleteGoogleMailSearchMutation__
 *
 * To run a mutation, you first call `useDeleteGoogleMailSearchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGoogleMailSearchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGoogleMailSearchMutation, { data, loading, error }] = useDeleteGoogleMailSearchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGoogleMailSearchMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGoogleMailSearchMutation,
    DeleteGoogleMailSearchMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGoogleMailSearchMutation,
    DeleteGoogleMailSearchMutationVariables
  >(DeleteGoogleMailSearchDocument, options);
}
export type DeleteGoogleMailSearchMutationHookResult = ReturnType<
  typeof useDeleteGoogleMailSearchMutation
>;
export type DeleteGoogleMailSearchMutationResult =
  Apollo.MutationResult<DeleteGoogleMailSearchMutation>;
export type DeleteGoogleMailSearchMutationOptions = Apollo.BaseMutationOptions<
  DeleteGoogleMailSearchMutation,
  DeleteGoogleMailSearchMutationVariables
>;
