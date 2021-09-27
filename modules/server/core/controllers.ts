import { promises as fs } from "fs";
import path from "path";

import { Route, Get, Query, Post, Body, Put, Inject } from "@tsoa/runtime";

import type { Transaction } from "#server/utils";
import { HttpError, NotFoundError } from "#server/utils";
import { decodeRelativeDateTime, map } from "#utils";

import type {
  Context,
  ContextState,
  UserState,
  ProjectState,
} from "./implementations";
import { Project, TaskListBase, User } from "./implementations";
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

interface ProjectParams {
  name: string;
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
}
