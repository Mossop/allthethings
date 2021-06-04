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

export type BugzillaAccount = {
  readonly __typename?: 'BugzillaAccount';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
  readonly username: Maybe<Scalars['String']>;
  readonly searches: ReadonlyArray<BugzillaSearch>;
};

export type BugzillaAccountParams = {
  readonly name: Scalars['String'];
  readonly url: Scalars['String'];
  readonly username: Maybe<Scalars['String']>;
  readonly password: Maybe<Scalars['String']>;
};

export type BugzillaSearch = {
  readonly __typename?: 'BugzillaSearch';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly type: Scalars['String'];
  readonly query: Scalars['String'];
  readonly url: Scalars['String'];
};

export type BugzillaSearchParams = {
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly createBugzillaAccount: BugzillaAccount;
  readonly deleteBugzillaAccount: Maybe<Scalars['Boolean']>;
  readonly createBugzillaSearch: BugzillaSearch;
  readonly deleteBugzillaSearch: Maybe<Scalars['Boolean']>;
};


export type MutationCreateBugzillaAccountArgs = {
  params: BugzillaAccountParams;
};


export type MutationDeleteBugzillaAccountArgs = {
  account: Scalars['ID'];
};


export type MutationCreateBugzillaSearchArgs = {
  account: Scalars['ID'];
  params: BugzillaSearchParams;
};


export type MutationDeleteBugzillaSearchArgs = {
  search: Scalars['ID'];
};

export type User = {
  readonly __typename?: 'User';
  readonly bugzillaAccounts: ReadonlyArray<BugzillaAccount>;
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
  BugzillaAccount: ResolverTypeWrapper<BugzillaAccount>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  BugzillaAccountParams: BugzillaAccountParams;
  BugzillaSearch: ResolverTypeWrapper<BugzillaSearch>;
  BugzillaSearchParams: BugzillaSearchParams;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BugzillaAccount: BugzillaAccount;
  ID: Scalars['ID'];
  String: Scalars['String'];
  BugzillaAccountParams: BugzillaAccountParams;
  BugzillaSearch: BugzillaSearch;
  BugzillaSearchParams: BugzillaSearchParams;
  Mutation: {};
  Boolean: Scalars['Boolean'];
  User: User;
}>;

export type BugzillaAccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['BugzillaAccount'] = ResolversParentTypes['BugzillaAccount']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  searches: Resolver<ReadonlyArray<ResolversTypes['BugzillaSearch']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BugzillaSearchResolvers<ContextType = any, ParentType extends ResolversParentTypes['BugzillaSearch'] = ResolversParentTypes['BugzillaSearch']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  query: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createBugzillaAccount: Resolver<ResolversTypes['BugzillaAccount'], ParentType, ContextType, RequireFields<MutationCreateBugzillaAccountArgs, 'params'>>;
  deleteBugzillaAccount: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteBugzillaAccountArgs, 'account'>>;
  createBugzillaSearch: Resolver<ResolversTypes['BugzillaSearch'], ParentType, ContextType, RequireFields<MutationCreateBugzillaSearchArgs, 'account' | 'params'>>;
  deleteBugzillaSearch: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteBugzillaSearchArgs, 'search'>>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  bugzillaAccounts: Resolver<ReadonlyArray<ResolversTypes['BugzillaAccount']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  BugzillaAccount: BugzillaAccountResolvers<ContextType>;
  BugzillaSearch: BugzillaSearchResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  User: UserResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
