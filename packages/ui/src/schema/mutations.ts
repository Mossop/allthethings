/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type ItemFieldsFragment = { readonly __typename: 'Item', readonly id: string, readonly summary: string, readonly archived: Types.Maybe<any>, readonly snoozed: Types.Maybe<any>, readonly created: any, readonly taskInfo: Types.Maybe<{ readonly __typename: 'TaskInfo', readonly due: Types.Maybe<any>, readonly done: Types.Maybe<any> }>, readonly detail: Types.Maybe<{ readonly __typename: 'PluginDetail', readonly pluginId: string, readonly fields: string } | { readonly __typename: 'LinkDetail', readonly icon: Types.Maybe<string>, readonly url: string } | { readonly __typename: 'NoteDetail', readonly note: string } | { readonly __typename: 'FileDetail', readonly size: number, readonly filename: string, readonly mimetype: string }> };

export type EditTaskInfoMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  taskInfo: Types.Maybe<Types.TaskInfoParams>;
}>;


export type EditTaskInfoMutation = { readonly __typename: 'Mutation', readonly editTaskInfo: Types.Maybe<(
    { readonly __typename: 'Item' }
    & ItemFieldsFragment
  )> };

export const ItemFieldsFragmentDoc = gql`
    fragment itemFields on Item {
  id
  summary
  archived
  snoozed
  created
  taskInfo {
    due
    done
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
    ... on PluginDetail {
      pluginId
      fields
    }
  }
}
    `;
export const EditTaskInfoDocument = gql`
    mutation EditTaskInfo($id: ID!, $taskInfo: TaskInfoParams) {
  editTaskInfo(id: $id, taskInfo: $taskInfo) {
    ...itemFields
  }
}
    ${ItemFieldsFragmentDoc}`;
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