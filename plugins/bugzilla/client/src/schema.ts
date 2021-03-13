/* eslint-disable */
import type { DateTime } from 'luxon';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
};


export type TaskInfo = {
  readonly __typename?: 'TaskInfo';
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
};

export type PluginDetail = {
  readonly __typename?: 'PluginDetail';
  readonly pluginId: Scalars['String'];
  readonly fields: Scalars['String'];
};

export type FileDetail = {
  readonly __typename?: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type NoteDetail = {
  readonly __typename?: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type LinkDetail = {
  readonly __typename?: 'LinkDetail';
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
};

export type ItemDetail = PluginDetail | LinkDetail | NoteDetail | FileDetail;

export type Item = {
  readonly __typename?: 'Item';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly created: Scalars['DateTime'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
  readonly taskInfo: Maybe<TaskInfo>;
  readonly detail: Maybe<ItemDetail>;
};

export type TaskList = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
};

export type ProjectRoot = {
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ProjectRootProjectByIdArgs = {
  id: Scalars['ID'];
};

export type User = ProjectRoot & TaskList & {
  readonly __typename?: 'User';
  readonly bugzillaAccounts: ReadonlyArray<BugzillaAccount>;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly id: Scalars['ID'];
  readonly inbox: Inbox;
  readonly items: ReadonlyArray<Item>;
  readonly projectById: Maybe<Project>;
  readonly projects: ReadonlyArray<Project>;
  readonly remainingTasks: Scalars['Int'];
  readonly sections: ReadonlyArray<Section>;
  readonly subprojects: ReadonlyArray<Project>;
};


export type UserProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Context = ProjectRoot & TaskList & {
  readonly __typename?: 'Context';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly remainingTasks: Scalars['Int'];
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type Section = {
  readonly __typename?: 'Section';
  readonly remainingTasks: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type Inbox = {
  readonly __typename?: 'Inbox';
  readonly id: Scalars['ID'];
  readonly items: ReadonlyArray<Item>;
};

export type Query = {
  readonly __typename?: 'Query';
  readonly user: Maybe<User>;
  readonly taskList: Maybe<TaskList>;
  readonly root: Maybe<ProjectRoot>;
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};


export type QueryRootArgs = {
  id: Scalars['ID'];
};

export type ContextParams = {
  readonly name: Scalars['String'];
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type SectionParams = {
  readonly name: Scalars['String'];
};

export type ItemParams = {
  readonly summary: Scalars['String'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
};

export type TaskInfoParams = {
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
};

export type LinkDetailParams = {
  readonly url: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly createBugzillaAccount: BugzillaAccount;
  readonly createContext: Context;
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly deleteContext: Scalars['Boolean'];
  readonly deleteItem: Scalars['Boolean'];
  readonly deleteProject: Scalars['Boolean'];
  readonly deleteSection: Scalars['Boolean'];
  readonly editContext: Maybe<Context>;
  readonly editItem: Maybe<Item>;
  readonly editProject: Maybe<Project>;
  readonly editSection: Maybe<Section>;
  readonly editTaskInfo: Maybe<Item>;
  readonly login: Maybe<User>;
  readonly logout: Maybe<Scalars['Boolean']>;
  readonly moveItem: Maybe<Item>;
  readonly moveProject: Maybe<Project>;
  readonly moveSection: Maybe<Section>;
};


export type MutationCreateBugzillaAccountArgs = {
  url: Scalars['String'];
  username: Maybe<Scalars['String']>;
  password: Maybe<Scalars['String']>;
};


export type MutationCreateContextArgs = {
  params: ContextParams;
};


export type MutationCreateLinkArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationCreateNoteArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationCreateProjectArgs = {
  taskList: Maybe<Scalars['ID']>;
  params: ProjectParams;
};


export type MutationCreateSectionArgs = {
  taskList: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationCreateTaskArgs = {
  list: Maybe<Scalars['ID']>;
  item: ItemParams;
  taskInfo: TaskInfoParams;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  parent: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList: Maybe<Scalars['ID']>;
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};

export type BugzillaAccount = {
  readonly __typename?: 'BugzillaAccount';
  readonly id: Scalars['ID'];
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
  readonly username: Maybe<Scalars['String']>;
};

export type ListBugzillaAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListBugzillaAccountsQuery = { readonly __typename: 'Query', readonly user: Maybe<{ readonly __typename: 'User', readonly bugzillaAccounts: ReadonlyArray<{ readonly __typename: 'BugzillaAccount', readonly id: string, readonly icon: Maybe<string>, readonly url: string }> }> };

export type CreateBugzillaAccountMutationVariables = Exact<{
  url: Scalars['String'];
  username: Scalars['String'];
  password: Maybe<Scalars['String']>;
}>;


export type CreateBugzillaAccountMutation = { readonly __typename: 'Mutation', readonly createBugzillaAccount: { readonly __typename: 'BugzillaAccount', readonly id: string, readonly icon: Maybe<string>, readonly url: string } };


export const ListBugzillaAccountsDocument = gql`
    query ListBugzillaAccounts {
  user {
    bugzillaAccounts {
      id
      icon
      url
    }
  }
}
    `;

/**
 * __useListBugzillaAccountsQuery__
 *
 * To run a query within a React component, call `useListBugzillaAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListBugzillaAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListBugzillaAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListBugzillaAccountsQuery(baseOptions?: Apollo.QueryHookOptions<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>(ListBugzillaAccountsDocument, options);
      }
export function useListBugzillaAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>(ListBugzillaAccountsDocument, options);
        }
export type ListBugzillaAccountsQueryHookResult = ReturnType<typeof useListBugzillaAccountsQuery>;
export type ListBugzillaAccountsLazyQueryHookResult = ReturnType<typeof useListBugzillaAccountsLazyQuery>;
export type ListBugzillaAccountsQueryResult = Apollo.QueryResult<ListBugzillaAccountsQuery, ListBugzillaAccountsQueryVariables>;
export function refetchListBugzillaAccountsQuery(variables?: ListBugzillaAccountsQueryVariables) {
      return { query: ListBugzillaAccountsDocument, variables: variables }
    }
export const CreateBugzillaAccountDocument = gql`
    mutation CreateBugzillaAccount($url: String!, $username: String!, $password: String) {
  createBugzillaAccount(url: $url, username: $username, password: $password) {
    id
    icon
    url
  }
}
    `;
export type CreateBugzillaAccountMutationFn = Apollo.MutationFunction<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>;

/**
 * __useCreateBugzillaAccountMutation__
 *
 * To run a mutation, you first call `useCreateBugzillaAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBugzillaAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBugzillaAccountMutation, { data, loading, error }] = useCreateBugzillaAccountMutation({
 *   variables: {
 *      url: // value for 'url'
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useCreateBugzillaAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>(CreateBugzillaAccountDocument, options);
      }
export type CreateBugzillaAccountMutationHookResult = ReturnType<typeof useCreateBugzillaAccountMutation>;
export type CreateBugzillaAccountMutationResult = Apollo.MutationResult<CreateBugzillaAccountMutation>;
export type CreateBugzillaAccountMutationOptions = Apollo.BaseMutationOptions<CreateBugzillaAccountMutation, CreateBugzillaAccountMutationVariables>;