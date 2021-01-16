/* eslint-disable */
import * as Types from './types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type LoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
}>;


export type LoginMutation = { readonly __typename?: 'Mutation', readonly login: Types.Maybe<{ readonly __typename?: 'User', readonly email: string }> };

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = { readonly __typename?: 'Mutation', readonly logout: Types.Maybe<boolean> };

export type CreateNamedContextMutationVariables = Types.Exact<{
  params: Types.CreateNamedContextParams;
}>;


export type CreateNamedContextMutation = { readonly __typename?: 'Mutation', readonly createNamedContext: { readonly __typename?: 'NamedContext', readonly id: string, readonly name: string, readonly stub: string } };

export type CreateProjectMutationVariables = Types.Exact<{
  params: Types.CreateProjectParams;
}>;


export type CreateProjectMutation = { readonly __typename?: 'Mutation', readonly createProject: { readonly __typename?: 'Project', readonly id: string, readonly name: string, readonly stub: string } };

export type CurrentUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { readonly __typename?: 'Query', readonly user: Types.Maybe<{ readonly __typename?: 'User', readonly id: string, readonly email: string }> };

export type NamedContextsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NamedContextsQuery = { readonly __typename?: 'Query', readonly user: Types.Maybe<{ readonly __typename?: 'User', readonly id: string, readonly email: string, readonly namedContexts: ReadonlyArray<{ readonly __typename?: 'NamedContext', readonly id: string, readonly name: string, readonly stub: string }> }> };

export type LookupOwnerQueryVariables = Types.Exact<{
  stubs: ReadonlyArray<Types.Scalars['String']> | Types.Scalars['String'];
}>;


export type LookupOwnerQuery = { readonly __typename?: 'Query', readonly user: Types.Maybe<{ readonly __typename?: 'User', readonly id: string, readonly descend: Types.Maybe<{ readonly __typename?: 'User', readonly id: string, readonly context: { readonly __typename?: 'User', readonly id: string } | { readonly __typename?: 'NamedContext', readonly id: string } } | { readonly __typename?: 'NamedContext', readonly id: string, readonly context: { readonly __typename?: 'User', readonly id: string } | { readonly __typename?: 'NamedContext', readonly id: string } } | { readonly __typename?: 'Project', readonly id: string, readonly context: { readonly __typename?: 'User', readonly id: string } | { readonly __typename?: 'NamedContext', readonly id: string } }> }> };

export type ListProjectsQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ListProjectsQuery = { readonly __typename?: 'Query', readonly context: Types.Maybe<{ readonly __typename?: 'User', readonly projects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly parent: Types.Maybe<{ readonly __typename?: 'Project', readonly id: string }> }> } | { readonly __typename?: 'NamedContext', readonly stub: string, readonly projects: ReadonlyArray<{ readonly __typename?: 'Project', readonly id: string, readonly stub: string, readonly name: string, readonly parent: Types.Maybe<{ readonly __typename?: 'Project', readonly id: string }> }> }> };


export const Login: DocumentNode<LoginMutation, LoginMutationVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]};
export const Logout: DocumentNode<LogoutMutation, LogoutMutationVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]};
export const CreateNamedContext: DocumentNode<CreateNamedContextMutation, CreateNamedContextMutationVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateNamedContext"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"params"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNamedContextParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNamedContext"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"params"},"value":{"kind":"Variable","name":{"kind":"Name","value":"params"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stub"}}]}}]}}]};
export const CreateProject: DocumentNode<CreateProjectMutation, CreateProjectMutationVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"params"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectParams"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"params"},"value":{"kind":"Variable","name":{"kind":"Name","value":"params"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stub"}}]}}]}}]};
export const CurrentUser: DocumentNode<CurrentUserQuery, CurrentUserQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]};
export const NamedContexts: DocumentNode<NamedContextsQuery, NamedContextsQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NamedContexts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"namedContexts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stub"}}]}}]}}]}}]};
export const LookupOwner: DocumentNode<LookupOwnerQuery, LookupOwnerQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LookupOwner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stubs"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"descend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"stubs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stubs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"context"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]};
export const ListProjects: DocumentNode<ListProjectsQuery, ListProjectsQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"context"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NamedContext"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stub"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stub"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]};