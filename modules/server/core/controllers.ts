import { promises as fs } from "fs";
import path from "path";

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

import type { Transaction } from "#server/utils";
import { HttpError, NotFoundError } from "#server/utils";
import { decodeRelativeDateTime, map } from "#utils";

import type {
  ContextState,
  UserState,
  ProjectState,
  ProjectParams,
  ContextParams,
  SectionParams,
  SectionState,
} from "./implementations";
import {
  Section,
  Project,
  TaskListBase,
  User,
  Context,
} from "./implementations";
import { ServiceManager } from "./services";
import { Authenticated, CoreController } from "./utils";

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

export interface ServerProblem {
  url: string;
  description: string;
}

export interface ServerState {
  user: ServerUserState | null;

  problems: ServerProblem[];

  schemaVersion: string;
}

@Route("/state")
export class StateController extends CoreController {
  @Get()
  public async getState(@Query() dueBefore: string): Promise<ServerState> {
    let tx = await this.startTransaction(false);

    let user: ServerUserState | null = null;
    this.segment.info("getState", {
      session: this.context.session,
      userId: this.userId,
    });

    if (this.userId) {
      let userImpl = await User.store(tx).findOne({ id: this.userId });

      if (userImpl) {
        let before = decodeRelativeDateTime(dueBefore);

        let inbox = await userImpl.inbox({
          filter: { isArchived: false, isSnoozed: false, isPending: true },
        });

        let contexts = await map(
          userImpl.contexts(),
          async (context: Context): Promise<ServerContextState> => {
            let tasks = await context.items({
              filter: {
                isArchived: false,
                isSnoozed: false,
                dueBefore: before,
              },
            });

            let projects = await map(
              context.projects(),
              async (project: Project): Promise<ServerProjectState> => {
                let tasks = await context.items({
                  filter: {
                    isArchived: false,
                    isSnoozed: false,
                    dueBefore: before,
                  },
                });

                return {
                  ...project.state,
                  dueTasks: await tasks.count(),
                };
              },
            );

            return {
              ...context.state,
              dueTasks: await tasks.count(),
              projects,
            };
          },
        );

        user = {
          ...userImpl.state,
          inbox: await inbox.count(),
          contexts,
        };
      }
    }

    return {
      user,
      problems: await ServiceManager.listProblems(tx, this.userId),
      schemaVersion: "",
    };
  }
}

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
