/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { Account, Search } from "./implementations";
import * as Schema from "#schema";
import { Root, Problem } from "#server/utils";
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Schema.Maybe<TTypes> | Promise<Schema.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  BugzillaAccount: ResolverTypeWrapper<Account>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  BugzillaAccountParams: Schema.BugzillaAccountParams;
  BugzillaSearch: ResolverTypeWrapper<Search>;
  BugzillaSearchParams: Schema.BugzillaSearchParams;
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  Mutation: ResolverTypeWrapper<Root>;
  Boolean: ResolverTypeWrapper<Schema.Scalars["Boolean"]>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  User: ResolverTypeWrapper<
    Omit<Schema.User, "bugzillaAccounts"> & {
      bugzillaAccounts: ReadonlyArray<ResolversTypes["BugzillaAccount"]>;
    }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BugzillaAccount: Account;
  ID: Schema.Scalars["ID"];
  String: Schema.Scalars["String"];
  BugzillaAccountParams: Schema.BugzillaAccountParams;
  BugzillaSearch: Search;
  BugzillaSearchParams: Schema.BugzillaSearchParams;
  DateTime: Schema.Scalars["DateTime"];
  Mutation: Root;
  Boolean: Schema.Scalars["Boolean"];
  TaskController: Schema.Scalars["TaskController"];
  User: Omit<Schema.User, "bugzillaAccounts"> & {
    bugzillaAccounts: ReadonlyArray<ResolversParentTypes["BugzillaAccount"]>;
  };
};

export type BugzillaAccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["BugzillaAccount"] = ResolversParentTypes["BugzillaAccount"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  icon: Resolver<
    Schema.Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username: Resolver<
    Schema.Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  searches: Resolver<
    ReadonlyArray<ResolversTypes["BugzillaSearch"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BugzillaSearchResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["BugzillaSearch"] = ResolversParentTypes["BugzillaSearch"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  type: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  query: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  createBugzillaAccount: Resolver<
    ResolversTypes["BugzillaAccount"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateBugzillaAccountArgs, "params">
  >;
  deleteBugzillaAccount: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteBugzillaAccountArgs, "account">
  >;
  createBugzillaSearch: Resolver<
    ResolversTypes["BugzillaSearch"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateBugzillaSearchArgs, "account" | "params">
  >;
  deleteBugzillaSearch: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteBugzillaSearchArgs, "search">
  >;
};

export interface TaskControllerScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["TaskController"], any> {
  name: "TaskController";
}

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  bugzillaAccounts: Resolver<
    ReadonlyArray<ResolversTypes["BugzillaAccount"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  BugzillaAccount: BugzillaAccountResolvers<ContextType>;
  BugzillaSearch: BugzillaSearchResolvers<ContextType>;
  DateTime: GraphQLScalarType;
  Mutation: MutationResolvers<ContextType>;
  TaskController: GraphQLScalarType;
  User: UserResolvers<ContextType>;
};
