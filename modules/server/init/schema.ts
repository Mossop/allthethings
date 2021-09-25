/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import * as Schema from "#schema";
import { Root, Problem } from "#server/utils";

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
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  DateTimeOffset: ResolverTypeWrapper<Schema.Scalars["DateTimeOffset"]>;
  Problem: ResolverTypeWrapper<Problem>;
  Query: ResolverTypeWrapper<Root>;
  RelativeDateTime: ResolverTypeWrapper<Schema.Scalars["RelativeDateTime"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Schema.Scalars["Boolean"];
  DateTime: Schema.Scalars["DateTime"];
  DateTimeOffset: Schema.Scalars["DateTimeOffset"];
  Problem: Problem;
  Query: Root;
  RelativeDateTime: Schema.Scalars["RelativeDateTime"];
  String: Schema.Scalars["String"];
  TaskController: Schema.Scalars["TaskController"];
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export interface DateTimeOffsetScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTimeOffset"], any> {
  name: "DateTimeOffset";
}

export type ProblemResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Problem"] = ResolversParentTypes["Problem"],
> = {
  description: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  problems: Resolver<
    ReadonlyArray<ResolversTypes["Problem"]>,
    ParentType,
    ContextType
  >;
  schemaVersion: Resolver<ResolversTypes["String"], ParentType, ContextType>;
};

export interface RelativeDateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["RelativeDateTime"], any> {
  name: "RelativeDateTime";
}

export interface TaskControllerScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["TaskController"], any> {
  name: "TaskController";
}

export type Resolvers<ContextType = any> = {
  DateTime: GraphQLScalarType;
  DateTimeOffset: GraphQLScalarType;
  Problem: ProblemResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  RelativeDateTime: GraphQLScalarType;
  TaskController: GraphQLScalarType;
};
