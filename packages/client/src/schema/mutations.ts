/* eslint-disable */
import * as Types from './types';

import * as Operations from './operations';
import * as Apollo from '@apollo/client';

export type LoginMutationFn = Apollo.MutationFunction<Operations.LoginMutation, Operations.LoginMutationVariables>;

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
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<Operations.LoginMutation, Operations.LoginMutationVariables>) {
        return Apollo.useMutation<Operations.LoginMutation, Operations.LoginMutationVariables>(Operations.Login, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<Operations.LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<Operations.LoginMutation, Operations.LoginMutationVariables>;
export type LogoutMutationFn = Apollo.MutationFunction<Operations.LogoutMutation, Operations.LogoutMutationVariables>;

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
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<Operations.LogoutMutation, Operations.LogoutMutationVariables>) {
        return Apollo.useMutation<Operations.LogoutMutation, Operations.LogoutMutationVariables>(Operations.Logout, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<Operations.LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<Operations.LogoutMutation, Operations.LogoutMutationVariables>;
export type CreateNamedContextMutationFn = Apollo.MutationFunction<Operations.CreateNamedContextMutation, Operations.CreateNamedContextMutationVariables>;

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
export function useCreateNamedContextMutation(baseOptions?: Apollo.MutationHookOptions<Operations.CreateNamedContextMutation, Operations.CreateNamedContextMutationVariables>) {
        return Apollo.useMutation<Operations.CreateNamedContextMutation, Operations.CreateNamedContextMutationVariables>(Operations.CreateNamedContext, baseOptions);
      }
export type CreateNamedContextMutationHookResult = ReturnType<typeof useCreateNamedContextMutation>;
export type CreateNamedContextMutationResult = Apollo.MutationResult<Operations.CreateNamedContextMutation>;
export type CreateNamedContextMutationOptions = Apollo.BaseMutationOptions<Operations.CreateNamedContextMutation, Operations.CreateNamedContextMutationVariables>;
export type CreateProjectMutationFn = Apollo.MutationFunction<Operations.CreateProjectMutation, Operations.CreateProjectMutationVariables>;

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
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<Operations.CreateProjectMutation, Operations.CreateProjectMutationVariables>) {
        return Apollo.useMutation<Operations.CreateProjectMutation, Operations.CreateProjectMutationVariables>(Operations.CreateProject, baseOptions);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<Operations.CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<Operations.CreateProjectMutation, Operations.CreateProjectMutationVariables>;