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
  Context: ResolverTypeWrapper<Context>;
  ID: ResolverTypeWrapper<Schema.Scalars["ID"]>;
  String: ResolverTypeWrapper<Schema.Scalars["String"]>;
  ContextParams: Schema.ContextParams;
  DateTime: ResolverTypeWrapper<Schema.Scalars["DateTime"]>;
  DateTimeOffset: ResolverTypeWrapper<Schema.Scalars["DateTimeOffset"]>;
  FileDetail: ResolverTypeWrapper<FileDetail>;
  Int: ResolverTypeWrapper<Schema.Scalars["Int"]>;
  Item: ResolverTypeWrapper<Item>;
  ItemDetail:
    | ResolversTypes["ServiceDetail"]
    | ResolversTypes["LinkDetail"]
    | ResolversTypes["NoteDetail"]
    | ResolversTypes["FileDetail"];
  ItemFilter: Schema.ItemFilter;
  Boolean: ResolverTypeWrapper<Schema.Scalars["Boolean"]>;
  ItemParams: Schema.ItemParams;
  ItemSet: ResolverTypeWrapper<ItemSet>;
  LinkDetail: ResolverTypeWrapper<LinkDetail>;
  LinkDetailParams: Schema.LinkDetailParams;
  Mutation: ResolverTypeWrapper<Root>;
  NoteDetail: ResolverTypeWrapper<NoteDetail>;
  NoteDetailParams: Schema.NoteDetailParams;
  Project: ResolverTypeWrapper<Project>;
  ProjectParams: Schema.ProjectParams;
  Query: ResolverTypeWrapper<Root>;
  RelativeDateTime: ResolverTypeWrapper<Schema.Scalars["RelativeDateTime"]>;
  Section: ResolverTypeWrapper<Section>;
  SectionParams: Schema.SectionParams;
  ServiceDetail: ResolverTypeWrapper<ServiceDetail>;
  ServiceList: ResolverTypeWrapper<ServiceList>;
  TaskController: ResolverTypeWrapper<Schema.Scalars["TaskController"]>;
  TaskInfo: ResolverTypeWrapper<TaskInfo>;
  TaskInfoParams: Schema.TaskInfoParams;
  TaskList: ResolverTypeWrapper<TaskList>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Context: Context;
  ID: Schema.Scalars["ID"];
  String: Schema.Scalars["String"];
  ContextParams: Schema.ContextParams;
  DateTime: Schema.Scalars["DateTime"];
  DateTimeOffset: Schema.Scalars["DateTimeOffset"];
  FileDetail: FileDetail;
  Int: Schema.Scalars["Int"];
  Item: Item;
  ItemDetail:
    | ResolversParentTypes["ServiceDetail"]
    | ResolversParentTypes["LinkDetail"]
    | ResolversParentTypes["NoteDetail"]
    | ResolversParentTypes["FileDetail"];
  ItemFilter: Schema.ItemFilter;
  Boolean: Schema.Scalars["Boolean"];
  ItemParams: Schema.ItemParams;
  ItemSet: ItemSet;
  LinkDetail: LinkDetail;
  LinkDetailParams: Schema.LinkDetailParams;
  Mutation: Root;
  NoteDetail: NoteDetail;
  NoteDetailParams: Schema.NoteDetailParams;
  Project: Project;
  ProjectParams: Schema.ProjectParams;
  Query: Root;
  RelativeDateTime: Schema.Scalars["RelativeDateTime"];
  Section: Section;
  SectionParams: Schema.SectionParams;
  ServiceDetail: ServiceDetail;
  ServiceList: ServiceList;
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
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.ContextItemsArgs, never>
  >;
  rootItems: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.ContextRootItemsArgs, never>
  >;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  user: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  stub: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  projects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  projectById: Resolver<
    Schema.Maybe<ResolversTypes["Project"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.ContextProjectByIdArgs, "id">
  >;
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
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  summary: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  created: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  archived: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  snoozed: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  taskInfo: Resolver<
    Schema.Maybe<ResolversTypes["TaskInfo"]>,
    ParentType,
    ContextType
  >;
  detail: Resolver<
    Schema.Maybe<ResolversTypes["ItemDetail"]>,
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
    "ServiceDetail" | "LinkDetail" | "NoteDetail" | "FileDetail",
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
  createContext: Resolver<
    ResolversTypes["Context"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateContextArgs, "params">
  >;
  editContext: Resolver<
    Schema.Maybe<ResolversTypes["Context"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationEditContextArgs, "id" | "params">
  >;
  deleteContext: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteContextArgs, "id">
  >;
  createProject: Resolver<
    ResolversTypes["Project"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateProjectArgs, "taskList" | "params">
  >;
  moveProject: Resolver<
    Schema.Maybe<ResolversTypes["Project"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMoveProjectArgs, "id" | "taskList">
  >;
  editProject: Resolver<
    Schema.Maybe<ResolversTypes["Project"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationEditProjectArgs, "id" | "params">
  >;
  deleteProject: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteProjectArgs, "id">
  >;
  createSection: Resolver<
    ResolversTypes["Section"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateSectionArgs, "taskList" | "params">
  >;
  moveSection: Resolver<
    Schema.Maybe<ResolversTypes["Section"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMoveSectionArgs, "id" | "taskList">
  >;
  editSection: Resolver<
    Schema.Maybe<ResolversTypes["Section"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationEditSectionArgs, "id" | "params">
  >;
  deleteSection: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteSectionArgs, "id">
  >;
  createTask: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateTaskArgs, "item">
  >;
  createNote: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateNoteArgs, "item" | "detail" | "isTask">
  >;
  createLink: Resolver<
    ResolversTypes["Item"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateLinkArgs, "item" | "detail" | "isTask">
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
  setTaskController: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationSetTaskControllerArgs, "id">
  >;
  moveItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationMoveItemArgs, "id">
  >;
  deleteItem: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteItemArgs, "id">
  >;
  archiveItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationArchiveItemArgs, "id">
  >;
  snoozeItem: Resolver<
    Schema.Maybe<ResolversTypes["Item"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationSnoozeItemArgs, "id">
  >;
  createUser: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<Schema.MutationCreateUserArgs, "email" | "password">
  >;
  deleteUser: Resolver<
    Schema.Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.MutationDeleteUserArgs, never>
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
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.ProjectItemsArgs, never>
  >;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  stub: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  taskList: Resolver<ResolversTypes["TaskList"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  user: Resolver<Schema.Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  users: Resolver<
    ReadonlyArray<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  taskList: Resolver<
    Schema.Maybe<ResolversTypes["TaskList"]>,
    ParentType,
    ContextType,
    RequireFields<Schema.QueryTaskListArgs, "id">
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
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.SectionItemsArgs, never>
  >;
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceDetailResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ServiceDetail"] = ResolversParentTypes["ServiceDetail"],
> = {
  serviceId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  hasTaskState: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  wasEverListed: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isCurrentlyListed: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  fields: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  lists: Resolver<
    ReadonlyArray<ResolversTypes["ServiceList"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceListResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ServiceList"] = ResolversParentTypes["ServiceList"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  serviceId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name: Resolver<ResolversTypes["String"], ParentType, ContextType>;
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
  due: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  done: Resolver<
    Schema.Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  controller: Resolver<
    ResolversTypes["TaskController"],
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
  subprojects: Resolver<
    ReadonlyArray<ResolversTypes["Project"]>,
    ParentType,
    ContextType
  >;
  sections: Resolver<
    ReadonlyArray<ResolversTypes["Section"]>,
    ParentType,
    ContextType
  >;
  items: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.TaskListItemsArgs, never>
  >;
};

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  id: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  email: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  contexts: Resolver<
    ReadonlyArray<ResolversTypes["Context"]>,
    ParentType,
    ContextType
  >;
  inbox: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.UserInboxArgs, never>
  >;
  isAdmin: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  allItems: Resolver<
    ResolversTypes["ItemSet"],
    ParentType,
    ContextType,
    RequireFields<Schema.UserAllItemsArgs, never>
  >;
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