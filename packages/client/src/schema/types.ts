/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type ProjectContext = Context | EmptyContext;

export type Context = {
  __typename?: 'Context';
  id: Scalars['ID'];
  user: User;
  name: Scalars['String'];
  projects: Array<Project>;
};

export type EmptyContext = {
  __typename?: 'EmptyContext';
  user: User;
  projects: Array<Project>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  parent?: Maybe<Project>;
  context?: Maybe<ProjectContext>;
  name?: Maybe<Scalars['String']>;
  subprojects: Array<Project>;
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  contexts: Array<Context>;
  emptyContext?: Maybe<EmptyContext>;
  context?: Maybe<Context>;
};


export type QueryContextArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login?: Maybe<User>;
  logout?: Maybe<Scalars['Boolean']>;
  createContext: Context;
  createProject: Project;
  assignContext?: Maybe<Project>;
  assignParent?: Maybe<Project>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateContextArgs = {
  name: Scalars['String'];
};


export type MutationCreateProjectArgs = {
  name: Scalars['String'];
  parent?: Maybe<Scalars['ID']>;
  context?: Maybe<Scalars['ID']>;
};


export type MutationAssignContextArgs = {
  project: Scalars['ID'];
  context?: Maybe<Scalars['ID']>;
};


export type MutationAssignParentArgs = {
  project: Scalars['ID'];
  parent?: Maybe<Scalars['ID']>;
};

export type ContextsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContextsQuery = (
  { __typename?: 'Query' }
  & { contexts: Array<(
    { __typename?: 'Context' }
    & Pick<Context, 'id' | 'name'>
  )> }
);


export const ContextsDocument = gql`
    query contexts {
  contexts {
    id
    name
  }
}
    `;

/**
 * __useContextsQuery__
 *
 * To run a query within a React component, call `useContextsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContextsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContextsQuery({
 *   variables: {
 *   },
 * });
 */
export function useContextsQuery(baseOptions?: Apollo.QueryHookOptions<ContextsQuery, ContextsQueryVariables>) {
        return Apollo.useQuery<ContextsQuery, ContextsQueryVariables>(ContextsDocument, baseOptions);
      }
export function useContextsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContextsQuery, ContextsQueryVariables>) {
          return Apollo.useLazyQuery<ContextsQuery, ContextsQueryVariables>(ContextsDocument, baseOptions);
        }
export type ContextsQueryHookResult = ReturnType<typeof useContextsQuery>;
export type ContextsLazyQueryHookResult = ReturnType<typeof useContextsLazyQuery>;
export type ContextsQueryResult = Apollo.QueryResult<ContextsQuery, ContextsQueryVariables>;