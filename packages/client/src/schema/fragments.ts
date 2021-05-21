/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
export type RootFields_Context_Fragment = { readonly __typename: 'Context', readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }> }> };

export type RootFields_User_Fragment = { readonly __typename: 'User', readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }> }> };

export type RootFieldsFragment = RootFields_Context_Fragment | RootFields_User_Fragment;

export type ItemFieldsFragment = { readonly __typename: 'Item', readonly id: string, readonly summary: string, readonly archived: Types.Maybe<any>, readonly snoozed: Types.Maybe<any>, readonly created: any, readonly taskInfo: Types.Maybe<{ readonly __typename: 'TaskInfo', readonly due: Types.Maybe<any>, readonly done: Types.Maybe<any>, readonly controller: string }>, readonly detail: Types.Maybe<{ readonly __typename: 'PluginDetail', readonly pluginId: string, readonly hasTaskState: boolean, readonly wasEverListed: boolean, readonly isCurrentlyListed: boolean, readonly fields: string } | { readonly __typename: 'LinkDetail', readonly icon: Types.Maybe<string>, readonly url: string } | { readonly __typename: 'NoteDetail', readonly note: string } | { readonly __typename: 'FileDetail', readonly size: number, readonly filename: string, readonly mimetype: string }> };

export const RootFieldsFragmentDoc = gql`
    fragment rootFields on ProjectRoot {
  remainingTasks
  subprojects {
    id
  }
  projects {
    id
    stub
    name
    remainingTasks
    subprojects {
      id
    }
  }
}
    `;
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
    ... on PluginDetail {
      pluginId
      hasTaskState
      wasEverListed
      isCurrentlyListed
      fields
    }
  }
}
    `;