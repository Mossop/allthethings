/* eslint-disable */
import * as Schema from "../../../schema";
import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {};
export type ClientItemFieldsFragment = {
  readonly __typename: "Item";
  readonly id: string;
  readonly summary: string;
  readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
  readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
  readonly created: Schema.Scalars["DateTime"];
  readonly taskInfo: Schema.Maybe<{
    readonly __typename: "TaskInfo";
    readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
    readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
    readonly controller: Schema.Scalars["TaskController"];
  }>;
  readonly detail: Schema.Maybe<
    | {
        readonly __typename: "FileDetail";
        readonly size: number;
        readonly filename: string;
        readonly mimetype: string;
      }
    | {
        readonly __typename: "LinkDetail";
        readonly icon: Schema.Maybe<string>;
        readonly url: string;
      }
    | { readonly __typename: "NoteDetail"; readonly note: string }
    | {
        readonly __typename: "ServiceDetail";
        readonly serviceId: string;
        readonly hasTaskState: boolean;
        readonly wasEverListed: boolean;
        readonly isCurrentlyListed: boolean;
        readonly fields: string;
        readonly lists: ReadonlyArray<{
          readonly __typename: "ServiceList";
          readonly id: string;
          readonly serviceId: string;
          readonly name: string;
          readonly url: Schema.Maybe<string>;
        }>;
      }
  >;
};

export type CreateUserMutationVariables = Schema.Exact<{
  email: Schema.Scalars["String"];
  password: Schema.Scalars["String"];
  isAdmin: Schema.Maybe<Schema.Scalars["Boolean"]>;
}>;

export type CreateUserMutation = {
  readonly __typename: "Mutation";
  readonly createUser: { readonly __typename: "User"; readonly id: string };
};

export type DeleteUserMutationVariables = Schema.Exact<{
  id: Schema.Scalars["ID"];
}>;

export type DeleteUserMutation = {
  readonly __typename: "Mutation";
  readonly deleteUser: Schema.Maybe<boolean>;
};

export type ChangePasswordMutationVariables = Schema.Exact<{
  currentPassword: Schema.Scalars["String"];
  newPassword: Schema.Scalars["String"];
}>;

export type ChangePasswordMutation = {
  readonly __typename: "Mutation";
  readonly changePassword: Schema.Maybe<{
    readonly __typename: "User";
    readonly id: string;
  }>;
};

export type ListUsersQueryVariables = Schema.Exact<{ [key: string]: never }>;

export type ListUsersQuery = {
  readonly __typename: "Query";
  readonly users: ReadonlyArray<{
    readonly __typename: "User";
    readonly id: string;
    readonly email: string;
    readonly isAdmin: boolean;
  }>;
};

export type ListInboxQueryVariables = Schema.Exact<{ [key: string]: never }>;

export type ListInboxQuery = {
  readonly __typename: "Query";
  readonly user: Schema.Maybe<{
    readonly __typename: "User";
    readonly inbox: {
      readonly __typename: "ItemSet";
      readonly items: ReadonlyArray<{
        readonly __typename: "Item";
        readonly id: string;
        readonly summary: string;
        readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
        readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
        readonly created: Schema.Scalars["DateTime"];
        readonly taskInfo: Schema.Maybe<{
          readonly __typename: "TaskInfo";
          readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
          readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
          readonly controller: Schema.Scalars["TaskController"];
        }>;
        readonly detail: Schema.Maybe<
          | {
              readonly __typename: "FileDetail";
              readonly size: number;
              readonly filename: string;
              readonly mimetype: string;
            }
          | {
              readonly __typename: "LinkDetail";
              readonly icon: Schema.Maybe<string>;
              readonly url: string;
            }
          | { readonly __typename: "NoteDetail"; readonly note: string }
          | {
              readonly __typename: "ServiceDetail";
              readonly serviceId: string;
              readonly hasTaskState: boolean;
              readonly wasEverListed: boolean;
              readonly isCurrentlyListed: boolean;
              readonly fields: string;
              readonly lists: ReadonlyArray<{
                readonly __typename: "ServiceList";
                readonly id: string;
                readonly serviceId: string;
                readonly name: string;
                readonly url: Schema.Maybe<string>;
              }>;
            }
        >;
      }>;
    };
  }>;
};

export type ListTaskListQueryVariables = Schema.Exact<{
  taskList: Schema.Scalars["ID"];
}>;

export type ListTaskListQuery = {
  readonly __typename: "Query";
  readonly taskList: Schema.Maybe<
    | {
        readonly __typename: "Context";
        readonly items: {
          readonly __typename: "ItemSet";
          readonly items: ReadonlyArray<{
            readonly __typename: "Item";
            readonly id: string;
            readonly summary: string;
            readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
            readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
            readonly created: Schema.Scalars["DateTime"];
            readonly taskInfo: Schema.Maybe<{
              readonly __typename: "TaskInfo";
              readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly controller: Schema.Scalars["TaskController"];
            }>;
            readonly detail: Schema.Maybe<
              | {
                  readonly __typename: "FileDetail";
                  readonly size: number;
                  readonly filename: string;
                  readonly mimetype: string;
                }
              | {
                  readonly __typename: "LinkDetail";
                  readonly icon: Schema.Maybe<string>;
                  readonly url: string;
                }
              | { readonly __typename: "NoteDetail"; readonly note: string }
              | {
                  readonly __typename: "ServiceDetail";
                  readonly serviceId: string;
                  readonly hasTaskState: boolean;
                  readonly wasEverListed: boolean;
                  readonly isCurrentlyListed: boolean;
                  readonly fields: string;
                  readonly lists: ReadonlyArray<{
                    readonly __typename: "ServiceList";
                    readonly id: string;
                    readonly serviceId: string;
                    readonly name: string;
                    readonly url: Schema.Maybe<string>;
                  }>;
                }
            >;
          }>;
        };
        readonly sections: ReadonlyArray<{
          readonly __typename: "Section";
          readonly id: string;
          readonly name: string;
          readonly items: {
            readonly __typename: "ItemSet";
            readonly items: ReadonlyArray<{
              readonly __typename: "Item";
              readonly id: string;
              readonly summary: string;
              readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly created: Schema.Scalars["DateTime"];
              readonly taskInfo: Schema.Maybe<{
                readonly __typename: "TaskInfo";
                readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
                readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
                readonly controller: Schema.Scalars["TaskController"];
              }>;
              readonly detail: Schema.Maybe<
                | {
                    readonly __typename: "FileDetail";
                    readonly size: number;
                    readonly filename: string;
                    readonly mimetype: string;
                  }
                | {
                    readonly __typename: "LinkDetail";
                    readonly icon: Schema.Maybe<string>;
                    readonly url: string;
                  }
                | { readonly __typename: "NoteDetail"; readonly note: string }
                | {
                    readonly __typename: "ServiceDetail";
                    readonly serviceId: string;
                    readonly hasTaskState: boolean;
                    readonly wasEverListed: boolean;
                    readonly isCurrentlyListed: boolean;
                    readonly fields: string;
                    readonly lists: ReadonlyArray<{
                      readonly __typename: "ServiceList";
                      readonly id: string;
                      readonly serviceId: string;
                      readonly name: string;
                      readonly url: Schema.Maybe<string>;
                    }>;
                  }
              >;
            }>;
          };
        }>;
      }
    | {
        readonly __typename: "Project";
        readonly items: {
          readonly __typename: "ItemSet";
          readonly items: ReadonlyArray<{
            readonly __typename: "Item";
            readonly id: string;
            readonly summary: string;
            readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
            readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
            readonly created: Schema.Scalars["DateTime"];
            readonly taskInfo: Schema.Maybe<{
              readonly __typename: "TaskInfo";
              readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly controller: Schema.Scalars["TaskController"];
            }>;
            readonly detail: Schema.Maybe<
              | {
                  readonly __typename: "FileDetail";
                  readonly size: number;
                  readonly filename: string;
                  readonly mimetype: string;
                }
              | {
                  readonly __typename: "LinkDetail";
                  readonly icon: Schema.Maybe<string>;
                  readonly url: string;
                }
              | { readonly __typename: "NoteDetail"; readonly note: string }
              | {
                  readonly __typename: "ServiceDetail";
                  readonly serviceId: string;
                  readonly hasTaskState: boolean;
                  readonly wasEverListed: boolean;
                  readonly isCurrentlyListed: boolean;
                  readonly fields: string;
                  readonly lists: ReadonlyArray<{
                    readonly __typename: "ServiceList";
                    readonly id: string;
                    readonly serviceId: string;
                    readonly name: string;
                    readonly url: Schema.Maybe<string>;
                  }>;
                }
            >;
          }>;
        };
        readonly sections: ReadonlyArray<{
          readonly __typename: "Section";
          readonly id: string;
          readonly name: string;
          readonly items: {
            readonly __typename: "ItemSet";
            readonly items: ReadonlyArray<{
              readonly __typename: "Item";
              readonly id: string;
              readonly summary: string;
              readonly archived: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly snoozed: Schema.Maybe<Schema.Scalars["DateTime"]>;
              readonly created: Schema.Scalars["DateTime"];
              readonly taskInfo: Schema.Maybe<{
                readonly __typename: "TaskInfo";
                readonly due: Schema.Maybe<Schema.Scalars["DateTime"]>;
                readonly done: Schema.Maybe<Schema.Scalars["DateTime"]>;
                readonly controller: Schema.Scalars["TaskController"];
              }>;
              readonly detail: Schema.Maybe<
                | {
                    readonly __typename: "FileDetail";
                    readonly size: number;
                    readonly filename: string;
                    readonly mimetype: string;
                  }
                | {
                    readonly __typename: "LinkDetail";
                    readonly icon: Schema.Maybe<string>;
                    readonly url: string;
                  }
                | { readonly __typename: "NoteDetail"; readonly note: string }
                | {
                    readonly __typename: "ServiceDetail";
                    readonly serviceId: string;
                    readonly hasTaskState: boolean;
                    readonly wasEverListed: boolean;
                    readonly isCurrentlyListed: boolean;
                    readonly fields: string;
                    readonly lists: ReadonlyArray<{
                      readonly __typename: "ServiceList";
                      readonly id: string;
                      readonly serviceId: string;
                      readonly name: string;
                      readonly url: Schema.Maybe<string>;
                    }>;
                  }
              >;
            }>;
          };
        }>;
      }
  >;
};

export const OperationNames = {
  Query: {
    ListUsers: "ListUsers",
    ListInbox: "ListInbox",
    ListTaskList: "ListTaskList",
  },
  Mutation: {
    CreateUser: "CreateUser",
    DeleteUser: "DeleteUser",
    ChangePassword: "ChangePassword",
  },
  Fragment: {
    clientItemFields: "clientItemFields",
  },
};
export const ClientItemFieldsFragmentDoc = gql`
  fragment clientItemFields on Item {
    id
    summary
    archived
    snoozed
    created
    taskInfo {
      due
      done
      controller
    }
    detail {
      ... on FileDetail {
        size
        filename
        mimetype
      }
      ... on NoteDetail {
        note
      }
      ... on LinkDetail {
        icon
        url
      }
      ... on ServiceDetail {
        serviceId
        hasTaskState
        wasEverListed
        isCurrentlyListed
        fields
        lists {
          id
          serviceId
          name
          url
        }
      }
    }
  }
`;
export const CreateUserDocument = gql`
  mutation CreateUser($email: String!, $password: String!, $isAdmin: Boolean) {
    createUser(email: $email, password: $password, isAdmin: $isAdmin) {
      id
    }
  }
`;
export type CreateUserMutationFn = Apollo.MutationFunction<
  CreateUserMutation,
  CreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      isAdmin: // value for 'isAdmin'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserMutation,
    CreateUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(
    CreateUserDocument,
    options,
  );
}
export type CreateUserMutationHookResult = ReturnType<
  typeof useCreateUserMutation
>;
export type CreateUserMutationResult =
  Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<
  CreateUserMutation,
  CreateUserMutationVariables
>;
export const DeleteUserDocument = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
export type DeleteUserMutationFn = Apollo.MutationFunction<
  DeleteUserMutation,
  DeleteUserMutationVariables
>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUserMutation,
    DeleteUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(
    DeleteUserDocument,
    options,
  );
}
export type DeleteUserMutationHookResult = ReturnType<
  typeof useDeleteUserMutation
>;
export type DeleteUserMutationResult =
  Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<
  DeleteUserMutation,
  DeleteUserMutationVariables
>;
export const ChangePasswordDocument = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      id
    }
  }
`;
export type ChangePasswordMutationFn = Apollo.MutationFunction<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      currentPassword: // value for 'currentPassword'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useChangePasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ChangePasswordMutation,
    ChangePasswordMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ChangePasswordMutation,
    ChangePasswordMutationVariables
  >(ChangePasswordDocument, options);
}
export type ChangePasswordMutationHookResult = ReturnType<
  typeof useChangePasswordMutation
>;
export type ChangePasswordMutationResult =
  Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
export const ListUsersDocument = gql`
  query ListUsers {
    users {
      id
      email
      isAdmin
    }
  }
`;

/**
 * __useListUsersQuery__
 *
 * To run a query within a React component, call `useListUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListUsersQuery,
    ListUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ListUsersQuery, ListUsersQueryVariables>(
    ListUsersDocument,
    options,
  );
}
export function useListUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListUsersQuery,
    ListUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ListUsersQuery, ListUsersQueryVariables>(
    ListUsersDocument,
    options,
  );
}
export type ListUsersQueryHookResult = ReturnType<typeof useListUsersQuery>;
export type ListUsersLazyQueryHookResult = ReturnType<
  typeof useListUsersLazyQuery
>;
export type ListUsersQueryResult = Apollo.QueryResult<
  ListUsersQuery,
  ListUsersQueryVariables
>;
export function refetchListUsersQuery(variables?: ListUsersQueryVariables) {
  return { query: ListUsersDocument, variables: variables };
}
export const ListInboxDocument = gql`
  query ListInbox {
    user {
      inbox {
        items {
          ...clientItemFields
        }
      }
    }
  }
  ${ClientItemFieldsFragmentDoc}
`;

/**
 * __useListInboxQuery__
 *
 * To run a query within a React component, call `useListInboxQuery` and pass it any options that fit your needs.
 * When your component renders, `useListInboxQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListInboxQuery({
 *   variables: {
 *   },
 * });
 */
export function useListInboxQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListInboxQuery,
    ListInboxQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ListInboxQuery, ListInboxQueryVariables>(
    ListInboxDocument,
    options,
  );
}
export function useListInboxLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListInboxQuery,
    ListInboxQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ListInboxQuery, ListInboxQueryVariables>(
    ListInboxDocument,
    options,
  );
}
export type ListInboxQueryHookResult = ReturnType<typeof useListInboxQuery>;
export type ListInboxLazyQueryHookResult = ReturnType<
  typeof useListInboxLazyQuery
>;
export type ListInboxQueryResult = Apollo.QueryResult<
  ListInboxQuery,
  ListInboxQueryVariables
>;
export function refetchListInboxQuery(variables?: ListInboxQueryVariables) {
  return { query: ListInboxDocument, variables: variables };
}
export const ListTaskListDocument = gql`
  query ListTaskList($taskList: ID!) {
    taskList(id: $taskList) {
      items {
        items {
          ...clientItemFields
        }
      }
      sections {
        id
        name
        items {
          items {
            ...clientItemFields
          }
        }
      }
    }
  }
  ${ClientItemFieldsFragmentDoc}
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
export function useListTaskListQuery(
  baseOptions: Apollo.QueryHookOptions<
    ListTaskListQuery,
    ListTaskListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ListTaskListQuery, ListTaskListQueryVariables>(
    ListTaskListDocument,
    options,
  );
}
export function useListTaskListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListTaskListQuery,
    ListTaskListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ListTaskListQuery, ListTaskListQueryVariables>(
    ListTaskListDocument,
    options,
  );
}
export type ListTaskListQueryHookResult = ReturnType<
  typeof useListTaskListQuery
>;
export type ListTaskListLazyQueryHookResult = ReturnType<
  typeof useListTaskListLazyQuery
>;
export type ListTaskListQueryResult = Apollo.QueryResult<
  ListTaskListQuery,
  ListTaskListQueryVariables
>;
export function refetchListTaskListQuery(
  variables?: ListTaskListQueryVariables,
) {
  return { query: ListTaskListDocument, variables: variables };
}
