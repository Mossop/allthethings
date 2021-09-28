/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { Account, QueryClass } from "./implementations";
import * as Schema from "../../../schema";
import { Root } from "#server/utils";
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} & { [P in K]-?: NonNullable<T[P]> };

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
  Boolean: ResolverTypeWrapper<Schema.Scalars["Boolean"]>;
  CreatePhabricatorAccountParams: Schema.CreatePhabricatorAccountParams;
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  DateTimeOffset: ResolverTypeWrapper<Schema.Scalars["DateTimeOffset"]>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  Mutation: ResolverTypeWrapper<Root>;
  PhabricatorAccount: ResolverTypeWrapper<Account>;
  PhabricatorQuery: ResolverTypeWrapper<QueryClass>;
  RelativeDateTime: ResolverTypeWrapper<Schema.Scalars["RelativeDateTime"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  UpdatePhabricatorAccountParams: Schema.UpdatePhabricatorAccountParams;
  User: ResolverTypeWrapper<
    Omit<Schema.User, "phabricatorAccounts" | "phabricatorQueries"> & {
      phabricatorAccounts: ReadonlyArray<ResolversTypes["PhabricatorAccount"]>;
      phabricatorQueries: ReadonlyArray<ResolversTypes["PhabricatorQuery"]>;
    }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Schema.Scalars["Boolean"];
  CreatePhabricatorAccountParams: Schema.CreatePhabricatorAccountParams;
  DateTime: Schema.Scalars["DateTime"];
  DateTimeOffset: Schema.Scalars["DateTimeOffset"];
  ID: Schema.Scalars["ID"];
  Mutation: Root;
  PhabricatorAccount: Account;
  PhabricatorQuery: QueryClass;
  RelativeDateTime: Schema.Scalars["RelativeDateTime"];
  String: Schema.Scalars["String"];
  TaskController: Schema.Scalars["TaskController"];
  UpdatePhabricatorAccountParams: Schema.UpdatePhabricatorAccountParams;
  User: Omit<Schema.User, "phabricatorAccounts" | "phabricatorQueries"> & {
    phabricatorAccounts: ReadonlyArray<
      ResolversParentTypes["PhabricatorAccount"]
    >;
    phabricatorQueries: ReadonlyArray<ResolversParentTypes["PhabricatorQuery"]>;
  };
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export interface DateTimeOffsetScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTimeOffset"], any> {
  name: "DateTimeOffset";
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  createPhabricatorAccount: Resolver<
    ResolversTypes["PhabricatorAccount"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreatePhabricatorAccountArgs, "params">
  >;
  deletePhabricatorAccount: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeletePhabricatorAccountArgs, "account">
  >;
  updatePhabricatorAccount: Resolver<
    Schema.Maybe<ResolversTypes["PhabricatorAccount"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationUpdatePhabricatorAccountArgs, "id" | "params">
  >;
};

export type PhabricatorAccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PhabricatorAccount"] = ResolversParentTypes["PhabricatorAccount"],
> = {
  apiKey: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  enabledQueries: Resolver<
    ReadonlyArray<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  icon: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PhabricatorQueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PhabricatorQuery"] = ResolversParentTypes["PhabricatorQuery"],
> = {
  description: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  queryId: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface RelativeDateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["RelativeDateTime"], any> {
  name: "RelativeDateTime";
}

export interface TaskControllerScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["TaskController"], any> {
  name: "TaskController";
}

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  phabricatorAccounts: Resolver<
    ReadonlyArray<ResolversTypes["PhabricatorAccount"]>,
    ParentType,
    ContextType
  >;
  phabricatorQueries: Resolver<
    ReadonlyArray<ResolversTypes["PhabricatorQuery"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime: GraphQLScalarType;
  DateTimeOffset: GraphQLScalarType;
  Mutation: MutationResolvers<ContextType>;
  PhabricatorAccount: PhabricatorAccountResolvers<ContextType>;
  PhabricatorQuery: PhabricatorQueryResolvers<ContextType>;
  RelativeDateTime: GraphQLScalarType;
  TaskController: GraphQLScalarType;
  User: UserResolvers<ContextType>;
};
