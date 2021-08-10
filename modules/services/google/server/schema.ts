/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { Account, MailSearch } from "./implementations";
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
  GoogleAccount: ResolverTypeWrapper<Account>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  GoogleMailSearch: ResolverTypeWrapper<MailSearch>;
  GoogleMailSearchParams: Schema.GoogleMailSearchParams;
  Mutation: ResolverTypeWrapper<Root>;
  Query: ResolverTypeWrapper<Root>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  User: ResolverTypeWrapper<
    Omit<Schema.User, "googleAccounts"> & {
      googleAccounts: ReadonlyArray<ResolversTypes["GoogleAccount"]>;
    }
  >;
  Boolean: ResolverTypeWrapper<Schema.Scalars["Boolean"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  DateTime: Schema.Scalars["DateTime"];
  GoogleAccount: Account;
  ID: Schema.Scalars["ID"];
  String: Schema.Scalars["String"];
  GoogleMailSearch: MailSearch;
  GoogleMailSearchParams: Schema.GoogleMailSearchParams;
  Mutation: Root;
  Query: Root;
  TaskController: Schema.Scalars["TaskController"];
  User: Omit<Schema.User, "googleAccounts"> & {
    googleAccounts: ReadonlyArray<ResolversParentTypes["GoogleAccount"]>;
  };
  Boolean: Schema.Scalars["Boolean"];
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type GoogleAccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["GoogleAccount"] = ResolversParentTypes["GoogleAccount"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  email: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  avatar: Resolver<
    Schema.Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  mailSearches: Resolver<
    ReadonlyArray<ResolversTypes["GoogleMailSearch"]>,
    ParentType,
    ContextType
  >;
  loginUrl: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleMailSearchResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["GoogleMailSearch"] = ResolversParentTypes["GoogleMailSearch"],
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
  createGoogleMailSearch: Resolver<
    ResolversTypes["GoogleMailSearch"],
    ParentType,
    ContextType,
    RequireFields<
      Schema.MutationCreateGoogleMailSearchArgs,
      "account" | "params"
    >
  >;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  googleLoginUrl: Resolver<ResolversTypes["String"], ParentType, ContextType>;
};

export interface TaskControllerScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["TaskController"], any> {
  name: "TaskController";
}

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  googleAccounts: Resolver<
    ReadonlyArray<ResolversTypes["GoogleAccount"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime: GraphQLScalarType;
  GoogleAccount: GoogleAccountResolvers<ContextType>;
  GoogleMailSearch: GoogleMailSearchResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  TaskController: GraphQLScalarType;
  User: UserResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
