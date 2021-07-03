/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
export type ClientItemFieldsFragment = { readonly __typename: 'Item', readonly id: string, readonly summary: string, readonly archived: Types.Maybe<Types.Scalars['DateTime']>, readonly snoozed: Types.Maybe<Types.Scalars['DateTime']>, readonly created: Types.Scalars['DateTime'], readonly taskInfo: Types.Maybe<{ readonly __typename: 'TaskInfo', readonly due: Types.Maybe<Types.Scalars['DateTime']>, readonly done: Types.Maybe<Types.Scalars['DateTime']>, readonly controller: string }>, readonly detail: Types.Maybe<{ readonly __typename: 'PluginDetail', readonly pluginId: string, readonly hasTaskState: boolean, readonly wasEverListed: boolean, readonly isCurrentlyListed: boolean, readonly fields: string, readonly lists: ReadonlyArray<{ readonly __typename: 'PluginList', readonly id: string, readonly pluginId: string, readonly name: string, readonly url: Types.Maybe<string> }> } | { readonly __typename: 'LinkDetail', readonly icon: Types.Maybe<string>, readonly url: string } | { readonly __typename: 'NoteDetail', readonly note: string } | { readonly __typename: 'FileDetail', readonly size: number, readonly filename: string, readonly mimetype: string }> };

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
    ... on PluginDetail {
      pluginId
      hasTaskState
      wasEverListed
      isCurrentlyListed
      fields
      lists {
        id
        pluginId
        name
        url
      }
    }
  }
}
    `;