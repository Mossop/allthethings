/* eslint-disable */
import type { DateTime } from 'luxon';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
  TaskController: any;
};

export type Context = TaskList & {
  readonly __typename?: 'Context';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly rootItems: ItemSet;
  readonly id: Scalars['ID'];
  readonly user: User;
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly projects: ReadonlyArray<Project>;
  readonly projectById: Maybe<Project>;
};


export type ContextProjectByIdArgs = {
  id: Scalars['ID'];
};

export type ContextParams = {
  readonly name: Scalars['String'];
};


export type FileDetail = {
  readonly __typename?: 'FileDetail';
  readonly filename: Scalars['String'];
  readonly mimetype: Scalars['String'];
  readonly size: Scalars['Int'];
};

export type GoogleAccount = {
  readonly __typename?: 'GoogleAccount';
  readonly id: Scalars['ID'];
  readonly email: Scalars['String'];
  readonly avatar: Maybe<Scalars['String']>;
  readonly mailSearches: ReadonlyArray<GoogleMailSearch>;
  readonly loginUrl: Scalars['String'];
};

export type GoogleMailSearch = {
  readonly __typename?: 'GoogleMailSearch';
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
  readonly url: Scalars['String'];
};

export type GoogleMailSearchParams = {
  readonly name: Scalars['String'];
  readonly query: Scalars['String'];
};

export type Item = {
  readonly __typename?: 'Item';
  readonly id: Scalars['ID'];
  readonly summary: Scalars['String'];
  readonly created: Scalars['DateTime'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
  readonly taskInfo: Maybe<TaskInfo>;
  readonly detail: Maybe<ItemDetail>;
};

export type ItemDetail = PluginDetail | LinkDetail | NoteDetail | FileDetail;

export type ItemParams = {
  readonly summary: Scalars['String'];
  readonly archived: Maybe<Scalars['DateTime']>;
  readonly snoozed: Maybe<Scalars['DateTime']>;
};

export type ItemSet = {
  readonly __typename?: 'ItemSet';
  readonly count: Scalars['Int'];
  readonly items: ReadonlyArray<Item>;
  readonly snoozed: ItemSet;
  readonly archived: ItemSet;
  readonly due: ItemSet;
  readonly isTask: ItemSet;
};


export type ItemSetSnoozedArgs = {
  isSnoozed: Maybe<Scalars['Boolean']>;
};


export type ItemSetArchivedArgs = {
  isArchived: Maybe<Scalars['Boolean']>;
};


export type ItemSetDueArgs = {
  before: Maybe<Scalars['DateTime']>;
  after: Maybe<Scalars['DateTime']>;
};


export type ItemSetIsTaskArgs = {
  done: Maybe<Scalars['Boolean']>;
};

export type LinkDetail = {
  readonly __typename?: 'LinkDetail';
  readonly icon: Maybe<Scalars['String']>;
  readonly url: Scalars['String'];
};

export type LinkDetailParams = {
  readonly url: Scalars['String'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly archiveItem: Maybe<Item>;
  readonly changePassword: Maybe<User>;
  readonly createContext: Context;
  readonly createGoogleMailSearch: GoogleMailSearch;
  readonly createLink: Item;
  readonly createNote: Item;
  readonly createProject: Project;
  readonly createSection: Section;
  readonly createTask: Item;
  readonly createUser: User;
  readonly deleteContext: Scalars['Boolean'];
  readonly deleteItem: Scalars['Boolean'];
  readonly deleteProject: Scalars['Boolean'];
  readonly deleteSection: Scalars['Boolean'];
  readonly deleteUser: Maybe<Scalars['Boolean']>;
  readonly editContext: Maybe<Context>;
  readonly editItem: Maybe<Item>;
  readonly editProject: Maybe<Project>;
  readonly editSection: Maybe<Section>;
  readonly editTaskController: Maybe<Item>;
  readonly editTaskInfo: Maybe<Item>;
  readonly login: Maybe<User>;
  readonly logout: Maybe<Scalars['Boolean']>;
  readonly markItemDue: Maybe<Item>;
  readonly moveItem: Maybe<Item>;
  readonly moveProject: Maybe<Project>;
  readonly moveSection: Maybe<Section>;
  readonly snoozeItem: Maybe<Item>;
};


export type MutationArchiveItemArgs = {
  id: Scalars['ID'];
  archived: Maybe<Scalars['DateTime']>;
};


export type MutationChangePasswordArgs = {
  id: Maybe<Scalars['ID']>;
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationCreateContextArgs = {
  user: Maybe<Scalars['ID']>;
  params: ContextParams;
};


export type MutationCreateGoogleMailSearchArgs = {
  account: Scalars['ID'];
  params: GoogleMailSearchParams;
};


export type MutationCreateLinkArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: LinkDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateNoteArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
  detail: NoteDetailParams;
  isTask: Scalars['Boolean'];
};


export type MutationCreateProjectArgs = {
  taskList: Scalars['ID'];
  params: ProjectParams;
};


export type MutationCreateSectionArgs = {
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
  params: SectionParams;
};


export type MutationCreateTaskArgs = {
  user: Maybe<Scalars['ID']>;
  section: Maybe<Scalars['ID']>;
  item: ItemParams;
};


export type MutationCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  isAdmin: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteContextArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUserArgs = {
  id: Maybe<Scalars['ID']>;
};


export type MutationEditContextArgs = {
  id: Scalars['ID'];
  params: ContextParams;
};


export type MutationEditItemArgs = {
  id: Scalars['ID'];
  item: ItemParams;
};


export type MutationEditProjectArgs = {
  id: Scalars['ID'];
  params: ProjectParams;
};


export type MutationEditSectionArgs = {
  id: Scalars['ID'];
  params: SectionParams;
};


export type MutationEditTaskControllerArgs = {
  id: Scalars['ID'];
  controller: Maybe<Scalars['TaskController']>;
};


export type MutationEditTaskInfoArgs = {
  id: Scalars['ID'];
  taskInfo: Maybe<TaskInfoParams>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationMarkItemDueArgs = {
  id: Scalars['ID'];
  due: Maybe<Scalars['DateTime']>;
};


export type MutationMoveItemArgs = {
  id: Scalars['ID'];
  section: Maybe<Scalars['ID']>;
  before: Maybe<Scalars['ID']>;
};


export type MutationMoveProjectArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
};


export type MutationMoveSectionArgs = {
  id: Scalars['ID'];
  taskList: Scalars['ID'];
  before: Maybe<Scalars['ID']>;
};


export type MutationSnoozeItemArgs = {
  id: Scalars['ID'];
  snoozed: Maybe<Scalars['DateTime']>;
};

export type NoteDetail = {
  readonly __typename?: 'NoteDetail';
  readonly note: Scalars['String'];
};

export type NoteDetailParams = {
  readonly note: Scalars['String'];
};

export type PluginDetail = {
  readonly __typename?: 'PluginDetail';
  readonly pluginId: Scalars['String'];
  readonly hasTaskState: Scalars['Boolean'];
  readonly wasEverListed: Scalars['Boolean'];
  readonly isCurrentlyListed: Scalars['Boolean'];
  readonly fields: Scalars['String'];
  readonly lists: ReadonlyArray<PluginList>;
};

export type PluginList = {
  readonly __typename?: 'PluginList';
  readonly id: Scalars['ID'];
  readonly pluginId: Scalars['String'];
  readonly name: Scalars['String'];
  readonly url: Maybe<Scalars['String']>;
};

export type Problem = {
  readonly __typename?: 'Problem';
  readonly description: Scalars['String'];
  readonly url: Scalars['String'];
};

export type Project = TaskList & {
  readonly __typename?: 'Project';
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
  readonly id: Scalars['ID'];
  readonly stub: Scalars['String'];
  readonly name: Scalars['String'];
  readonly taskList: TaskList;
};

export type ProjectParams = {
  readonly name: Scalars['String'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly googleLoginUrl: Scalars['String'];
  readonly pageContent: Scalars['String'];
  readonly problems: ReadonlyArray<Problem>;
  readonly taskList: Maybe<TaskList>;
  readonly user: Maybe<User>;
  readonly users: ReadonlyArray<User>;
};


export type QueryPageContentArgs = {
  path: Scalars['String'];
};


export type QueryTaskListArgs = {
  id: Scalars['ID'];
};

export type Section = {
  readonly __typename?: 'Section';
  readonly items: ItemSet;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type SectionParams = {
  readonly name: Scalars['String'];
};


export type TaskInfo = {
  readonly __typename?: 'TaskInfo';
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
  readonly controller: Scalars['TaskController'];
};

export type TaskInfoParams = {
  readonly due: Maybe<Scalars['DateTime']>;
  readonly done: Maybe<Scalars['DateTime']>;
};

export type TaskList = {
  readonly subprojects: ReadonlyArray<Project>;
  readonly sections: ReadonlyArray<Section>;
  readonly items: ItemSet;
};

export type User = {
  readonly __typename?: 'User';
  readonly allItems: ItemSet;
  readonly contexts: ReadonlyArray<Context>;
  readonly email: Scalars['String'];
  readonly googleAccounts: ReadonlyArray<GoogleAccount>;
  readonly id: Scalars['ID'];
  readonly inbox: ItemSet;
  readonly isAdmin: Scalars['Boolean'];
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
  Context: ResolverTypeWrapper<Context>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ContextParams: ContextParams;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  FileDetail: ResolverTypeWrapper<FileDetail>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  GoogleAccount: ResolverTypeWrapper<GoogleAccount>;
  GoogleMailSearch: ResolverTypeWrapper<GoogleMailSearch>;
  GoogleMailSearchParams: GoogleMailSearchParams;
  Item: ResolverTypeWrapper<Omit<Item, 'detail'> & { detail: Maybe<ResolversTypes['ItemDetail']> }>;
  ItemDetail: ResolversTypes['PluginDetail'] | ResolversTypes['LinkDetail'] | ResolversTypes['NoteDetail'] | ResolversTypes['FileDetail'];
  ItemParams: ItemParams;
  ItemSet: ResolverTypeWrapper<ItemSet>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  LinkDetail: ResolverTypeWrapper<LinkDetail>;
  LinkDetailParams: LinkDetailParams;
  Mutation: ResolverTypeWrapper<{}>;
  NoteDetail: ResolverTypeWrapper<NoteDetail>;
  NoteDetailParams: NoteDetailParams;
  PluginDetail: ResolverTypeWrapper<PluginDetail>;
  PluginList: ResolverTypeWrapper<PluginList>;
  Problem: ResolverTypeWrapper<Problem>;
  Project: ResolverTypeWrapper<Project>;
  ProjectParams: ProjectParams;
  Query: ResolverTypeWrapper<{}>;
  Section: ResolverTypeWrapper<Section>;
  SectionParams: SectionParams;
  TaskController: ResolverTypeWrapper<Scalars['TaskController']>;
  TaskInfo: ResolverTypeWrapper<TaskInfo>;
  TaskInfoParams: TaskInfoParams;
  TaskList: ResolversTypes['Context'] | ResolversTypes['Project'];
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Context: Context;
  ID: Scalars['ID'];
  String: Scalars['String'];
  ContextParams: ContextParams;
  DateTime: Scalars['DateTime'];
  FileDetail: FileDetail;
  Int: Scalars['Int'];
  GoogleAccount: GoogleAccount;
  GoogleMailSearch: GoogleMailSearch;
  GoogleMailSearchParams: GoogleMailSearchParams;
  Item: Omit<Item, 'detail'> & { detail: Maybe<ResolversParentTypes['ItemDetail']> };
  ItemDetail: ResolversParentTypes['PluginDetail'] | ResolversParentTypes['LinkDetail'] | ResolversParentTypes['NoteDetail'] | ResolversParentTypes['FileDetail'];
  ItemParams: ItemParams;
  ItemSet: ItemSet;
  Boolean: Scalars['Boolean'];
  LinkDetail: LinkDetail;
  LinkDetailParams: LinkDetailParams;
  Mutation: {};
  NoteDetail: NoteDetail;
  NoteDetailParams: NoteDetailParams;
  PluginDetail: PluginDetail;
  PluginList: PluginList;
  Problem: Problem;
  Project: Project;
  ProjectParams: ProjectParams;
  Query: {};
  Section: Section;
  SectionParams: SectionParams;
  TaskController: Scalars['TaskController'];
  TaskInfo: TaskInfo;
  TaskInfoParams: TaskInfoParams;
  TaskList: ResolversParentTypes['Context'] | ResolversParentTypes['Project'];
  User: User;
}>;

export type ContextResolvers<ContextType = any, ParentType extends ResolversParentTypes['Context'] = ResolversParentTypes['Context']> = ResolversObject<{
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  rootItems: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<ContextProjectByIdArgs, 'id'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FileDetailResolvers<ContextType = any, ParentType extends ResolversParentTypes['FileDetail'] = ResolversParentTypes['FileDetail']> = ResolversObject<{
  filename: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimetype: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoogleAccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['GoogleAccount'] = ResolversParentTypes['GoogleAccount']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  avatar: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailSearches: Resolver<ReadonlyArray<ResolversTypes['GoogleMailSearch']>, ParentType, ContextType>;
  loginUrl: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoogleMailSearchResolvers<ContextType = any, ParentType extends ResolversParentTypes['GoogleMailSearch'] = ResolversParentTypes['GoogleMailSearch']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  query: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  archived: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  snoozed: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  taskInfo: Resolver<Maybe<ResolversTypes['TaskInfo']>, ParentType, ContextType>;
  detail: Resolver<Maybe<ResolversTypes['ItemDetail']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ItemDetailResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemDetail'] = ResolversParentTypes['ItemDetail']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PluginDetail' | 'LinkDetail' | 'NoteDetail' | 'FileDetail', ParentType, ContextType>;
}>;

export type ItemSetResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemSet'] = ResolversParentTypes['ItemSet']> = ResolversObject<{
  count: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  snoozed: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType, RequireFields<ItemSetSnoozedArgs, never>>;
  archived: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType, RequireFields<ItemSetArchivedArgs, never>>;
  due: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType, RequireFields<ItemSetDueArgs, never>>;
  isTask: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType, RequireFields<ItemSetIsTaskArgs, never>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LinkDetailResolvers<ContextType = any, ParentType extends ResolversParentTypes['LinkDetail'] = ResolversParentTypes['LinkDetail']> = ResolversObject<{
  icon: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  archiveItem: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationArchiveItemArgs, 'id'>>;
  changePassword: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'currentPassword' | 'newPassword'>>;
  createContext: Resolver<ResolversTypes['Context'], ParentType, ContextType, RequireFields<MutationCreateContextArgs, 'params'>>;
  createGoogleMailSearch: Resolver<ResolversTypes['GoogleMailSearch'], ParentType, ContextType, RequireFields<MutationCreateGoogleMailSearchArgs, 'account' | 'params'>>;
  createLink: Resolver<ResolversTypes['Item'], ParentType, ContextType, RequireFields<MutationCreateLinkArgs, 'item' | 'detail' | 'isTask'>>;
  createNote: Resolver<ResolversTypes['Item'], ParentType, ContextType, RequireFields<MutationCreateNoteArgs, 'item' | 'detail' | 'isTask'>>;
  createProject: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'taskList' | 'params'>>;
  createSection: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationCreateSectionArgs, 'taskList' | 'params'>>;
  createTask: Resolver<ResolversTypes['Item'], ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'item'>>;
  createUser: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'email' | 'password'>>;
  deleteContext: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteContextArgs, 'id'>>;
  deleteItem: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteItemArgs, 'id'>>;
  deleteProject: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'id'>>;
  deleteSection: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSectionArgs, 'id'>>;
  deleteUser: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, never>>;
  editContext: Resolver<Maybe<ResolversTypes['Context']>, ParentType, ContextType, RequireFields<MutationEditContextArgs, 'id' | 'params'>>;
  editItem: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationEditItemArgs, 'id' | 'item'>>;
  editProject: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationEditProjectArgs, 'id' | 'params'>>;
  editSection: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<MutationEditSectionArgs, 'id' | 'params'>>;
  editTaskController: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationEditTaskControllerArgs, 'id'>>;
  editTaskInfo: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationEditTaskInfoArgs, 'id'>>;
  login: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  markItemDue: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationMarkItemDueArgs, 'id'>>;
  moveItem: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationMoveItemArgs, 'id'>>;
  moveProject: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationMoveProjectArgs, 'id' | 'taskList'>>;
  moveSection: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<MutationMoveSectionArgs, 'id' | 'taskList'>>;
  snoozeItem: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSnoozeItemArgs, 'id'>>;
}>;

export type NoteDetailResolvers<ContextType = any, ParentType extends ResolversParentTypes['NoteDetail'] = ResolversParentTypes['NoteDetail']> = ResolversObject<{
  note: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PluginDetailResolvers<ContextType = any, ParentType extends ResolversParentTypes['PluginDetail'] = ResolversParentTypes['PluginDetail']> = ResolversObject<{
  pluginId: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasTaskState: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  wasEverListed: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isCurrentlyListed: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fields: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lists: Resolver<ReadonlyArray<ResolversTypes['PluginList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PluginListResolvers<ContextType = any, ParentType extends ResolversParentTypes['PluginList'] = ResolversParentTypes['PluginList']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pluginId: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProblemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Problem'] = ResolversParentTypes['Problem']> = ResolversObject<{
  description: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taskList: Resolver<ResolversTypes['TaskList'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  googleLoginUrl: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pageContent: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryPageContentArgs, 'path'>>;
  problems: Resolver<ReadonlyArray<ResolversTypes['Problem']>, ParentType, ContextType>;
  taskList: Resolver<Maybe<ResolversTypes['TaskList']>, ParentType, ContextType, RequireFields<QueryTaskListArgs, 'id'>>;
  user: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  users: Resolver<ReadonlyArray<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = ResolversObject<{
  items: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TaskControllerScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TaskController'], any> {
  name: 'TaskController';
}

export type TaskInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskInfo'] = ResolversParentTypes['TaskInfo']> = ResolversObject<{
  due: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  done: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  controller: Resolver<ResolversTypes['TaskController'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskListResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskList'] = ResolversParentTypes['TaskList']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Context' | 'Project', ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  allItems: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  contexts: Resolver<ReadonlyArray<ResolversTypes['Context']>, ParentType, ContextType>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  googleAccounts: Resolver<ReadonlyArray<ResolversTypes['GoogleAccount']>, ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inbox: Resolver<ResolversTypes['ItemSet'], ParentType, ContextType>;
  isAdmin: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Context: ContextResolvers<ContextType>;
  DateTime: GraphQLScalarType;
  FileDetail: FileDetailResolvers<ContextType>;
  GoogleAccount: GoogleAccountResolvers<ContextType>;
  GoogleMailSearch: GoogleMailSearchResolvers<ContextType>;
  Item: ItemResolvers<ContextType>;
  ItemDetail: ItemDetailResolvers<ContextType>;
  ItemSet: ItemSetResolvers<ContextType>;
  LinkDetail: LinkDetailResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  NoteDetail: NoteDetailResolvers<ContextType>;
  PluginDetail: PluginDetailResolvers<ContextType>;
  PluginList: PluginListResolvers<ContextType>;
  Problem: ProblemResolvers<ContextType>;
  Project: ProjectResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  Section: SectionResolvers<ContextType>;
  TaskController: GraphQLScalarType;
  TaskInfo: TaskInfoResolvers<ContextType>;
  TaskList: TaskListResolvers<ContextType>;
  User: UserResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
