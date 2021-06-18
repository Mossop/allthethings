/* eslint-disable */
import * as Types from './types';

import { ClientItemFieldsFragment } from './fragments';
import { gql } from '@apollo/client';
import { ClientItemFieldsFragmentDoc } from './fragments';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type LoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
}>;


export type LoginMutation = { readonly __typename: 'Mutation', readonly login: Types.Maybe<{ readonly __typename: 'User', readonly email: string }> };

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = { readonly __typename: 'Mutation', readonly logout: Types.Maybe<boolean> };

export type CreateContextMutationVariables = Types.Exact<{
  params: Types.ContextParams;
}>;


export type CreateContextMutation = { readonly __typename: 'Mutation', readonly createContext: { readonly __typename: 'Context', readonly id: string, readonly name: string, readonly stub: string } };

export type EditContextMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.ContextParams;
}>;


export type EditContextMutation = { readonly __typename: 'Mutation', readonly editContext: Types.Maybe<{ readonly __typename: 'Context', readonly id: string, readonly name: string, readonly stub: string }> };

export type DeleteContextMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteContextMutation = { readonly __typename: 'Mutation', readonly deleteContext: boolean };

export type CreateSectionMutationVariables = Types.Exact<{
  taskList: Types.Maybe<Types.Scalars['ID']>;
  params: Types.SectionParams;
}>;


export type CreateSectionMutation = { readonly __typename: 'Mutation', readonly createSection: { readonly __typename: 'Section', readonly id: string, readonly name: string } };

export type EditSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.SectionParams;
}>;


export type EditSectionMutation = { readonly __typename: 'Mutation', readonly editSection: Types.Maybe<{ readonly __typename: 'Section', readonly id: string, readonly name: string }> };

export type MoveSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskList: Types.Maybe<Types.Scalars['ID']>;
  before: Types.Maybe<Types.Scalars['ID']>;
}>;


export type MoveSectionMutation = { readonly __typename: 'Mutation', readonly moveSection: Types.Maybe<{ readonly __typename: 'Section', readonly id: string, readonly name: string }> };

export type DeleteSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteSectionMutation = { readonly __typename: 'Mutation', readonly deleteSection: boolean };

export type CreateProjectMutationVariables = Types.Exact<{
  taskList: Types.Maybe<Types.Scalars['ID']>;
  params: Types.ProjectParams;
}>;


export type CreateProjectMutation = { readonly __typename: 'Mutation', readonly createProject: { readonly __typename: 'Project', readonly id: string, readonly name: string, readonly stub: string } };

export type EditProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.ProjectParams;
}>;


export type EditProjectMutation = { readonly __typename: 'Mutation', readonly editProject: Types.Maybe<{ readonly __typename: 'Project', readonly id: string, readonly name: string, readonly stub: string }> };

export type MoveProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskList: Types.Maybe<Types.Scalars['ID']>;
}>;


export type MoveProjectMutation = { readonly __typename: 'Mutation', readonly moveProject: Types.Maybe<{ readonly __typename: 'Project', readonly id: string, readonly name: string, readonly stub: string }> };

export type DeleteProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteProjectMutation = { readonly __typename: 'Mutation', readonly deleteProject: boolean };

export type CreateTaskMutationVariables = Types.Exact<{
  list: Types.Maybe<Types.Scalars['ID']>;
  item: Types.ItemParams;
}>;


export type CreateTaskMutation = { readonly __typename: 'Mutation', readonly createTask: (
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  ) };

export type CreateLinkMutationVariables = Types.Exact<{
  list: Types.Maybe<Types.Scalars['ID']>;
  item: Types.ItemParams;
  detail: Types.LinkDetailParams;
  isTask: Types.Scalars['Boolean'];
}>;


export type CreateLinkMutation = { readonly __typename: 'Mutation', readonly createLink: (
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  ) };

export type EditItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  item: Types.ItemParams;
}>;


export type EditItemMutation = { readonly __typename: 'Mutation', readonly editItem: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type EditTaskInfoMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskInfo: Types.Maybe<Types.TaskInfoParams>;
}>;


export type EditTaskInfoMutation = { readonly __typename: 'Mutation', readonly editTaskInfo: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type EditTaskControllerMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  controller: Types.Maybe<Types.Scalars['String']>;
}>;


export type EditTaskControllerMutation = { readonly __typename: 'Mutation', readonly editTaskController: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type MoveItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  parent: Types.Maybe<Types.Scalars['ID']>;
  before: Types.Maybe<Types.Scalars['ID']>;
}>;


export type MoveItemMutation = { readonly __typename: 'Mutation', readonly moveItem: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type DeleteItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteItemMutation = { readonly __typename: 'Mutation', readonly deleteItem: boolean };

export type ArchiveItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  archived: Types.Maybe<Types.Scalars['DateTime']>;
}>;


export type ArchiveItemMutation = { readonly __typename: 'Mutation', readonly archiveItem: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type SnoozeItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  snoozed: Types.Maybe<Types.Scalars['DateTime']>;
}>;


export type SnoozeItemMutation = { readonly __typename: 'Mutation', readonly snoozeItem: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type MarkItemDueMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  due: Types.Maybe<Types.Scalars['DateTime']>;
}>;


export type MarkItemDueMutation = { readonly __typename: 'Mutation', readonly markItemDue: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ClientItemFieldsFragment
  )> };

export type CreateUserMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
  isAdmin: Types.Maybe<Types.Scalars['Boolean']>;
}>;


export type CreateUserMutation = { readonly __typename: 'Mutation', readonly createUser: { readonly __typename: 'User', readonly id: string } };

export type DeleteUserMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteUserMutation = { readonly __typename: 'Mutation', readonly deleteUser: Types.Maybe<boolean> };

export type ChangePasswordMutationVariables = Types.Exact<{
  currentPassword: Types.Scalars['String'];
  newPassword: Types.Scalars['String'];
}>;


export type ChangePasswordMutation = { readonly __typename: 'Mutation', readonly changePassword: Types.Maybe<{ readonly __typename: 'User', readonly id: string }> };


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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const CreateContextDocument = gql`
    mutation CreateContext($params: ContextParams!) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateContextMutation, CreateContextMutationVariables>(CreateContextDocument, options);
      }
export type CreateContextMutationHookResult = ReturnType<typeof useCreateContextMutation>;
export type CreateContextMutationResult = Apollo.MutationResult<CreateContextMutation>;
export type CreateContextMutationOptions = Apollo.BaseMutationOptions<CreateContextMutation, CreateContextMutationVariables>;
export const EditContextDocument = gql`
    mutation EditContext($id: ID!, $params: ContextParams!) {
  editContext(id: $id, params: $params) {
    id
    name
    stub
  }
}
    `;
export type EditContextMutationFn = Apollo.MutationFunction<EditContextMutation, EditContextMutationVariables>;

/**
 * __useEditContextMutation__
 *
 * To run a mutation, you first call `useEditContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editContextMutation, { data, loading, error }] = useEditContextMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditContextMutation(baseOptions?: Apollo.MutationHookOptions<EditContextMutation, EditContextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditContextMutation, EditContextMutationVariables>(EditContextDocument, options);
      }
export type EditContextMutationHookResult = ReturnType<typeof useEditContextMutation>;
export type EditContextMutationResult = Apollo.MutationResult<EditContextMutation>;
export type EditContextMutationOptions = Apollo.BaseMutationOptions<EditContextMutation, EditContextMutationVariables>;
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteContextMutation, DeleteContextMutationVariables>(DeleteContextDocument, options);
      }
export type DeleteContextMutationHookResult = ReturnType<typeof useDeleteContextMutation>;
export type DeleteContextMutationResult = Apollo.MutationResult<DeleteContextMutation>;
export type DeleteContextMutationOptions = Apollo.BaseMutationOptions<DeleteContextMutation, DeleteContextMutationVariables>;
export const CreateSectionDocument = gql`
    mutation CreateSection($taskList: ID, $params: SectionParams!) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument, options);
      }
export type CreateSectionMutationHookResult = ReturnType<typeof useCreateSectionMutation>;
export type CreateSectionMutationResult = Apollo.MutationResult<CreateSectionMutation>;
export type CreateSectionMutationOptions = Apollo.BaseMutationOptions<CreateSectionMutation, CreateSectionMutationVariables>;
export const EditSectionDocument = gql`
    mutation EditSection($id: ID!, $params: SectionParams!) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditSectionMutation, EditSectionMutationVariables>(EditSectionDocument, options);
      }
export type EditSectionMutationHookResult = ReturnType<typeof useEditSectionMutation>;
export type EditSectionMutationResult = Apollo.MutationResult<EditSectionMutation>;
export type EditSectionMutationOptions = Apollo.BaseMutationOptions<EditSectionMutation, EditSectionMutationVariables>;
export const MoveSectionDocument = gql`
    mutation MoveSection($id: ID!, $taskList: ID, $before: ID) {
  moveSection(id: $id, taskList: $taskList, before: $before) {
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
 *      before: // value for 'before'
 *   },
 * });
 */
export function useMoveSectionMutation(baseOptions?: Apollo.MutationHookOptions<MoveSectionMutation, MoveSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveSectionMutation, MoveSectionMutationVariables>(MoveSectionDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSectionMutation, DeleteSectionMutationVariables>(DeleteSectionDocument, options);
      }
export type DeleteSectionMutationHookResult = ReturnType<typeof useDeleteSectionMutation>;
export type DeleteSectionMutationResult = Apollo.MutationResult<DeleteSectionMutation>;
export type DeleteSectionMutationOptions = Apollo.BaseMutationOptions<DeleteSectionMutation, DeleteSectionMutationVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($taskList: ID, $params: ProjectParams!) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const EditProjectDocument = gql`
    mutation EditProject($id: ID!, $params: ProjectParams!) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditProjectMutation, EditProjectMutationVariables>(EditProjectDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveProjectMutation, MoveProjectMutationVariables>(MoveProjectDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, options);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const CreateTaskDocument = gql`
    mutation CreateTask($list: ID, $item: ItemParams!) {
  createTask(list: $list, item: $item) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type CreateTaskMutationFn = Apollo.MutationFunction<CreateTaskMutation, CreateTaskMutationVariables>;

/**
 * __useCreateTaskMutation__
 *
 * To run a mutation, you first call `useCreateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTaskMutation, { data, loading, error }] = useCreateTaskMutation({
 *   variables: {
 *      list: // value for 'list'
 *      item: // value for 'item'
 *   },
 * });
 */
export function useCreateTaskMutation(baseOptions?: Apollo.MutationHookOptions<CreateTaskMutation, CreateTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTaskMutation, CreateTaskMutationVariables>(CreateTaskDocument, options);
      }
export type CreateTaskMutationHookResult = ReturnType<typeof useCreateTaskMutation>;
export type CreateTaskMutationResult = Apollo.MutationResult<CreateTaskMutation>;
export type CreateTaskMutationOptions = Apollo.BaseMutationOptions<CreateTaskMutation, CreateTaskMutationVariables>;
export const CreateLinkDocument = gql`
    mutation CreateLink($list: ID, $item: ItemParams!, $detail: LinkDetailParams!, $isTask: Boolean!) {
  createLink(list: $list, item: $item, detail: $detail, isTask: $isTask) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type CreateLinkMutationFn = Apollo.MutationFunction<CreateLinkMutation, CreateLinkMutationVariables>;

/**
 * __useCreateLinkMutation__
 *
 * To run a mutation, you first call `useCreateLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLinkMutation, { data, loading, error }] = useCreateLinkMutation({
 *   variables: {
 *      list: // value for 'list'
 *      item: // value for 'item'
 *      detail: // value for 'detail'
 *      isTask: // value for 'isTask'
 *   },
 * });
 */
export function useCreateLinkMutation(baseOptions?: Apollo.MutationHookOptions<CreateLinkMutation, CreateLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateLinkMutation, CreateLinkMutationVariables>(CreateLinkDocument, options);
      }
export type CreateLinkMutationHookResult = ReturnType<typeof useCreateLinkMutation>;
export type CreateLinkMutationResult = Apollo.MutationResult<CreateLinkMutation>;
export type CreateLinkMutationOptions = Apollo.BaseMutationOptions<CreateLinkMutation, CreateLinkMutationVariables>;
export const EditItemDocument = gql`
    mutation EditItem($id: ID!, $item: ItemParams!) {
  editItem(id: $id, item: $item) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type EditItemMutationFn = Apollo.MutationFunction<EditItemMutation, EditItemMutationVariables>;

/**
 * __useEditItemMutation__
 *
 * To run a mutation, you first call `useEditItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editItemMutation, { data, loading, error }] = useEditItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      item: // value for 'item'
 *   },
 * });
 */
export function useEditItemMutation(baseOptions?: Apollo.MutationHookOptions<EditItemMutation, EditItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditItemMutation, EditItemMutationVariables>(EditItemDocument, options);
      }
export type EditItemMutationHookResult = ReturnType<typeof useEditItemMutation>;
export type EditItemMutationResult = Apollo.MutationResult<EditItemMutation>;
export type EditItemMutationOptions = Apollo.BaseMutationOptions<EditItemMutation, EditItemMutationVariables>;
export const EditTaskInfoDocument = gql`
    mutation EditTaskInfo($id: ID!, $taskInfo: TaskInfoParams) {
  editTaskInfo(id: $id, taskInfo: $taskInfo) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type EditTaskInfoMutationFn = Apollo.MutationFunction<EditTaskInfoMutation, EditTaskInfoMutationVariables>;

/**
 * __useEditTaskInfoMutation__
 *
 * To run a mutation, you first call `useEditTaskInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditTaskInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editTaskInfoMutation, { data, loading, error }] = useEditTaskInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      taskInfo: // value for 'taskInfo'
 *   },
 * });
 */
export function useEditTaskInfoMutation(baseOptions?: Apollo.MutationHookOptions<EditTaskInfoMutation, EditTaskInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditTaskInfoMutation, EditTaskInfoMutationVariables>(EditTaskInfoDocument, options);
      }
export type EditTaskInfoMutationHookResult = ReturnType<typeof useEditTaskInfoMutation>;
export type EditTaskInfoMutationResult = Apollo.MutationResult<EditTaskInfoMutation>;
export type EditTaskInfoMutationOptions = Apollo.BaseMutationOptions<EditTaskInfoMutation, EditTaskInfoMutationVariables>;
export const EditTaskControllerDocument = gql`
    mutation EditTaskController($id: ID!, $controller: String) {
  editTaskController(id: $id, controller: $controller) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type EditTaskControllerMutationFn = Apollo.MutationFunction<EditTaskControllerMutation, EditTaskControllerMutationVariables>;

/**
 * __useEditTaskControllerMutation__
 *
 * To run a mutation, you first call `useEditTaskControllerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditTaskControllerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editTaskControllerMutation, { data, loading, error }] = useEditTaskControllerMutation({
 *   variables: {
 *      id: // value for 'id'
 *      controller: // value for 'controller'
 *   },
 * });
 */
export function useEditTaskControllerMutation(baseOptions?: Apollo.MutationHookOptions<EditTaskControllerMutation, EditTaskControllerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditTaskControllerMutation, EditTaskControllerMutationVariables>(EditTaskControllerDocument, options);
      }
export type EditTaskControllerMutationHookResult = ReturnType<typeof useEditTaskControllerMutation>;
export type EditTaskControllerMutationResult = Apollo.MutationResult<EditTaskControllerMutation>;
export type EditTaskControllerMutationOptions = Apollo.BaseMutationOptions<EditTaskControllerMutation, EditTaskControllerMutationVariables>;
export const MoveItemDocument = gql`
    mutation MoveItem($id: ID!, $parent: ID, $before: ID) {
  moveItem(id: $id, parent: $parent, before: $before) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type MoveItemMutationFn = Apollo.MutationFunction<MoveItemMutation, MoveItemMutationVariables>;

/**
 * __useMoveItemMutation__
 *
 * To run a mutation, you first call `useMoveItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveItemMutation, { data, loading, error }] = useMoveItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      parent: // value for 'parent'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useMoveItemMutation(baseOptions?: Apollo.MutationHookOptions<MoveItemMutation, MoveItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveItemMutation, MoveItemMutationVariables>(MoveItemDocument, options);
      }
export type MoveItemMutationHookResult = ReturnType<typeof useMoveItemMutation>;
export type MoveItemMutationResult = Apollo.MutationResult<MoveItemMutation>;
export type MoveItemMutationOptions = Apollo.BaseMutationOptions<MoveItemMutation, MoveItemMutationVariables>;
export const DeleteItemDocument = gql`
    mutation DeleteItem($id: ID!) {
  deleteItem(id: $id)
}
    `;
export type DeleteItemMutationFn = Apollo.MutationFunction<DeleteItemMutation, DeleteItemMutationVariables>;

/**
 * __useDeleteItemMutation__
 *
 * To run a mutation, you first call `useDeleteItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteItemMutation, { data, loading, error }] = useDeleteItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteItemMutation, DeleteItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, options);
      }
export type DeleteItemMutationHookResult = ReturnType<typeof useDeleteItemMutation>;
export type DeleteItemMutationResult = Apollo.MutationResult<DeleteItemMutation>;
export type DeleteItemMutationOptions = Apollo.BaseMutationOptions<DeleteItemMutation, DeleteItemMutationVariables>;
export const ArchiveItemDocument = gql`
    mutation ArchiveItem($id: ID!, $archived: DateTime) {
  archiveItem(id: $id, archived: $archived) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type ArchiveItemMutationFn = Apollo.MutationFunction<ArchiveItemMutation, ArchiveItemMutationVariables>;

/**
 * __useArchiveItemMutation__
 *
 * To run a mutation, you first call `useArchiveItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveItemMutation, { data, loading, error }] = useArchiveItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      archived: // value for 'archived'
 *   },
 * });
 */
export function useArchiveItemMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveItemMutation, ArchiveItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveItemMutation, ArchiveItemMutationVariables>(ArchiveItemDocument, options);
      }
export type ArchiveItemMutationHookResult = ReturnType<typeof useArchiveItemMutation>;
export type ArchiveItemMutationResult = Apollo.MutationResult<ArchiveItemMutation>;
export type ArchiveItemMutationOptions = Apollo.BaseMutationOptions<ArchiveItemMutation, ArchiveItemMutationVariables>;
export const SnoozeItemDocument = gql`
    mutation SnoozeItem($id: ID!, $snoozed: DateTime) {
  snoozeItem(id: $id, snoozed: $snoozed) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type SnoozeItemMutationFn = Apollo.MutationFunction<SnoozeItemMutation, SnoozeItemMutationVariables>;

/**
 * __useSnoozeItemMutation__
 *
 * To run a mutation, you first call `useSnoozeItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSnoozeItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [snoozeItemMutation, { data, loading, error }] = useSnoozeItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      snoozed: // value for 'snoozed'
 *   },
 * });
 */
export function useSnoozeItemMutation(baseOptions?: Apollo.MutationHookOptions<SnoozeItemMutation, SnoozeItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SnoozeItemMutation, SnoozeItemMutationVariables>(SnoozeItemDocument, options);
      }
export type SnoozeItemMutationHookResult = ReturnType<typeof useSnoozeItemMutation>;
export type SnoozeItemMutationResult = Apollo.MutationResult<SnoozeItemMutation>;
export type SnoozeItemMutationOptions = Apollo.BaseMutationOptions<SnoozeItemMutation, SnoozeItemMutationVariables>;
export const MarkItemDueDocument = gql`
    mutation MarkItemDue($id: ID!, $due: DateTime) {
  markItemDue(id: $id, due: $due) {
    ...clientItemFields
  }
}
    ${ClientItemFieldsFragmentDoc}`;
export type MarkItemDueMutationFn = Apollo.MutationFunction<MarkItemDueMutation, MarkItemDueMutationVariables>;

/**
 * __useMarkItemDueMutation__
 *
 * To run a mutation, you first call `useMarkItemDueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkItemDueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markItemDueMutation, { data, loading, error }] = useMarkItemDueMutation({
 *   variables: {
 *      id: // value for 'id'
 *      due: // value for 'due'
 *   },
 * });
 */
export function useMarkItemDueMutation(baseOptions?: Apollo.MutationHookOptions<MarkItemDueMutation, MarkItemDueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkItemDueMutation, MarkItemDueMutationVariables>(MarkItemDueDocument, options);
      }
export type MarkItemDueMutationHookResult = ReturnType<typeof useMarkItemDueMutation>;
export type MarkItemDueMutationResult = Apollo.MutationResult<MarkItemDueMutation>;
export type MarkItemDueMutationOptions = Apollo.BaseMutationOptions<MarkItemDueMutation, MarkItemDueMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($email: String!, $password: String!, $isAdmin: Boolean) {
  createUser(email: $email, password: $password, isAdmin: $isAdmin) {
    id
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

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
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

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
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
    id
  }
}
    `;
export type ChangePasswordMutationFn = Apollo.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

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
export function useChangePasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, options);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;