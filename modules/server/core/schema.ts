/* eslint-disable */
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type {
  User,
  Context,
  Project,
  Section,
  TaskList,
  Item,
  TaskInfo,
  LinkDetail,
  FileDetail,
  NoteDetail,
  ServiceDetail,
  ServiceList,
  ItemSet,
} from "./implementations";
import * as Schema from "#schema";
import { Root, Problem } from "#server/utils";
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
  Context: ResolverTypeWrapper<Context>;
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  DateTimeOffset: ResolverTypeWrapper<Schema.Scalars["DateTimeOffset"]>;
  FileDetail: ResolverTypeWrapper<FileDetail>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  Int: ResolverTypeWrapper<Schema.Scalars["Int"]>;
  Item: ResolverTypeWrapper<Item>;
  ItemDetail:
    | ResolversTypes["FileDetail"]
    | ResolversTypes["LinkDetail"]
    | ResolversTypes["NoteDetail"]
    | ResolversTypes["ServiceDetail"];
  ItemFilter: Schema.ItemFilter;
  ItemParams: Schema.ItemParams;
  ItemSet: ResolverTypeWrapper<ItemSet>;
  LinkDetail: ResolverTypeWrapper<LinkDetail>;
  LinkDetailParams: Schema.LinkDetailParams;
  Mutation: ResolverTypeWrapper<Root>;
  NoteDetail: ResolverTypeWrapper<NoteDetail>;
  NoteDetailParams: Schema.NoteDetailParams;
  Project: ResolverTypeWrapper<Project>;
  Query: ResolverTypeWrapper<Root>;
  RelativeDateTime: ResolverTypeWrapper<Schema.Scalars["RelativeDateTime"]>;
  Section: ResolverTypeWrapper<Section>;
  ServiceDetail: ResolverTypeWrapper<ServiceDetail>;
  ServiceList: ResolverTypeWrapper<ServiceList>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  TaskInfo: ResolverTypeWrapper<TaskInfo>;
  TaskInfoParams: Schema.TaskInfoParams;
  TaskList: ResolverTypeWrapper<TaskList>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Schema.Scalars["Boolean"];
  Context: Context;
  DateTime: Schema.Scalars["DateTime"];
  DateTimeOffset: Schema.Scalars["DateTimeOffset"];
  FileDetail: FileDetail;
  ID: Schema.Scalars["ID"];
  Int: Schema.Scalars["Int"];
  Item: Item;
  ItemDetail:
    | ResolversParentTypes["FileDetail"]
    | ResolversParentTypes["LinkDetail"]
    | ResolversParentTypes["NoteDetail"]
    | ResolversParentTypes["ServiceDetail"];
  ItemFilter: Schema.ItemFilter;
  ItemParams: Schema.ItemParams;
  ItemSet: ItemSet;
  LinkDetail: LinkDetail;
  LinkDetailParams: Schema.LinkDetailParams;
  Mutation: Root;
  NoteDetail: NoteDetail;
  NoteDetailParams: Schema.NoteDetailParams;
  Project: Project;
  Query: Root;
  RelativeDateTime: Schema.Scalars["RelativeDateTime"];
  Section: Section;
  ServiceDetail: ServiceDetail;
  ServiceList: ServiceList;
  String: Schema.Scalars["String"];
  TaskController: Schema.Scalars["TaskController"];
  TaskInfo: TaskInfo;
  TaskInfoParams: Schema.TaskInfoParams;
  TaskList: TaskList;
  User: User;
};

export type ContextResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Context"] = ResolversParentTypes["Context"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.ContextItemsArgs, never>
  >;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  projectById: Resolver<
    Schema.Maybe<ResolversTypes["Project"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.ContextProjectByIdArgs, "id">
  >;
  projects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  stub: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  user: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export interface DateTimeOffsetScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTimeOffset"], any> {
  name: "DateTimeOffset";
}

export type FileDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["FileDetail"] = ResolversParentTypes["FileDetail"],
> = {
  filename: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  mimetype: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  size: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Item"] = ResolversParentTypes["Item"],
> = {
  archived: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  created: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  detail: Resolver<
    Schema.Maybe<ResolversTypes["ItemDetail"]>,
    ParentType,
    ContextType
  >;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  snoozed: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  summary: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  taskInfo: Resolver<
    Schema.Maybe<ResolversTypes["TaskInfo"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ItemDetail"] = ResolversParentTypes["ItemDetail"],
> = {
  __resolveType: TypeResolveFn<
    "FileDetail" | "LinkDetail" | "NoteDetail" | "ServiceDetail",
    ParentType,
    ContextType
  >;
};

export type ItemSetResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ItemSet"] = ResolversParentTypes["ItemSet"],
> = {
  count: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  items: Resolver<
    ReadonlyArray<ResolversTypes["Item"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["LinkDetail"] = ResolversParentTypes["LinkDetail"],
> = {
  icon: Resolver<
    Schema.Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  url: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  archiveItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationArchiveItemArgs, "id">
  >;
  changePassword: Resolver<
    Schema.Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<
      Schema.MutationChangePasswordArgs,
      "currentPassword" | "newPassword"
    >
  >;
  createLink: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateLinkArgs, "detail" | "isTask" | "item">
  >;
  createNote: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateNoteArgs, "detail" | "isTask" | "item">
  >;
  createTask: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateTaskArgs, "item">
  >;
  createUser: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateUserArgs, "email" | "password">
  >;
  deleteItem: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteItemArgs, "id">
  >;
  deleteUser: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteUserArgs, never>
  >;
  editItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationEditItemArgs, "id" | "item">
  >;
  markTaskDone: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMarkTaskDoneArgs, "id">
  >;
  markTaskDue: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMarkTaskDueArgs, "id">
  >;
  moveItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMoveItemArgs, "id">
  >;
  setTaskController: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationSetTaskControllerArgs, "id">
  >;
  snoozeItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationSnoozeItemArgs, "id">
  >;
};

export type NoteDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NoteDetail"] = ResolversParentTypes["NoteDetail"],
> = {
  note: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Project"] = ResolversParentTypes["Project"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.ProjectItemsArgs, never>
  >;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  stub: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  taskList: Resolver<ResolversTypes["TaskList"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  taskList: Resolver<
    Schema.Maybe<ResolversTypes["TaskList"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.QueryTaskListArgs, "id">
  >;
  user: Resolver<Schema.Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  users: Resolver<
    ReadonlyArray<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
};

export interface RelativeDateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["RelativeDateTime"], any> {
  name: "RelativeDateTime";
}

export type SectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Section"] = ResolversParentTypes["Section"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.SectionItemsArgs, never>
  >;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ServiceDetail"] = ResolversParentTypes["ServiceDetail"],
> = {
  fields: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  hasTaskState: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isCurrentlyListed: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  lists: Resolver<
    ReadonlyArray<ResolversTypes["ServiceList"]>,
    ParentType,
    ContextType
  >;
  serviceId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  wasEverListed: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceListResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ServiceList"] = ResolversParentTypes["ServiceList"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  serviceId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url: Resolver<
    Schema.Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TaskControllerScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["TaskController"], any> {
  name: "TaskController";
}

export type TaskInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TaskInfo"] = ResolversParentTypes["TaskInfo"],
> = {
  controller: Resolver<
    ResolversTypes["TaskController"],
    ParentType,
    ContextType
  >;
  done: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  due: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskListResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TaskList"] = ResolversParentTypes["TaskList"],
> = {
  __resolveType: TypeResolveFn<"Context" | "Project", ParentType, ContextType>;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.TaskListItemsArgs, never>
  >;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
};

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  contexts: Resolver<
    ReadonlyArray<ResolversTypes["Context"]>,
    ParentType,
    ContextType
  >;
  email: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  inbox: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.UserInboxArgs, never>
  >;
  isAdmin: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Context: ContextResolvers<ContextType>;
  DateTime: GraphQLScalarType;
  DateTimeOffset: GraphQLScalarType;
  FileDetail: FileDetailResolvers<ContextType>;
  Item: ItemResolvers<ContextType>;
  ItemDetail: ItemDetailResolvers<ContextType>;
  ItemSet: ItemSetResolvers<ContextType>;
  LinkDetail: LinkDetailResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  NoteDetail: NoteDetailResolvers<ContextType>;
  Project: ProjectResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  RelativeDateTime: GraphQLScalarType;
  Section: SectionResolvers<ContextType>;
  ServiceDetail: ServiceDetailResolvers<ContextType>;
  ServiceList: ServiceListResolvers<ContextType>;
  TaskController: GraphQLScalarType;
  TaskInfo: TaskInfoResolvers<ContextType>;
  TaskList: TaskListResolvers<ContextType>;
  User: UserResolvers<ContextType>;
};
