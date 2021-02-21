/* eslint-disable */
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { User, Context, Project, Section, TaskList, ProjectRoot, Item } from '../db/implementations';
import type { ResolverContext } from './context';
import * as Schema from './types';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
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
) => Schema.Maybe<TTypes> | Promise<Schema.Maybe<TTypes>>;

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
  DateTime: ResolverTypeWrapper<Schema.Scalars['DateTime']>;
  Item: ResolverTypeWrapper<Item>;
  ID: ResolverTypeWrapper<Schema.Scalars['ID']>;
  String: ResolverTypeWrapper<Schema.Scalars['String']>;
  Boolean: ResolverTypeWrapper<Schema.Scalars['Boolean']>;
  Task: ResolverTypeWrapper<Item>;
  PluginItem: ResolverTypeWrapper<Schema.PluginItem>;
  File: ResolverTypeWrapper<Schema.File>;
  Int: ResolverTypeWrapper<Schema.Scalars['Int']>;
  Note: ResolverTypeWrapper<Schema.Note>;
  Link: ResolverTypeWrapper<Schema.Link>;
  TaskList: ResolverTypeWrapper<TaskList>;
  ProjectRoot: ResolverTypeWrapper<ProjectRoot>;
  User: ResolverTypeWrapper<User>;
  Context: ResolverTypeWrapper<Context>;
  Project: ResolverTypeWrapper<Project>;
  Section: ResolverTypeWrapper<Section>;
  Inbox: ResolverTypeWrapper<Omit<Schema.Inbox, 'items'> & { items: ReadonlyArray<ResolversTypes['Item']> }>;
  Query: ResolverTypeWrapper<{}>;
  ContextParams: Schema.ContextParams;
  ProjectParams: Schema.ProjectParams;
  SectionParams: Schema.SectionParams;
  TaskParams: Schema.TaskParams;
  Mutation: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  DateTime: Schema.Scalars['DateTime'];
  Item: Item;
  ID: Schema.Scalars['ID'];
  String: Schema.Scalars['String'];
  Boolean: Schema.Scalars['Boolean'];
  Task: Item;
  PluginItem: Schema.PluginItem;
  File: Schema.File;
  Int: Schema.Scalars['Int'];
  Note: Schema.Note;
  Link: Schema.Link;
  TaskList: TaskList;
  ProjectRoot: ProjectRoot;
  User: User;
  Context: Context;
  Project: Project;
  Section: Section;
  Inbox: Omit<Schema.Inbox, 'items'> & { items: ReadonlyArray<ResolversParentTypes['Item']> };
  Query: {};
  ContextParams: Schema.ContextParams;
  ProjectParams: Schema.ProjectParams;
  SectionParams: Schema.SectionParams;
  TaskParams: Schema.TaskParams;
  Mutation: {};
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ItemResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Task' | 'PluginItem' | 'File' | 'Note' | 'Link', ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type TaskResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  due: Resolver<Schema.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  done: Resolver<Schema.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  link: Resolver<Schema.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PluginItemResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['PluginItem'] = ResolversParentTypes['PluginItem']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  pluginId: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  due: Resolver<Schema.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  done: Resolver<Schema.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FileResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['File'] = ResolversParentTypes['File']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  filename: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimetype: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NoteResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Note'] = ResolversParentTypes['Note']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  note: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LinkResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Link'] = ResolversParentTypes['Link']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  archived: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  icon: Resolver<Schema.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskListResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['TaskList'] = ResolversParentTypes['TaskList']> = ResolversObject<{
  __resolveType: TypeResolveFn<'User' | 'Context' | 'Project', ParentType, ContextType>;
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
}>;

export type ProjectRootResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ProjectRoot'] = ResolversParentTypes['ProjectRoot']> = ResolversObject<{
  __resolveType: TypeResolveFn<'User' | 'Context', ParentType, ContextType>;
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.ProjectRootProjectByIdArgs, 'id'>>;
}>;

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.UserProjectByIdArgs, 'id'>>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  email: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contexts: Resolver<ReadonlyArray<ResolversTypes['Context']>, ParentType, ContextType>;
  inbox: Resolver<ResolversTypes['Inbox'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContextResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Context'] = ResolversParentTypes['Context']> = ResolversObject<{
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  projects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  projectById: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.ContextProjectByIdArgs, 'id'>>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subprojects: Resolver<ReadonlyArray<ResolversTypes['Project']>, ParentType, ContextType>;
  sections: Resolver<ReadonlyArray<ResolversTypes['Section']>, ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  stub: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taskList: Resolver<ResolversTypes['TaskList'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SectionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = ResolversObject<{
  remainingTasks: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InboxResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Inbox'] = ResolversParentTypes['Inbox']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items: Resolver<ReadonlyArray<ResolversTypes['Item']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  user: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  taskList: Resolver<Schema.Maybe<ResolversTypes['TaskList']>, ParentType, ContextType, RequireFields<Schema.QueryTaskListArgs, 'id'>>;
  root: Resolver<Schema.Maybe<ResolversTypes['ProjectRoot']>, ParentType, ContextType, RequireFields<Schema.QueryRootArgs, 'id'>>;
}>;

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  login: Resolver<Schema.Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<Schema.MutationLoginArgs, 'email' | 'password'>>;
  logout: Resolver<Schema.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createContext: Resolver<ResolversTypes['Context'], ParentType, ContextType, RequireFields<Schema.MutationCreateContextArgs, 'params'>>;
  editContext: Resolver<Schema.Maybe<ResolversTypes['Context']>, ParentType, ContextType, RequireFields<Schema.MutationEditContextArgs, 'id' | 'params'>>;
  deleteContext: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteContextArgs, 'id'>>;
  createProject: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<Schema.MutationCreateProjectArgs, 'params'>>;
  moveProject: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.MutationMoveProjectArgs, 'id'>>;
  editProject: Resolver<Schema.Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<Schema.MutationEditProjectArgs, 'id' | 'params'>>;
  deleteProject: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteProjectArgs, 'id'>>;
  createSection: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<Schema.MutationCreateSectionArgs, 'params'>>;
  moveSection: Resolver<Schema.Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<Schema.MutationMoveSectionArgs, 'id'>>;
  editSection: Resolver<Schema.Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<Schema.MutationEditSectionArgs, 'id' | 'params'>>;
  deleteSection: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteSectionArgs, 'id'>>;
  createTask: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Schema.MutationCreateTaskArgs, 'params'>>;
  editTask: Resolver<Schema.Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<Schema.MutationEditTaskArgs, 'id' | 'params'>>;
  moveItem: Resolver<Schema.Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<Schema.MutationMoveItemArgs, 'id'>>;
  deleteItem: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Schema.MutationDeleteItemArgs, 'id'>>;
}>;

export type Resolvers<ContextType = ResolverContext> = ResolversObject<{
  DateTime: GraphQLScalarType;
  Item: ItemResolvers<ContextType>;
  Task: TaskResolvers<ContextType>;
  PluginItem: PluginItemResolvers<ContextType>;
  File: FileResolvers<ContextType>;
  Note: NoteResolvers<ContextType>;
  Link: LinkResolvers<ContextType>;
  TaskList: TaskListResolvers<ContextType>;
  ProjectRoot: ProjectRootResolvers<ContextType>;
  User: UserResolvers<ContextType>;
  Context: ContextResolvers<ContextType>;
  Project: ProjectResolvers<ContextType>;
  Section: SectionResolvers<ContextType>;
  Inbox: InboxResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
