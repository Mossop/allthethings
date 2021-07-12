/* eslint-disable */
import type { GraphQLResolveInfo } from 'graphql';
import type { Account, QueryClass } from './db/implementations';
import * as Schema from '#schema';
export type ResolverFn<TResult, TParent, TContext, TArgs> = Promise<TResult> | TResult | ((parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult)
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };


export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

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
export type ResolversTypes = {
  CreatePhabricatorAccountParams: Schema.CreatePhabricatorAccountParams;
  String: ResolverTypeWrapper<Schema.Scalars['String']>;
  ID: ResolverTypeWrapper<Schema.Scalars['ID']>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Schema.Scalars['Boolean']>;
  PhabricatorAccount: ResolverTypeWrapper<Account>;
  PhabricatorQuery: ResolverTypeWrapper<QueryClass>;
  UpdatePhabricatorAccountParams: Schema.UpdatePhabricatorAccountParams;
  User: ResolverTypeWrapper<Omit<Schema.User, 'phabricatorAccounts' | 'phabricatorQueries'> & { phabricatorAccounts: ReadonlyArray<ResolversTypes['PhabricatorAccount']>, phabricatorQueries: ReadonlyArray<ResolversTypes['PhabricatorQuery']> }>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  CreatePhabricatorAccountParams: Schema.CreatePhabricatorAccountParams;
  String: Schema.Scalars['String'];
  ID: Schema.Scalars['ID'];
  Mutation: {};
  Boolean: Schema.Scalars['Boolean'];
  PhabricatorAccount: Account;
  PhabricatorQuery: QueryClass;
  UpdatePhabricatorAccountParams: Schema.UpdatePhabricatorAccountParams;
  User: Omit<Schema.User, 'phabricatorAccounts' | 'phabricatorQueries'> & { phabricatorAccounts: ReadonlyArray<ResolversParentTypes['PhabricatorAccount']>, phabricatorQueries: ReadonlyArray<ResolversParentTypes['PhabricatorQuery']> };
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createPhabricatorAccount: Resolver<ResolversTypes['PhabricatorAccount'], ParentType, ContextType, RequireFields<Schema.MutationCreatePhabricatorAccountArgs, 'params'>>;
  updatePhabricatorAccount: Resolver<Schema.Maybe<ResolversTypes['PhabricatorAccount']>, ParentType, ContextType, RequireFields<Schema.MutationUpdatePhabricatorAccountArgs, 'id' | 'params'>>;
  deletePhabricatorAccount: Resolver<Schema.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Schema.MutationDeletePhabricatorAccountArgs, 'account'>>;
};

export type PhabricatorAccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhabricatorAccount'] = ResolversParentTypes['PhabricatorAccount']> = {
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  icon: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  apiKey: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enabledQueries: Resolver<ReadonlyArray<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PhabricatorQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhabricatorQuery'] = ResolversParentTypes['PhabricatorQuery']> = {
  queryId: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  phabricatorAccounts: Resolver<ReadonlyArray<ResolversTypes['PhabricatorAccount']>, ParentType, ContextType>;
  phabricatorQueries: Resolver<ReadonlyArray<ResolversTypes['PhabricatorQuery']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Mutation: MutationResolvers<ContextType>;
  PhabricatorAccount: PhabricatorAccountResolvers<ContextType>;
  PhabricatorQuery: PhabricatorQueryResolvers<ContextType>;
  User: UserResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
