import type { ReactChildren, ReactResult } from "@allthethings/ui";
import { pushUrl, replaceUrl, history } from "@allthethings/ui";
import type { Location, Update } from "history";
import { useState, useMemo, useEffect, createContext, useContext as useReactContext } from "react";

import type { Context, Project, ProjectRoot, TaskList, User } from "../schema";
import { isProject, useContextState } from "../schema";

const ViewContext = createContext<View | undefined>(undefined);

export enum ViewType {
  Page = "page",
  TaskList = "tasklist",
  Inbox = "inbox",
  NotFound = "notfound",
  Settings = "settings",
  AddLink = "addlink",
}

export interface LoggedInViewState {
  readonly user: User;
  readonly context: Context | null;
}

export interface LoggedOutViewState {
  readonly user: null;
  readonly context: null;
}

export interface PageView {
  readonly type: ViewType.Page;
  readonly path: string;
}

export interface InboxState {
  readonly type: ViewType.Inbox;
}

export interface AddLinkState {
  readonly type: ViewType.AddLink;
  readonly url: string;
  readonly title: string | null;
}

export interface TaskListState {
  readonly type: ViewType.TaskList;
  readonly taskList: TaskList;
}

export interface SettingsState {
  readonly type: ViewType.Settings;
  readonly page: string;
  readonly pluginId?: string;
}

export type LoggedInState = InboxState | AddLinkState | TaskListState | SettingsState | PageView;
export type LoggedInView = LoggedInState & LoggedInViewState;
export type LoggedOutState = PageView;
export type LoggedOutView = LoggedOutState & LoggedOutViewState;

export type View = LoggedInView | LoggedOutView;

export function useUrl(view: LoggedInState | LoggedOutState, context?: Context | null): URL {
  let currentView = useView();
  if (!currentView) {
    // Uninitialized.
    return new URL("/", document.documentURI);
  }

  if (currentView.user) {
    return viewToUrl({
      user: currentView.user,
      context: context ?? currentView.context,
      ...view,
    });
  }

  if (view.type != ViewType.Page) {
    throw new Error("Cannot generate an authenticated URL when not logged in.");
  }

  return viewToUrl({
    ...view,
    user: null,
    context: null,
  });
}

export function useView(): View | undefined {
  return useReactContext(ViewContext);
}

export function useLoggedInView(): LoggedInView {
  let view = useView();
  if (!view || !view.user) {
    throw new Error("Not logged in.");
  }
  return view;
}

export function useUser(): User {
  return useLoggedInView().user;
}

export function useContexts(): ReadonlyMap<string, Context> {
  return useUser().contexts;
}

export function useProjectRoot(): ProjectRoot {
  let state = useLoggedInView();
  return state.context ?? state.user;
}

export function useCurrentContext(): Context | null {
  let state = useLoggedInView();
  return state.context ?? null;
}

export function viewToUrl(view: View): URL {
  let path: string;
  let searchParams = new URLSearchParams();

  if (view.context) {
    searchParams.set("context", view.context.stub);
  }

  switch (view.type) {
    case ViewType.Page:
      path = view.path;
      break;
    case ViewType.Inbox:
      path = "/inbox";
      break;
    case ViewType.AddLink:
      path = "/addlink";
      searchParams.set("url", view.url);
      if (view.title) {
        searchParams.set("title", view.title);
      }
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
    case ViewType.Settings:
      path = "/settings";
      if (!view.pluginId && view.page == "general") {
        break;
      }

      if (view.pluginId) {
        searchParams.set("plugin", view.pluginId);
      }

      path += `/${view.page}`;
      break;
  }

  let url = new URL(path, document.URL);
  let search = searchParams.toString();
  if (search) {
    url.search = `${search}`;
  }
  return url;
}

export function urlToView(user: User | null, url: URL): View {
  if (!user) {
    return {
      type: ViewType.Page,
      user,
      context: null,
      path: url.pathname,
    };
  }

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

  let notFound: LoggedInView = {
    type: ViewType.Page,
    user,
    context,
    path: url.pathname,
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
    case "addlink": {
      let newUrl = url.searchParams.get("url");
      let title = url.searchParams.get("title");
      if (pathParts.length || !newUrl) {
        return notFound;
      }
      return {
        type: ViewType.AddLink,
        user,
        context,
        url: newUrl,
        title,
      };
    }
    case "settings": {
      if (pathParts.length > 1) {
        return notFound;
      }
      let pluginId = url.searchParams.get("plugin") ?? undefined;
      let page = pathParts.length ? pathParts[0] : "general";

      return {
        type: ViewType.Settings,
        user,
        context,
        page,
        pluginId,
      };
    }
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
  private view: View | undefined = undefined;

  public constructor(private callback: (view: View) => void) {
    this.update(history.location);
  }

  private setView(view: View): void {
    this.view = view;
    this.callback(view);
  }

  private update(location: Location): void {
    if (this.user === undefined) {
      return;
    }

    this.setView(
      urlToView(this.user, urlForLocation(location)),
    );
  }

  public watch(user: User | null | undefined): void | (() => void) {
    if (user === undefined) {
      return;
    }

    let wasLoggedIn = Boolean(this.user);
    let isLoggedIn = Boolean(user);

    this.user = user;

    if (wasLoggedIn && !isLoggedIn) {
      // Logged out.
      let newView: LoggedOutView = {
        user: null,
        context: null,
        type: ViewType.Page,
        path: "/",
      };
      replaceUrl(viewToUrl(newView));
      this.setView(newView);
    } else {
      this.update(history.location);
    }

    return history.listen(({ location }: Update) => this.update(location));
  }
}

interface ContextChange {
  readonly context?: Context | null;
}

function buildView(
  view: (LoggedInState & ContextChange) | LoggedOutState,
  currentView?: LoggedInView,
): View {
  if (!currentView) {
    return {
      user: null,
      context: null,
      ...(view as LoggedOutState),
    };
  }

  return {
    user: currentView.user,
    context: currentView.context,
    ...view,
  };
}

export function pushView(view: LoggedOutState): void;
export function pushView(view: (LoggedInState & ContextChange), currentView: LoggedInView): void;
export function pushView(
  view: (LoggedInState & ContextChange) | LoggedOutState,
  currentView?: LoggedInView,
): void {
  let newView = buildView(view, currentView);

  pushUrl(viewToUrl(newView));
}

export function replaceView(view: LoggedOutState): void;
export function replaceView(view: (LoggedInState & ContextChange), currentView: LoggedInView): void;
export function replaceView(
  view: (LoggedInState & ContextChange) | LoggedOutState,
  currentView?: LoggedInView,
): void {
  let newView = buildView(view, currentView);

  replaceUrl(viewToUrl(newView));
}

export function ViewListener({ children }: ReactChildren): ReactResult {
  let [view, setView] = useState<View | undefined>(undefined);
  let navHandler = useMemo(() => new NavigationHandler(setView), []);
  let user = useContextState();

  useEffect(() => {
    return navHandler.watch(user);
  }, [navHandler, user]);

  return <ViewContext.Provider value={view}>{children}</ViewContext.Provider>;
}
