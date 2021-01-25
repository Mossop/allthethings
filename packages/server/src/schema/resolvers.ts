/* eslint-disable */
import type { GraphQLResolveInfo } from 'graphql';
import type { User, NamedContext, Project, Section, ProjectOwner, Context } from '../db/implementations';
import type { ResolverContext } from './context';
import * as Schema from './types';
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Schema.Maybe<TTypes> | Promise<Schema.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ProjectOwner: ResolverTypeWrapper<ProjectOwner>;
  ID: ResolverTypeWrapper<Schema.Scalars['ID']>;
  Context: ResolverTypeWrapper<Context>;
  User: ResolverTypeWrapper<User>;
  String: ResolverTypeWrapper<Schema.Scalars['String']>;
  NamedContext: ResolverTypeWrapper<NamedContext>;
  Project: ResolverTypeWrapper<Project>;
  Section: ResolverTypeWrapper<Section>;
  Query: ResolverTypeWrapper<{}>;
  CreateNamedContextParams: Schema.CreateNamedContextParams;
  CreateProjectParams: Schema.CreateProjectParams;
  CreateSectionParams: Schema.CreateSectionParams;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Schema.Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ProjectOwner: ProjectOwner;
  ID: Schema.Scalars['ID'];
  Context: Context;
  User: User;
  String: Schema.Scalars['String'];
  NamedContext: NamedContext;
  Project: Project;
  Section: Section;
  Query: {};
  CreateNamedContextParams: Schema.CreateNamedContextParams;
  CreateProjectParams: Schema.CreateProjectParams;
  CreateSectionParams: Schema.CreateSectionParams;
  Mutation: {};
  Boolean: Schema.Scalars['Boolean'];
}>;

export type ProjectOwnerResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ProjectOwner'] = ResolversParentTypes['ProjectOwner']> = ResolversObject<{
  __resolveType: TypeResolveFn<'User' | 'NamedContext' | 'Project', ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  context: Resolver<ResolversTypes['Context'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
}>;

export type ContextResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Context'] = ResolversParentTypes['Context']> = ResolversObject<{
  __resolveType: TypeResolveFn<'User' | 'NamedContext', ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  context: Resolver<ResolversTypes['Context'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.ContextProjectByIdArgs, 'id'>>;
}>;

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  context: Resolver<ResolversTypes['Context'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.UserProjectByIdArgs, 'id'>>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  namedContexts: Resolver<ReadonlyArray<ResolversTypes['NamedContext']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NamedContextResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NamedContext'] = ResolversParentTypes['NamedContext']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  context: Resolver<ResolversTypes['Context'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.NamedContextProjectByIdArgs, 'id'>>;
  user: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  context: Resolver<ResolversTypes['Context'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner: Resolver<ResolversTypes['ProjectOwner'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SectionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner: Resolver<ResolversTypes['ProjectOwner'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  user: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  owner: Resolver<Schema.Maybe<ResolversTypes['ProjectOwner']>, ParentType, ContextType, RequireFields<Schema.QueryOwnerArgs, 'id'>>;
  context: Resolver<Schema.Maybe<ResolversTypes['Context']>, ParentType, ContextType, RequireFields<Schema.QueryContextArgs, 'id'>>;
}>;

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  login: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<Schema.MutationLoginArgs, 'email' | 'password'>>;
  logout: Resolver<Schema.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createNamedContext: Resolver<ResolversTypes['NamedContext'], ParentType, ContextType, RequireFields<Schema.MutationCreateNamedContextArgs, 'params'>>;
  deleteNamedContext: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteNamedContextArgs, 'id'>>;
  createProject: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<Schema.MutationCreateProjectArgs, 'params'>>;
  moveProject: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.MutationMoveProjectArgs, 'id'>>;
  deleteProject: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteProjectArgs, 'id'>>;
  createSection: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<Schema.MutationCreateSectionArgs, 'params'>>;
  moveSection: Resolver<Schema.Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<Schema.MutationMoveSectionArgs, 'id'>>;
  deleteSection: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteSectionArgs, 'id'>>;
}>;

export type Resolvers<ContextType = ResolverContext> = ResolversObject<{
  ProjectOwner: ProjectOwnerResolvers<ContextType>;
  Context: ContextResolvers<ContextType>;
  User: UserResolvers<ContextType>;
  NamedContext: NamedContextResolvers<ContextType>;
  Project: ProjectResolvers<ContextType>;
  Section: SectionResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
