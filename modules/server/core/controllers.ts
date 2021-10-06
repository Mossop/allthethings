import { createHash } from "crypto";
import fsSync, { promises as fs } from "fs";
import path from "path";
import { URL } from "url";

import {
  Route,
  Get,
  Query,
  Post,
  Body,
  Put,
  Inject,
  Patch,
  Delete,
} from "@tsoa/runtime";
import { DateTime } from "luxon";

import { ItemHolderBase } from ".";
import { sql } from "../../db";
import {
  addOffset,
  decodeDateTime,
  decodeRelativeDateTime,
  map,
} from "../../utils";
import type { Problem, Transaction } from "../utils";
import {
  NotAuthenticatedError,
  ref,
  TaskController,
  bestIcon,
  loadPageInfo,
  HttpError,
  NotFoundError,
} from "../utils";
import type { TaskInfoEntity } from "./entities";
import { ItemType } from "./entities";
import type {
  ContextState,
  UserState,
  ProjectState,
  ProjectParams,
  ContextParams,
  SectionParams,
  SectionState,
  ItemParams,
  ItemHolder,
  ItemState,
  LinkDetailParams,
  ItemFilter,
  UserParams,
} from "./implementations";
import {
  ServiceListItem,
  ServiceDetail,
  TaskInfo,
  LinkDetail,
  Item,
  Section,
  Project,
  TaskListBase,
  User,
  Context,
} from "./implementations";
import { ServiceManager } from "./services";
import { Administrator, Authenticated, CoreController } from "./utils";

const pageRoot = path.normalize(
  path.join(__dirname, "..", "..", "..", "static", "pages"),
);

async function loadFile(name: string): Promise<string | null> {
  try {
    let content = await fs.readFile(name, {
      encoding: "utf8",
    });
    return content;
  } catch (e) {
    return null;
  }
}

interface LoginParams {
  email: string;
  password: string;
}

let schema = JSON.parse(
  fsSync.readFileSync(
    path.join(__dirname, "..", "..", "..", "modules", "schema", "openapi.json"),
    { encoding: "utf-8" },
  ),
);
let hasher = createHash("sha256");
hasher.update(JSON.stringify(schema));
let schemaVersion = hasher.digest("hex");

export interface ApiItemFilter {
  itemHolderId?: string | null;
  isTask?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  doneBefore?: string;
  doneAfter?: string;
  isDue?: boolean;
  isDone?: boolean;
  isSnoozed?: boolean;
  isArchived?: boolean;
}

function intoItemFilter(filter: ApiItemFilter): ItemFilter {
  let makeDate = (val: string | undefined): DateTime | undefined => {
    if (!val) {
      return undefined;
    }

    let relative = decodeRelativeDateTime(val);
    if (DateTime.isDateTime(relative)) {
      return relative;
    }

    return addOffset(DateTime.now(), relative);
  };

  return {
    ...filter,
    dueBefore: makeDate(filter.dueBefore),
    dueAfter: makeDate(filter.dueAfter),
    doneBefore: makeDate(filter.doneBefore),
    doneAfter: makeDate(filter.doneAfter),
  };
}

function intoItemFilters(
  filters: ApiItemFilter | ApiItemFilter[],
): ItemFilter[] {
  if (!Array.isArray(filters)) {
    return [intoItemFilter(filters)];
  }

  return filters.map(intoItemFilter);
}

@Route()
export class MainController extends CoreController {
  @Get("page")
  public async getPageContent(@Query("path") page: string): Promise<string> {
    let target: string;

    if (page.length > 1) {
      target = path.join(pageRoot, ...page.substring(1).split("/"));
    } else {
      target = path.normalize(path.join(pageRoot, "..", "..", "README"));
    }

    let content = await loadFile(target + ".md");
    if (content) {
      return content;
    }

    content = await loadFile(path.join(target, "index.md"));
    if (content) {
      return content;
    }

    throw new Error(`Unknown file: ${target}`);
  }

  @Post("login")
  public async login(@Body() params: LoginParams): Promise<UserState> {
    if (!this.context.session) {
      throw new HttpError(500, "Session not initialized");
    }

    let { email, password } = params;
    let tx = await this.startTransaction(false);
    let user = await User.store(tx).findOne({ email });
    if (user && (await user.verifyUser(password))) {
      this.context.session.userId = user.id;
      this.context.session.save();

      return user.state;
    } else {
      throw new HttpError(401, "Unknown user or invalid password");
    }
  }

  @Post("logout")
  public async logout(): Promise<void> {
    if (!this.context.session) {
      throw new HttpError(500, "Session not initialized");
    }

    this.context.session.userId = null;
    this.context.session.save();
  }
}

@Route("/users")
export class UserController extends CoreController {
  @Administrator(false)
  @Get()
  public async listUsers(@Inject() tx: Transaction): Promise<UserState[]> {
    return map(User.store(tx).find(), (user: User) => user.state);
  }

  @Administrator(true)
  @Put()
  public async createUser(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    params: UserParams,
  ): Promise<UserState> {
    let newUser = await User.create(tx, params);

    return newUser.state;
  }

  @Authenticated(true)
  @Patch()
  public async editUser(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      currentPassword,
      ...params
    }: Partial<UserParams> & {
      id?: string;
      currentPassword?: string;
    },
  ): Promise<UserState> {
    let { isAdmin } = user;

    if (id && id != user.id) {
      if (!isAdmin) {
        throw new NotAuthenticatedError();
      }

      user = await User.store(tx).get(id);
    }

    if (params.isAdmin && !user.isAdmin && !isAdmin) {
      throw new NotAuthenticatedError();
    }

    if (params.password !== undefined) {
      if (!isAdmin && !(await user.verifyUser(currentPassword ?? ""))) {
        throw new NotAuthenticatedError();
      }
    }

    await user.update(params);

    return user.state;
  }

  @Authenticated(true)
  @Delete()
  public async deleteUser(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
    }: {
      id?: string;
    },
  ): Promise<void> {
    if (id && id != user.id) {
      if (!user.isAdmin) {
        throw new NotAuthenticatedError();
      }

      user = await User.store(tx).get(id);
    }

    await user.delete();

    if (this.context.session?.userId == user.id) {
      this.context.session.userId = null;
      this.context.session.save();
    }
  }
}

type ServerProjectState = ProjectState & {
  dueTasks: number;
};

type ServerContextState = ContextState & {
  dueTasks: number;

  projects: ServerProjectState[];
};

type ServerUserState = UserState & {
  inbox: number;

  contexts: ServerContextState[];
};

export interface ServerState {
  user: ServerUserState | null;

  problems: Problem[];

  schemaVersion: string;
}

@Route("/state")
export class StateController extends CoreController {
  @Post()
  public async getState(
    @Body()
    {
      itemFilter,
    }: {
      itemFilter:
        | Omit<ApiItemFilter, "itemHolderId">
        | Omit<ApiItemFilter, "itemHolderId">[];
    },
  ): Promise<ServerState> {
    let tx = await this.startTransaction(false);

    let user: ServerUserState | null = null;

    if (this.userId) {
      let filters = intoItemFilters(itemFilter);
      let userImpl = await User.store(tx).findOne({ id: this.userId });

      let withItemHolderId = (id: string): ItemFilter[] => {
        return filters.map(
          (filter: ItemFilter): ItemFilter => ({
            ...filter,
            itemHolderId: id,
          }),
        );
      };

      if (userImpl) {
        let inboxItems = await Item.count(tx, {
          itemHolderId: null,
          isArchived: false,
          isSnoozed: false,
          isDone: false,
        });

        let contexts = await map(
          userImpl.contexts(),
          async (context: Context): Promise<ServerContextState> => {
            let projects = await map(
              context.projects(),
              async (project: Project): Promise<ServerProjectState> => {
                return {
                  ...project.state,
                  dueTasks: await Item.count(tx, withItemHolderId(project.id)),
                };
              },
            );

            return {
              ...context.state,
              dueTasks: await Item.count(tx, withItemHolderId(context.id)),
              projects,
            };
          },
        );

        user = {
          ...userImpl.state,
          inbox: inboxItems,
          contexts,
        };
      }
    }

    return {
      user,
      problems: await ServiceManager.listProblems(tx, this.userId),
      schemaVersion,
    };
  }
}

export type SectionContents = SectionState & {
  items: ItemState[];
};

export type ProjectContents = ProjectState & {
  items: ItemState[];

  sections: SectionContents[];
};

export type ContextContents = ContextState & {
  items: ItemState[];

  sections: SectionContents[];
};

@Route("/project")
export class ProjectController extends CoreController {
  @Authenticated(true)
  @Put()
  public async createProject(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { taskListId, params }: { taskListId: string; params: ProjectParams },
  ): Promise<ProjectState> {
    let taskList = await TaskListBase.getTaskList(tx, taskListId);
    if (!taskList) {
      throw new NotFoundError();
    }

    let project = await Project.create(tx, taskList, params);
    return project.state;
  }

  @Authenticated(false)
  @Post("/contents")
  public async listContents(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      itemFilter,
    }: {
      id: string;
      itemFilter?:
        | Omit<ApiItemFilter, "itemHolderId">
        | Omit<ApiItemFilter, "itemHolderId">[];
    },
  ): Promise<ProjectContents | ContextContents> {
    let taskList = await TaskListBase.getTaskList(tx, id);
    if (!taskList) {
      throw new NotFoundError();
    }

    let filters = itemFilter ? intoItemFilters(itemFilter) : null;

    let withItemHolderId = (id: string): ItemFilter[] => {
      if (!filters) {
        return [
          {
            itemHolderId: id,
          },
        ];
      }

      return filters.map(
        (filter: ItemFilter): ItemFilter => ({
          ...filter,
          itemHolderId: id,
        }),
      );
    };

    let sections = await map(
      taskList.sections(),
      async (section: Section): Promise<SectionContents> => {
        let items = Item.list(tx, withItemHolderId(section.id));

        return {
          ...section.state,

          items: await map(
            items,
            (item: Item): Promise<ItemState> => item.state,
          ),
        };
      },
    );

    let items = Item.list(tx, withItemHolderId(taskList.id));

    return {
      ...taskList.state,
      items: await map(items, (item: Item): Promise<ItemState> => item.state),
      sections,
    };
  }

  @Authenticated(true)
  @Patch()
  public async editProject(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id, params }: { id: string; params: Partial<ProjectParams> },
  ): Promise<ProjectState> {
    let project = await Project.store(tx).get(id);

    await project.update(params);

    return project.state;
  }

  @Authenticated(true)
  @Patch("/move")
  public async moveProject(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id, taskListId }: { id: string; taskListId: string },
  ): Promise<ProjectState> {
    let project = await Project.store(tx).get(id);

    let taskList = await TaskListBase.getTaskList(tx, taskListId);
    if (!taskList) {
      throw new Error("Unknown task list.");
    }

    await project.move(taskList);

    return project.state;
  }

  @Authenticated(true)
  @Delete()
  public async deleteProject(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    let project = await Project.store(tx).get(id);

    await project.delete();
  }
}

@Route("/context")
export class ContextController extends CoreController {
  @Authenticated(true)
  @Put()
  public async createContext(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { params }: { params: ContextParams },
  ): Promise<ContextState> {
    let context = await Context.create(tx, user, params);
    return context.state;
  }

  @Authenticated(true)
  @Patch()
  public async editContext(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id, params }: { id: string; params: Partial<ContextParams> },
  ): Promise<ContextState> {
    let context = await Context.store(tx).get(id);

    await context.update(params);

    return context.state;
  }

  @Authenticated(true)
  @Delete()
  public async deleteContext(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    // Do this first to verify the context exists.
    let context = await Context.store(tx).get(id);

    let contexts = await Context.store(tx).count({
      userId: user.id,
    });

    if (contexts == 1) {
      throw new Error("Cannot delete the last context.");
    }

    await context.delete();
  }
}

@Route("/section")
export class SectionController extends CoreController {
  @Authenticated(true)
  @Put()
  public async createSection(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      taskListId,
      beforeId,
      params,
    }: { taskListId: string; beforeId?: string | null; params: SectionParams },
  ): Promise<SectionState> {
    let taskList = await TaskListBase.getTaskList(tx, taskListId);
    if (!taskList) {
      throw new NotFoundError();
    }

    let before = beforeId ? await Section.store(tx).get(beforeId) : null;

    let section = await Section.create(tx, taskList, before, params);
    return section.state;
  }

  @Authenticated(true)
  @Patch()
  public async editSection(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id, params }: { id: string; params: Partial<SectionParams> },
  ): Promise<SectionState> {
    let section = await Section.store(tx).get(id);

    await section.update(params);

    return section.state;
  }

  @Authenticated(true)
  @Delete()
  public async deleteSection(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    { id }: { id: string },
  ): Promise<void> {
    let section = await Section.store(tx).get(id);

    await section.delete();
  }
}

@Route("/item")
export class ItemController extends CoreController {
  @Authenticated(false)
  @Post("/list")
  public async listItems(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      itemFilter,
    }: {
      itemFilter: ApiItemFilter | ApiItemFilter[];
    },
  ): Promise<ItemState[]> {
    let filters = intoItemFilters(itemFilter);
    return map(
      Item.list(tx, filters),
      (item: Item): Promise<ItemState> => item.state,
    );
  }

  @Authenticated(true)
  @Put("/task")
  public async createTask(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      itemHolderId,
      beforeId,
      item: itemParams,
      task: taskParams,
    }: {
      itemHolderId?: string | null;
      beforeId?: string | null;
      item: ItemParams;
      task?: { due?: string | null; done?: string | null };
    },
  ): Promise<ItemState> {
    let itemHolder: ItemHolder | null = null;
    let before: Item | null = null;
    if (itemHolderId) {
      itemHolder = await ItemHolderBase.getItemHolder(tx, itemHolderId);
      if (!itemHolder) {
        throw new NotFoundError();
      }

      if (beforeId) {
        before = await Item.store(tx).get(beforeId);
      }
    }

    let item = await Item.create(tx, user, null, itemParams);

    let due = decodeDateTime(taskParams?.due);
    let done = decodeDateTime(taskParams?.done);

    await TaskInfo.store(tx).create({
      id: item.id,
      due,
      done,
      manualDue: due,
      manualDone: done,
      controller: TaskController.Manual,
    });

    if (itemHolder) {
      await item.move(itemHolder, before);
    }

    return item.state;
  }

  @Authenticated(true)
  @Patch("/task")
  public async editTask(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      params,
    }: {
      id: string;
      params: Partial<{
        due: string | null;
        done: string | null;
      }>;
    },
  ): Promise<ItemState> {
    let item = await Item.store(tx).get(id);

    let taskInfo = await item.taskInfo;
    if (!taskInfo) {
      let due = decodeDateTime(params.due);
      let done = decodeDateTime(params.done);

      await TaskInfo.store(tx).create({
        id,
        due,
        done,
        manualDue: due,
        manualDone: done,
        controller: TaskController.Manual,
      });
    } else {
      let updates: Partial<TaskInfoEntity> = {
        controller: TaskController.Manual,
      };

      if (params.due !== undefined) {
        updates.manualDue = decodeDateTime(params.due);
      } else {
        updates.manualDue = taskInfo.manualDue;
      }

      if (params.done !== undefined) {
        updates.manualDone = decodeDateTime(params.done);
      } else {
        updates.manualDone = taskInfo.manualDone;
      }

      updates.due = updates.manualDue;
      updates.done = updates.manualDone;

      await taskInfo.update(updates);
    }

    return item.state;
  }

  @Authenticated(true)
  @Patch("/task/controller")
  public async editTaskController(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      controller,
    }: {
      id: string;
      controller: TaskController | null;
    },
  ): Promise<ItemState> {
    let item = await Item.store(tx).get(id);

    let taskInfo = await item.taskInfo;
    if (!controller) {
      if (taskInfo) {
        await taskInfo.delete();
      }

      return item.state;
    }

    if (taskInfo && taskInfo.controller == controller) {
      return item.state;
    }

    if (controller == TaskController.Manual) {
      if (taskInfo) {
        await taskInfo.update({
          due: taskInfo.manualDue,
          done: taskInfo.manualDone,
          controller,
        });
      } else {
        await TaskInfo.store(tx).create({
          id,
          due: null,
          done: null,
          manualDue: null,
          manualDone: null,
          controller,
        });
      }
    } else {
      let detail = await item.detail;
      if (!detail || !(detail instanceof ServiceDetail)) {
        throw new Error("This item is not a service item.");
      }

      if (controller == TaskController.Service) {
        if (!detail.hasTaskState) {
          throw new Error("This service does not supply task information");
        }

        if (taskInfo) {
          await taskInfo.update({
            due: detail.taskDue,
            done: detail.taskDone,
            controller,
          });
        } else {
          await TaskInfo.store(tx).create({
            id,
            due: detail.taskDue,
            done: detail.taskDone,
            manualDue: null,
            manualDone: null,
            controller,
          });
        }
      } else {
        let { count, due, done, doneCount } = (await tx.db.first<{
          count: number;
          due: DateTime | null;
          done: DateTime | null;
          doneCount: number;
        }>(
          sql`
            SELECT
              COUNT(*)::integer AS count,
              MIN("due") AS "due",
              MAX("done") AS "done",
              COUNT("done")::integer AS "doneCount"
            FROM ${ref(ServiceListItem)}
            WHERE "itemId" = ${id}
          `,
        ))!;

        if (count == 0) {
          throw new Error("This item has never been in any service lists");
        }

        if (doneCount < count) {
          done = null;
        }

        if (taskInfo) {
          await taskInfo.update({
            due,
            done,
            controller,
          });
        } else {
          await TaskInfo.store(tx).create({
            id,
            due,
            done,
            manualDue: null,
            manualDone: null,
            controller,
          });
        }
      }
    }

    return item.state;
  }

  @Authenticated(true)
  @Put("/link")
  public async createLink(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      itemHolderId,
      beforeId,
      item: itemParams,
      link: { url },
      isTask,
    }: {
      itemHolderId?: string | null;
      beforeId?: string | null;
      item: ItemParams;
      link: LinkDetailParams;
      isTask: boolean;
    },
  ): Promise<ItemState> {
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      throw new Error("Invalid url.");
    }

    let itemHolder: ItemHolder | null = null;
    let before: Item | null = null;
    if (itemHolderId) {
      itemHolder = await ItemHolderBase.getItemHolder(tx, itemHolderId);
      if (!itemHolder) {
        throw new NotFoundError();
      }

      if (beforeId) {
        before = await Item.store(tx).get(beforeId);
      }
    }

    let id = await ServiceManager.createItemFromURL(
      tx,
      user.id,
      targetUrl,
      isTask,
    );
    if (id) {
      let item = await Item.store(tx).get(id);
      if (itemHolder) {
        await item.move(itemHolder, null);
      }

      return item.state;
    }

    let pageInfo = await loadPageInfo(tx.segment, targetUrl);

    let summary = itemParams.summary;
    if (!summary) {
      summary = pageInfo.title ?? targetUrl.toString();
    }

    let item = await Item.create(tx, user, ItemType.Link, {
      ...itemParams,
      summary,
    });

    if (isTask) {
      await TaskInfo.store(tx).create({
        id: item.id,
        due: null,
        done: null,
        manualDue: null,
        manualDone: null,
        controller: TaskController.Manual,
      });
    }

    let icons = [...pageInfo.icons];
    let icon: string | null = bestIcon(icons, 32)?.url.toString() ?? null;

    await LinkDetail.create(tx, item, {
      url,
      icon,
    });

    if (itemHolder) {
      await item.move(itemHolder, before);
    }

    return item.state;
  }

  @Authenticated(true)
  @Patch("/move")
  public async moveItem(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      itemHolderId,
      beforeId,
    }: {
      id: string;
      itemHolderId: string | null;
      beforeId?: string | null;
    },
  ): Promise<ItemState> {
    let item = await Item.store(tx).get(id);

    let itemHolder: ItemHolder | null = null;
    if (itemHolderId) {
      itemHolder = await ItemHolderBase.getItemHolder(tx, itemHolderId);
      if (!itemHolder) {
        throw new NotFoundError();
      }

      let before = beforeId ? await Item.store(tx).get(beforeId) : null;

      await item.move(itemHolder, before);
    } else {
      await item.move(null);
    }

    return item.state;
  }

  @Authenticated(true)
  @Patch()
  public async editItem(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
      params,
    }: {
      id: string;
      params: Partial<ItemParams>;
    },
  ): Promise<ItemState> {
    let item = await Item.store(tx).get(id);
    await item.update(params);

    return item.state;
  }

  @Authenticated(true)
  @Delete()
  public async deleteItem(
    @Inject() tx: Transaction,
    @Inject() user: User,
    @Body()
    {
      id,
    }: {
      id: string;
    },
  ): Promise<ItemState> {
    let item = await Item.store(tx).get(id);
    await item.delete();

    return item.state;
  }
}
