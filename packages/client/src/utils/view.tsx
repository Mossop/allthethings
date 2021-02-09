import type { Location, To, Update } from "history";
import { createBrowserHistory } from "history";
import { useState, useMemo, useEffect, createContext, useContext } from "react";

import { useListContextStateQuery } from "../schema/queries";
import type { Context, Project, ProjectRoot, TaskList, User } from "./state";
import { buildProjects, isContext, isUser, isProject } from "./state";
import type { ReactChildren, ReactResult } from "./types";

const ViewContext = createContext<View | null | undefined>(undefined);

export const history = createBrowserHistory();

export enum ViewType {
  TaskList = "tasklist",
  Inbox = "inbox",
  NotFound = "notfound",
}

export interface BaseView {
  readonly user: User;
  readonly context: Context | null;
}

export type NotFoundView = BaseView & {
  readonly type: ViewType.NotFound;
};

export type InboxView = BaseView & {
  readonly type: ViewType.Inbox;
};

export type TaskListView = BaseView & {
  readonly type: ViewType.TaskList;
  readonly taskList: TaskList;
};

export type View =
  LinkableView |
  NotFoundView;

export type LinkableView =
  InboxView |
  TaskListView;

export type NavigableView = {
  context?: Context | null;
} & (
  Omit<InboxView, keyof BaseView | "context"> |
  Omit<TaskListView, keyof BaseView | "context">
);

export function useUrl(view: NavigableView): URL {
  let currentView = useView();

  let newView = {
    user: currentView.user,
    context: currentView.context,
    ...view,
  };

  return viewToUrl(newView);
}

export function useMaybeView(): View | undefined | null {
  return useContext(ViewContext);
}

export function useView(): View {
  let view = useMaybeView();
  if (!view) {
    throw new Error("App not initialized.");
  }
  return view;
}

function updateView(view: View, user: User): View {
  let base: BaseView = {
    user,
    context: view.context ? user.contexts.get(view.context.id) ?? null : null,
  };

  switch (view.type) {
    case ViewType.NotFound:
      return {
        ...base,
        type: view.type,
      };
    case ViewType.Inbox:
      return {
        ...base,
        type: view.type,
      };
    case ViewType.TaskList: {
      let taskList: TaskList;

      if (isUser(view.taskList)) {
        taskList = user;
      } else if (isContext(view.taskList)) {
        let context = user.contexts.get(view.taskList.id);
        if (!context) {
          return {
            ...base,
            type: ViewType.NotFound,
          };
        }
        taskList = context;
      } else {
        let project = (base.context ?? base.user).projects.get(view.taskList.id);
        if (!project) {
          return {
            ...base,
            type: ViewType.NotFound,
          };
        }
        taskList = project;
      }

      return {
        ...base,
        type: view.type,
        taskList: taskList,
      };
    }
  }
}

export function viewToUrl(view: InboxView | TaskListView): URL {
  let path: string;
  let searchParams = new URLSearchParams();

  if (view.context) {
    searchParams.set("context", view.context.stub);
  }

  switch (view.type) {
    case ViewType.Inbox:
      path = "/inbox";
      break;
    case ViewType.TaskList:
      if (isProject(view.taskList)) {
        let parts = [view.taskList.stub];
        let parent = view.taskList.parent;
        while (parent) {
          parts.unshift(parent.stub);
          parent = parent.parent;
        }
        path = "/project/" + parts.join("/") + "/";
      } else {
        path = "/";
      }
      break;
  }

  let url = new URL(`${path}`, document.URL);
  let search = searchParams.toString();
  if (search) {
    url.search = `${search}`;
  }
  return url;
}

export function urlToView(user: User, url: URL): View {
  let pathParts = url.pathname.substring(1).split("/");

  let root: ProjectRoot = user;
  let context: Context | null = null;
  let selectedContext = url.searchParams.get("context");
  if (selectedContext) {
    context = [...user.contexts.values()].find(
      (context: Context): boolean => context.stub == selectedContext,
    ) ?? null;

    if (context) {
      root = context;
    }
  }

  let notFound: View = {
    type: ViewType.NotFound,
    user,
    context,
  };

  switch (pathParts.shift()) {
    case "":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.TaskList,
        user,
        context,
        taskList: root,
      };
    case "inbox":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Inbox,
        user,
        context,
      };
    case "project": {
      let taskList: TaskList = root;
      let part = pathParts.shift();
      while (part) {
        let inner = descend(taskList, part);
        if (!inner) {
          return notFound;
        }
        taskList = inner;

        part = pathParts.shift();
      }

      if (!Object.is(part, "") || pathParts.length) {
        return notFound;
      }

      return {
        type: ViewType.TaskList,
        user,
        context,
        taskList,
      };
    }
    default:
      return notFound;
  }
}

function descend(taskList: TaskList, stub: string): Project | null {
  return taskList.subprojects.find((project: Project): boolean => project.stub == stub) ?? null;
}

function urlForLocation(location: Location): URL {
  return new URL(`${location.pathname}${location.search}${location.hash}`, document.URL);
}

export class NavigationHandler {
  private user: User | null | undefined = undefined;
  private view: View | null | undefined = undefined;

  public constructor(private callback: (view: View | null) => void) {
    this.update(history.location);
  }

  private setView(view: View | null): void {
    this.view = view;
    this.callback(view);
  }

  private update(location: Location): void {
    if (!this.user) {
      return;
    }

    this.setView(
      urlToView(this.user, urlForLocation(location)),
    );
  }

  public watch(user: User | null | undefined): void | (() => void) {
    this.user = user;
    if (!user) {
      if (user === null) {
        this.setView(null);
      }
      return;
    }

    if (this.view && this.view.type != ViewType.NotFound) {
      let newView = updateView(this.view, user);
      this.setView(newView);
      if (newView.type != ViewType.NotFound) {
        replaceUrl(viewToUrl(newView));
      }
    } else {
      this.update(history.location);
    }

    return history.listen(({ location }: Update) => this.update(location));
  }
}

function buildView(
  args: [view: LinkableView] | [view: NavigableView, currentView: View],
): LinkableView {
  if (args.length == 2) {
    let [newView, currentView] = args;
    return {
      user: currentView.user,
      context: currentView.context,
      ...newView,
    };
  } else {
    let [view] = args;
    return view;
  }
}

export function pushView(
  ...args: [view: LinkableView] | [view: NavigableView, currentView: View]
): void {
  let view = buildView(args);

  pushUrl(viewToUrl(view));
}

export function replaceView(
  ...args: [view: LinkableView] | [view: NavigableView, currentView: View]
): void {
  let view = buildView(args);

  replaceUrl(viewToUrl(view));
}

export function pushUrl({ pathname, search }: URL): void {
  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.push(to);
}

export function replaceUrl({ pathname, search }: URL): void {
  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.replace(to);
}

export function ViewListener({ children }: ReactChildren): ReactResult {
  let { data } = useListContextStateQuery();
  let [view, setView] = useState<View | null | undefined>(undefined);

  let navHandler = useMemo(() => new NavigationHandler(setView), []);

  let user = useMemo((): User | null | undefined => {
    if (!data) {
      return undefined;
    }

    if (!data.user) {
      return null;
    }

    return {
      ...data.user,

      // eslint-disable-next-line @typescript-eslint/typedef
      contexts: new Map(data.user.contexts.map((context): [string, Context] => {
        return [context.id, {
          ...context,

          ...buildProjects(context),
        }];
      })),

      ...buildProjects(data.user),
    };
  }, [data]);

  useEffect(() => {
    return navHandler.watch(user);
  }, [navHandler, user]);

  return <ViewContext.Provider value={view}>{children}</ViewContext.Provider>;
}
