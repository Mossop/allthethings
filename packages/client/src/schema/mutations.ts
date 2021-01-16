/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type LoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login?: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'email'>
  )> }
);

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'logout'>
);

export type CreateNamedContextMutationVariables = Types.Exact<{
  params: Types.CreateNamedContextParams;
}>;


export type CreateNamedContextMutation = (
  { __typename?: 'Mutation' }
  & { createNamedContext: (
    { __typename?: 'NamedContext' }
    & Pick<Types.NamedContext, 'id' | 'name' | 'stub'>
  ) }
);

export type CreateProjectMutationVariables = Types.Exact<{
  params: Types.CreateProjectParams;
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject: (
    { __typename?: 'Project' }
    & Pick<Types.Project, 'id' | 'name' | 'stub'>
  ) }
);


export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    email
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const CreateNamedContextDocument = gql`
    mutation CreateNamedContext($params: CreateNamedContextParams!) {
  createNamedContext(params: $params) {
    id
    name
    stub
  }
}
    `;
export type CreateNamedContextMutationFn = Apollo.MutationFunction<CreateNamedContextMutation, CreateNamedContextMutationVariables>;

/**
 * __useCreateNamedContextMutation__
 *
 * To run a mutation, you first call `useCreateNamedContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNamedContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNamedContextMutation, { data, loading, error }] = useCreateNamedContextMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateNamedContextMutation(baseOptions?: Apollo.MutationHookOptions<CreateNamedContextMutation, CreateNamedContextMutationVariables>) {
        return Apollo.useMutation<CreateNamedContextMutation, CreateNamedContextMutationVariables>(CreateNamedContextDocument, baseOptions);
      }
export type CreateNamedContextMutationHookResult = ReturnType<typeof useCreateNamedContextMutation>;
export type CreateNamedContextMutationResult = Apollo.MutationResult<CreateNamedContextMutation>;
export type CreateNamedContextMutationOptions = Apollo.BaseMutationOptions<CreateNamedContextMutation, CreateNamedContextMutationVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($params: CreateProjectParams!) {
  createProject(params: $params) {
    id
    name
    stub
  }
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;