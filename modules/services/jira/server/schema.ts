/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { Account, Search } from "./implementations";
import * as Schema from "#schema";
import { ResolverFunc, Root, Problem } from "#server/utils";
export type ResolverFn<TResult, TParent, TContext, TArgs> = ResolverFunc<
  TResult,
  TParent,
  TContext,
  TArgs
>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<
  TResult,
  TParent = {},
  TContext = {},
  TArgs = {},
> = ResolverFn<TResult, TParent, TContext, TArgs>;

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
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  JiraAccount: ResolverTypeWrapper<Account>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  JiraAccountParams: Schema.JiraAccountParams;
  JiraSearch: ResolverTypeWrapper<Search>;
  JiraSearchParams: Schema.JiraSearchParams;
  Mutation: ResolverTypeWrapper<Root>;
  Boolean: ResolverTypeWrapper<Schema.Scalars["Boolean"]>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  User: ResolverTypeWrapper<
    Omit<Schema.User, "jiraAccounts"> & {
      jiraAccounts: ReadonlyArray<ResolversTypes["JiraAccount"]>;
    }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  DateTime: Schema.Scalars["DateTime"];
  JiraAccount: Account;
  ID: Schema.Scalars["ID"];
  String: Schema.Scalars["String"];
  JiraAccountParams: Schema.JiraAccountParams;
  JiraSearch: Search;
  JiraSearchParams: Schema.JiraSearchParams;
  Mutation: Root;
  Boolean: Schema.Scalars["Boolean"];
  TaskController: Schema.Scalars["TaskController"];
  User: Omit<Schema.User, "jiraAccounts"> & {
    jiraAccounts: ReadonlyArray<ResolversParentTypes["JiraAccount"]>;
  };
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type JiraAccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["JiraAccount"] = ResolversParentTypes["JiraAccount"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  serverName: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userName: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  apiToken: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  searches: Resolver<
    ReadonlyArray<ResolversTypes["JiraSearch"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraSearchResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["JiraSearch"] = ResolversParentTypes["JiraSearch"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  query: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  createJiraAccount: Resolver<
    ResolversTypes["JiraAccount"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateJiraAccountArgs, "params">
  >;
  deleteJiraAccount: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteJiraAccountArgs, "account">
  >;
  createJiraSearch: Resolver<
    ResolversTypes["JiraSearch"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateJiraSearchArgs, "account" | "params">
  >;
  deleteJiraSearch: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteJiraSearchArgs, "search">
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
  jiraAccounts: Resolver<
    ReadonlyArray<ResolversTypes["JiraAccount"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime: GraphQLScalarType;
  JiraAccount: JiraAccountResolvers<ContextType>;
  JiraSearch: JiraSearchResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  TaskController: GraphQLScalarType;
  User: UserResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
