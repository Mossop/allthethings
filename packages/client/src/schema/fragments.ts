/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
export type RootFields_User_Fragment = { readonly __typename: 'User', readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }> }> };

export type RootFields_Context_Fragment = { readonly __typename: 'Context', readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }>, readonly projects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly remainingTasks: number, readonly subprojects: ReadonlyArray<{ readonly __typename: 'Project', readonly id: string }> }> };

export type RootFieldsFragment = RootFields_User_Fragment | RootFields_Context_Fragment;

export type ItemFields_Task_Fragment = { readonly __typename: 'Task', readonly due: Types.Maybe<any>, readonly done: Types.Maybe<any>, readonly id: string, readonly summary: string, readonly archived: boolean, readonly created: any };

export type ItemFields_PluginItem_Fragment = { readonly __typename: 'PluginItem', readonly done: Types.Maybe<any>, readonly due: Types.Maybe<any>, readonly pluginId: string, readonly id: string, readonly summary: string, readonly archived: boolean, readonly created: any };

export type ItemFields_File_Fragment = { readonly __typename: 'File', readonly size: number, readonly filename: string, readonly mimetype: string, readonly id: string, readonly summary: string, readonly archived: boolean, readonly created: any };

export type ItemFields_Note_Fragment = { readonly __typename: 'Note', readonly note: string, readonly id: string, readonly summary: string, readonly archived: boolean, readonly created: any };

export type ItemFields_Link_Fragment = { readonly __typename: 'Link', readonly icon: Types.Maybe<string>, readonly link: string, readonly id: string, readonly summary: string, readonly archived: boolean, readonly created: any };

export type ItemFieldsFragment = ItemFields_Task_Fragment | ItemFields_PluginItem_Fragment | ItemFields_File_Fragment | ItemFields_Note_Fragment | ItemFields_Link_Fragment;

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
  created
  ... on Task {
    due
    done
  }
  ... on File {
    size
    filename
    mimetype
  }
  ... on Note {
    note
  }
  ... on Link {
    icon
    link
  }
  ... on PluginItem {
    done
    due
    pluginId
  }
}
    `;