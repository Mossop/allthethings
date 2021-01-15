/* eslint-disable */
import type { GraphQLResolveInfo } from 'graphql';
import type { User, Context, Project } from '../db/implementations';
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
  User: ResolverTypeWrapper<User>;
  String: ResolverTypeWrapper<Schema.Scalars['String']>;
  Context: ResolverTypeWrapper<Context>;
  ID: ResolverTypeWrapper<Schema.Scalars['ID']>;
  Project: ResolverTypeWrapper<Project>;
  Query: ResolverTypeWrapper<{}>;
  CreateContextParams: Schema.CreateContextParams;
  CreateProjectParams: Schema.CreateProjectParams;
  UpdateProjectParams: Schema.UpdateProjectParams;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Schema.Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  User: User;
  String: Schema.Scalars['String'];
  Context: Context;
  ID: Schema.Scalars['ID'];
  Project: Project;
  Query: {};
  CreateContextParams: Schema.CreateContextParams;
  CreateProjectParams: Schema.CreateProjectParams;
  UpdateProjectParams: Schema.UpdateProjectParams;
  Mutation: {};
  Boolean: Schema.Scalars['Boolean'];
}>;

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contexts?: Resolver<ReadonlyArray<ResolversTypes['Context']>, ParentType, ContextType>;
  rootProjects?: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContextResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Context'] = ResolversParentTypes['Context']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rootProjects?: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  context?: Resolver<Schema.Maybe<ResolversTypes['Context']>, ParentType, ContextType>;
  parent?: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  name?: Resolver<Schema.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subprojects?: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  user?: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  context?: Resolver<Schema.Maybe<ResolversTypes['Context']>, ParentType, ContextType, RequireFields<Schema.QueryContextArgs, 'id'>>;
}>;

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  login?: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<Schema.MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<Schema.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createContext?: Resolver<ResolversTypes['Context'], ParentType, ContextType, RequireFields<Schema.MutationCreateContextArgs, 'params'>>;
  deleteContext?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteContextArgs, 'id'>>;
  createProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<Schema.MutationCreateProjectArgs, 'params'>>;
  updateProject?: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.MutationUpdateProjectArgs, 'id' | 'params'>>;
  deleteProject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteProjectArgs, 'id'>>;
}>;

export type Resolvers<ContextType = ResolverContext> = ResolversObject<{
  User?: UserResolvers<ContextType>;
  Context?: ContextResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
