/* eslint-disable */
import * as Types from './types';

import { ItemFields_Task_Fragment, ItemFields_PluginItem_Fragment, ItemFields_File_Fragment, ItemFields_Note_Fragment, ItemFields_Link_Fragment, RootFields_User_Fragment, RootFields_Context_Fragment } from './fragments';
import { gql } from '@apollo/client';
import { ItemFieldsFragmentDoc, RootFieldsFragmentDoc } from './fragments';
import * as Apollo from '@apollo/client';
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
  params: Types.TaskParams;
}>;


export type CreateTaskMutation = { readonly __typename: 'Mutation', readonly createTask: (
    { readonly __typename: 'Task' }
    & ItemFields_Task_Fragment
  ) };

export type EditTaskMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  params: Types.TaskParams;
}>;


export type EditTaskMutation = { readonly __typename: 'Mutation', readonly editTask: Types.Maybe<(
    { readonly __typename: 'Task' }
    & ItemFields_Task_Fragment
  )> };

export type MoveItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  parent: Types.Maybe<Types.Scalars['ID']>;
  before: Types.Maybe<Types.Scalars['ID']>;
}>;


export type MoveItemMutation = { readonly __typename: 'Mutation', readonly moveItem: Types.Maybe<(
    { readonly __typename: 'Task' }
    & ItemFields_Task_Fragment
  ) | (
    { readonly __typename: 'PluginItem' }
    & ItemFields_PluginItem_Fragment
  ) | (
    { readonly __typename: 'File' }
    & ItemFields_File_Fragment
  ) | (
    { readonly __typename: 'Note' }
    & ItemFields_Note_Fragment
  ) | (
    { readonly __typename: 'Link' }
    & ItemFields_Link_Fragment
  )> };

export type DeleteItemMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type DeleteItemMutation = { readonly __typename: 'Mutation', readonly deleteItem: boolean };


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
        return Apollo.useMutation<CreateContextMutation, CreateContextMutationVariables>(CreateContextDocument, baseOptions);
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
        return Apollo.useMutation<EditContextMutation, EditContextMutationVariables>(EditContextDocument, baseOptions);
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
        return Apollo.useMutation<DeleteContextMutation, DeleteContextMutationVariables>(DeleteContextDocument, baseOptions);
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
        return Apollo.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument, baseOptions);
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
        return Apollo.useMutation<EditSectionMutation, EditSectionMutationVariables>(EditSectionDocument, baseOptions);
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
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
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
export const CreateTaskDocument = gql`
    mutation CreateTask($list: ID, $params: TaskParams!) {
  createTask(list: $list, params: $params) {
    ...itemFields
  }
}
    ${ItemFieldsFragmentDoc}`;
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
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateTaskMutation(baseOptions?: Apollo.MutationHookOptions<CreateTaskMutation, CreateTaskMutationVariables>) {
        return Apollo.useMutation<CreateTaskMutation, CreateTaskMutationVariables>(CreateTaskDocument, baseOptions);
      }
export type CreateTaskMutationHookResult = ReturnType<typeof useCreateTaskMutation>;
export type CreateTaskMutationResult = Apollo.MutationResult<CreateTaskMutation>;
export type CreateTaskMutationOptions = Apollo.BaseMutationOptions<CreateTaskMutation, CreateTaskMutationVariables>;
export const EditTaskDocument = gql`
    mutation EditTask($id: ID!, $params: TaskParams!) {
  editTask(id: $id, params: $params) {
    ...itemFields
  }
}
    ${ItemFieldsFragmentDoc}`;
export type EditTaskMutationFn = Apollo.MutationFunction<EditTaskMutation, EditTaskMutationVariables>;

/**
 * __useEditTaskMutation__
 *
 * To run a mutation, you first call `useEditTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editTaskMutation, { data, loading, error }] = useEditTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditTaskMutation(baseOptions?: Apollo.MutationHookOptions<EditTaskMutation, EditTaskMutationVariables>) {
        return Apollo.useMutation<EditTaskMutation, EditTaskMutationVariables>(EditTaskDocument, baseOptions);
      }
export type EditTaskMutationHookResult = ReturnType<typeof useEditTaskMutation>;
export type EditTaskMutationResult = Apollo.MutationResult<EditTaskMutation>;
export type EditTaskMutationOptions = Apollo.BaseMutationOptions<EditTaskMutation, EditTaskMutationVariables>;
export const MoveItemDocument = gql`
    mutation MoveItem($id: ID!, $parent: ID, $before: ID) {
  moveItem(id: $id, parent: $parent, before: $before) {
    ...itemFields
  }
}
    ${ItemFieldsFragmentDoc}`;
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
        return Apollo.useMutation<MoveItemMutation, MoveItemMutationVariables>(MoveItemDocument, baseOptions);
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
        return Apollo.useMutation<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, baseOptions);
      }
export type DeleteItemMutationHookResult = ReturnType<typeof useDeleteItemMutation>;
export type DeleteItemMutationResult = Apollo.MutationResult<DeleteItemMutation>;
export type DeleteItemMutationOptions = Apollo.BaseMutationOptions<DeleteItemMutation, DeleteItemMutationVariables>;