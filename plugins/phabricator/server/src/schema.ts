/* eslint-disable */
import type { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly createPhabricatorAccount: PhabricatorAccount;
  readonly deletePhabricatorAccount: Maybe<Scalars['Boolean']>;
};


export type MutationCreatePhabricatorAccountArgs = {
  params: PhabricatorAccountParams;
};


export type MutationDeletePhabricatorAccountArgs = {
  account: Scalars['ID'];
};

export type PhabricatorAccount = {
  readonly __typename?: 'PhabricatorAccount';
  readonly id: Scalars['ID'];
  readonly icon: Scalars['String'];
  readonly url: Scalars['String'];
  readonly email: Scalars['String'];
  readonly apiKey: Scalars['String'];
  readonly enabledQueries: Maybe<ReadonlyArray<Scalars['ID']>>;
};

export type PhabricatorAccountParams = {
  readonly url: Scalars['String'];
  readonly apiKey: Scalars['String'];
  readonly queries: ReadonlyArray<Scalars['ID']>;
};

export type PhabricatorQuery = {
  readonly __typename?: 'PhabricatorQuery';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly description: Scalars['String'];
};

export type User = {
  readonly __typename?: 'User';
  readonly phabricatorAccounts: ReadonlyArray<PhabricatorAccount>;
  readonly phabricatorQueries: ReadonlyArray<PhabricatorQuery>;
};

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
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

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
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  PhabricatorAccount: ResolverTypeWrapper<PhabricatorAccount>;
  String: ResolverTypeWrapper<Scalars['String']>;
  PhabricatorAccountParams: PhabricatorAccountParams;
  PhabricatorQuery: ResolverTypeWrapper<PhabricatorQuery>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Mutation: {};
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  PhabricatorAccount: PhabricatorAccount;
  String: Scalars['String'];
  PhabricatorAccountParams: PhabricatorAccountParams;
  PhabricatorQuery: PhabricatorQuery;
  User: User;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createPhabricatorAccount: Resolver<ResolversTypes['PhabricatorAccount'], ParentType, ContextType, RequireFields<MutationCreatePhabricatorAccountArgs, 'params'>>;
  deletePhabricatorAccount: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeletePhabricatorAccountArgs, 'account'>>;
}>;

export type PhabricatorAccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhabricatorAccount'] = ResolversParentTypes['PhabricatorAccount']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  icon: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  apiKey: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enabledQueries: Resolver<Maybe<ReadonlyArray<ResolversTypes['ID']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PhabricatorQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhabricatorQuery'] = ResolversParentTypes['PhabricatorQuery']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  phabricatorAccounts: Resolver<ReadonlyArray<ResolversTypes['PhabricatorAccount']>, ParentType, ContextType>;
  phabricatorQueries: Resolver<ReadonlyArray<ResolversTypes['PhabricatorQuery']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Mutation: MutationResolvers<ContextType>;
  PhabricatorAccount: PhabricatorAccountResolvers<ContextType>;
  PhabricatorQuery: PhabricatorQueryResolvers<ContextType>;
  User: UserResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;