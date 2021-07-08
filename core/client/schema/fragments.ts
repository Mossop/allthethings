/* eslint-disable */
import * as Schema from '#schema';

import { gql } from '@apollo/client';
export type ClientItemFieldsFragment = { readonly __typename: 'Item', readonly id: string, readonly summary: string, readonly archived: Schema.Maybe<Schema.Scalars['DateTime']>, readonly snoozed: Schema.Maybe<Schema.Scalars['DateTime']>, readonly created: Schema.Scalars['DateTime'], readonly taskInfo: Schema.Maybe<{ readonly __typename: 'TaskInfo', readonly due: Schema.Maybe<Schema.Scalars['DateTime']>, readonly done: Schema.Maybe<Schema.Scalars['DateTime']>, readonly controller: Schema.Scalars['TaskController'] }>, readonly detail: Schema.Maybe<{ readonly __typename: 'PluginDetail', readonly pluginId: string, readonly hasTaskState: boolean, readonly wasEverListed: boolean, readonly isCurrentlyListed: boolean, readonly fields: string, readonly lists: ReadonlyArray<{ readonly __typename: 'PluginList', readonly id: string, readonly pluginId: string, readonly name: string, readonly url: Schema.Maybe<string> }> } | { readonly __typename: 'LinkDetail', readonly icon: Schema.Maybe<string>, readonly url: string } | { readonly __typename: 'NoteDetail', readonly note: string } | { readonly __typename: 'FileDetail', readonly size: number, readonly filename: string, readonly mimetype: string }> };

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