/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type LoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
}>;


export type LoginMutation = { readonly __typename?: 'Mutation', readonly login: Types.Maybe<{ readonly __typename?: 'User', readonly email: string }> };

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = { readonly __typename?: 'Mutation', readonly logout: Types.Maybe<boolean> };

export type CreateContextMutationVariables = Types.Exact<{
  params: Types.CreateContextParams;
}>;


export type CreateContextMutation = { readonly __typename?: 'Mutation', readonly createContext: { readonly __typename?: 'Context', readonly id: string, readonly name: string, readonly stub: string } };

export type DeleteContextMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteContextMutation = { readonly __typename?: 'Mutation', readonly deleteContext: boolean };

export type CreateSectionMutationVariables = Types.Exact<{
  taskList: Types.Maybe<Types.Scalars['ID']>;
  params: Types.CreateSectionParams;
}>;


export type CreateSectionMutation = { readonly __typename?: 'Mutation', readonly createSection: { readonly __typename?: 'Section', readonly id: string, readonly name: string } };

export type EditSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.EditSectionParams;
}>;


export type EditSectionMutation = { readonly __typename?: 'Mutation', readonly editSection: Types.Maybe<{ readonly __typename?: 'Section', readonly id: string, readonly name: string }> };

export type MoveSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskList: Types.Maybe<Types.Scalars['ID']>;
  index: Types.Maybe<Types.Scalars['Int']>;
}>;


export type MoveSectionMutation = { readonly __typename?: 'Mutation', readonly moveSection: Types.Maybe<{ readonly __typename?: 'Section', readonly id: string, readonly name: string }> };

export type DeleteSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteSectionMutation = { readonly __typename?: 'Mutation', readonly deleteSection: boolean };

export type CreateProjectMutationVariables = Types.Exact<{
  taskList: Types.Maybe<Types.Scalars['ID']>;
  params: Types.CreateProjectParams;
}>;


export type CreateProjectMutation = { readonly __typename?: 'Mutation', readonly createProject: { readonly __typename?: 'Project', readonly id: string, readonly name: string, readonly stub: string } };

export type EditProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.EditProjectParams;
}>;


export type EditProjectMutation = { readonly __typename?: 'Mutation', readonly editProject: Types.Maybe<{ readonly __typename?: 'Project', readonly id: string, readonly name: string, readonly stub: string }> };

export type MoveProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskList: Types.Maybe<Types.Scalars['ID']>;
}>;


export type MoveProjectMutation = { readonly __typename?: 'Mutation', readonly moveProject: Types.Maybe<{ readonly __typename?: 'Project', readonly id: string, readonly name: string, readonly stub: string }> };

export type DeleteProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteProjectMutation = { readonly __typename?: 'Mutation', readonly deleteProject: boolean };


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
export const CreateContextDocument = gql`
    mutation CreateContext($params: CreateContextParams!) {
  createContext(params: $params) {
    id
    name
    stub
  }
}
    `;
export type CreateContextMutationFn = Apollo.MutationFunction<CreateContextMutation, CreateContextMutationVariables>;

/**
 * __useCreateContextMutation__
 *
 * To run a mutation, you first call `useCreateContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createContextMutation, { data, loading, error }] = useCreateContextMutation({
 *   variables: {
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateContextMutation(baseOptions?: Apollo.MutationHookOptions<CreateContextMutation, CreateContextMutationVariables>) {
        return Apollo.useMutation<CreateContextMutation, CreateContextMutationVariables>(CreateContextDocument, baseOptions);
      }
export type CreateContextMutationHookResult = ReturnType<typeof useCreateContextMutation>;
export type CreateContextMutationResult = Apollo.MutationResult<CreateContextMutation>;
export type CreateContextMutationOptions = Apollo.BaseMutationOptions<CreateContextMutation, CreateContextMutationVariables>;
export const DeleteContextDocument = gql`
    mutation DeleteContext($id: ID!) {
  deleteContext(id: $id)
}
    `;
export type DeleteContextMutationFn = Apollo.MutationFunction<DeleteContextMutation, DeleteContextMutationVariables>;

/**
 * __useDeleteContextMutation__
 *
 * To run a mutation, you first call `useDeleteContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteContextMutation, { data, loading, error }] = useDeleteContextMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteContextMutation(baseOptions?: Apollo.MutationHookOptions<DeleteContextMutation, DeleteContextMutationVariables>) {
        return Apollo.useMutation<DeleteContextMutation, DeleteContextMutationVariables>(DeleteContextDocument, baseOptions);
      }
export type DeleteContextMutationHookResult = ReturnType<typeof useDeleteContextMutation>;
export type DeleteContextMutationResult = Apollo.MutationResult<DeleteContextMutation>;
export type DeleteContextMutationOptions = Apollo.BaseMutationOptions<DeleteContextMutation, DeleteContextMutationVariables>;
export const CreateSectionDocument = gql`
    mutation CreateSection($taskList: ID, $params: CreateSectionParams!) {
  createSection(taskList: $taskList, params: $params) {
    id
    name
  }
}
    `;
export type CreateSectionMutationFn = Apollo.MutationFunction<CreateSectionMutation, CreateSectionMutationVariables>;

/**
 * __useCreateSectionMutation__
 *
 * To run a mutation, you first call `useCreateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSectionMutation, { data, loading, error }] = useCreateSectionMutation({
 *   variables: {
 *      taskList: // value for 'taskList'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateSectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSectionMutation, CreateSectionMutationVariables>) {
        return Apollo.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument, baseOptions);
      }
export type CreateSectionMutationHookResult = ReturnType<typeof useCreateSectionMutation>;
export type CreateSectionMutationResult = Apollo.MutationResult<CreateSectionMutation>;
export type CreateSectionMutationOptions = Apollo.BaseMutationOptions<CreateSectionMutation, CreateSectionMutationVariables>;
export const EditSectionDocument = gql`
    mutation EditSection($id: ID!, $params: EditSectionParams!) {
  editSection(id: $id, params: $params) {
    id
    name
  }
}
    `;
export type EditSectionMutationFn = Apollo.MutationFunction<EditSectionMutation, EditSectionMutationVariables>;

/**
 * __useEditSectionMutation__
 *
 * To run a mutation, you first call `useEditSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editSectionMutation, { data, loading, error }] = useEditSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditSectionMutation(baseOptions?: Apollo.MutationHookOptions<EditSectionMutation, EditSectionMutationVariables>) {
        return Apollo.useMutation<EditSectionMutation, EditSectionMutationVariables>(EditSectionDocument, baseOptions);
      }
export type EditSectionMutationHookResult = ReturnType<typeof useEditSectionMutation>;
export type EditSectionMutationResult = Apollo.MutationResult<EditSectionMutation>;
export type EditSectionMutationOptions = Apollo.BaseMutationOptions<EditSectionMutation, EditSectionMutationVariables>;
export const MoveSectionDocument = gql`
    mutation MoveSection($id: ID!, $taskList: ID, $index: Int) {
  moveSection(id: $id, taskList: $taskList, index: $index) {
    id
    name
  }
}
    `;
export type MoveSectionMutationFn = Apollo.MutationFunction<MoveSectionMutation, MoveSectionMutationVariables>;

/**
 * __useMoveSectionMutation__
 *
 * To run a mutation, you first call `useMoveSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveSectionMutation, { data, loading, error }] = useMoveSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      taskList: // value for 'taskList'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useMoveSectionMutation(baseOptions?: Apollo.MutationHookOptions<MoveSectionMutation, MoveSectionMutationVariables>) {
        return Apollo.useMutation<MoveSectionMutation, MoveSectionMutationVariables>(MoveSectionDocument, baseOptions);
      }
export type MoveSectionMutationHookResult = ReturnType<typeof useMoveSectionMutation>;
export type MoveSectionMutationResult = Apollo.MutationResult<MoveSectionMutation>;
export type MoveSectionMutationOptions = Apollo.BaseMutationOptions<MoveSectionMutation, MoveSectionMutationVariables>;
export const DeleteSectionDocument = gql`
    mutation DeleteSection($id: ID!) {
  deleteSection(id: $id)
}
    `;
export type DeleteSectionMutationFn = Apollo.MutationFunction<DeleteSectionMutation, DeleteSectionMutationVariables>;

/**
 * __useDeleteSectionMutation__
 *
 * To run a mutation, you first call `useDeleteSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectionMutation, { data, loading, error }] = useDeleteSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSectionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSectionMutation, DeleteSectionMutationVariables>) {
        return Apollo.useMutation<DeleteSectionMutation, DeleteSectionMutationVariables>(DeleteSectionDocument, baseOptions);
      }
export type DeleteSectionMutationHookResult = ReturnType<typeof useDeleteSectionMutation>;
export type DeleteSectionMutationResult = Apollo.MutationResult<DeleteSectionMutation>;
export type DeleteSectionMutationOptions = Apollo.BaseMutationOptions<DeleteSectionMutation, DeleteSectionMutationVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($taskList: ID, $params: CreateProjectParams!) {
  createProject(taskList: $taskList, params: $params) {
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
 *      taskList: // value for 'taskList'
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
export const EditProjectDocument = gql`
    mutation EditProject($id: ID!, $params: EditProjectParams!) {
  editProject(id: $id, params: $params) {
    id
    name
    stub
  }
}
    `;
export type EditProjectMutationFn = Apollo.MutationFunction<EditProjectMutation, EditProjectMutationVariables>;

/**
 * __useEditProjectMutation__
 *
 * To run a mutation, you first call `useEditProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editProjectMutation, { data, loading, error }] = useEditProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditProjectMutation(baseOptions?: Apollo.MutationHookOptions<EditProjectMutation, EditProjectMutationVariables>) {
        return Apollo.useMutation<EditProjectMutation, EditProjectMutationVariables>(EditProjectDocument, baseOptions);
      }
export type EditProjectMutationHookResult = ReturnType<typeof useEditProjectMutation>;
export type EditProjectMutationResult = Apollo.MutationResult<EditProjectMutation>;
export type EditProjectMutationOptions = Apollo.BaseMutationOptions<EditProjectMutation, EditProjectMutationVariables>;
export const MoveProjectDocument = gql`
    mutation MoveProject($id: ID!, $taskList: ID) {
  moveProject(id: $id, taskList: $taskList) {
    id
    name
    stub
  }
}
    `;
export type MoveProjectMutationFn = Apollo.MutationFunction<MoveProjectMutation, MoveProjectMutationVariables>;

/**
 * __useMoveProjectMutation__
 *
 * To run a mutation, you first call `useMoveProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveProjectMutation, { data, loading, error }] = useMoveProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      taskList: // value for 'taskList'
 *   },
 * });
 */
export function useMoveProjectMutation(baseOptions?: Apollo.MutationHookOptions<MoveProjectMutation, MoveProjectMutationVariables>) {
        return Apollo.useMutation<MoveProjectMutation, MoveProjectMutationVariables>(MoveProjectDocument, baseOptions);
      }
export type MoveProjectMutationHookResult = ReturnType<typeof useMoveProjectMutation>;
export type MoveProjectMutationResult = Apollo.MutationResult<MoveProjectMutation>;
export type MoveProjectMutationOptions = Apollo.BaseMutationOptions<MoveProjectMutation, MoveProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation DeleteProject($id: ID!) {
  deleteProject(id: $id)
}
    `;
export type DeleteProjectMutationFn = Apollo.MutationFunction<DeleteProjectMutation, DeleteProjectMutationVariables>;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, baseOptions);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;