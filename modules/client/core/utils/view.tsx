import { pushUrl, replaceUrl } from "#client/utils";

import type { Context, Project, TaskList, User } from "../schema";
import { isProject } from "../schema";
import GlobalState from "./globalState";
import { useSharedState } from "./sharedstate";

export enum ViewType {
  Page = "page",
  TaskList = "tasklist",
  Inbox = "inbox",
  NotFound = "notfound",
  Settings = "settings",
  AddLink = "addlink",
}

interface LoggedInState {
  readonly context: Context;
}

interface LoggedOutState {
  readonly context: null;
}

export interface PageState {
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
  readonly serviceId?: string;
}

export type LoggedInViewState =
  | InboxState
  | AddLinkState
  | TaskListState
  | SettingsState
  | PageState;
export type LoggedInView = LoggedInViewState & LoggedInState;
export type LoggedOutViewState = PageState;
export type LoggedOutView = LoggedOutViewState & LoggedOutState;

export type View = LoggedInView | LoggedOutView;

export function useUrl(
  view: LoggedInViewState | LoggedOutViewState,
  context?: Context,
): URL {
  let currentView = useView();
  if (!currentView) {
    // Uninitialized.
    return new URL("/", document.documentURI);
  }

  if (currentView.context) {
    return viewToUrl({
      context: context === undefined ? currentView.context : context,
      ...view,
    });
  }

  if (view.type != ViewType.Page) {
    throw new Error("Cannot generate an authenticated URL when not logged in.");
  }

  return viewToUrl({
    ...view,
    context: null,
  });
}

export function useView(): View | undefined {
  let [appState] = useSharedState(GlobalState.appState);
  return appState?.view;
}

export function useLoggedInView(): LoggedInView {
  let view = useView();
  if (!view || !view.context) {
    throw new Error("Not logged in.");
  }
  return view;
}

export function useCurrentContext(): Context {
  let state = useLoggedInView();
  return state.context;
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
      if (!view.serviceId && view.page == "general") {
        break;
      }

      if (view.serviceId) {
        searchParams.set("service", view.serviceId);
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
      context: null,
      path: url.pathname,
    };
  }

  let pathParts = url.pathname.substring(1).split("/");

  let context: Context = user.defaultContext;
  let selectedContext = url.searchParams.get("context");
  if (selectedContext) {
    context =
      [...user.contexts.values()].find(
        (context: Context): boolean => context.stub == selectedContext,
      ) ?? user.defaultContext;
  }

  let notFound: LoggedInView = {
    type: ViewType.Page,
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
        context,
        taskList: context,
      };
    case "inbox":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Inbox,
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
        context,
        url: newUrl,
        title,
      };
    }
    case "settings": {
      if (pathParts.length > 1) {
        return notFound;
      }
      let serviceId = url.searchParams.get("service") ?? undefined;
      let page = pathParts.length ? pathParts[0] : "general";

      return {
        type: ViewType.Settings,
        context,
        page,
        serviceId,
      };
    }
    case "project": {
      let taskList: TaskList = context;
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
        context,
        taskList,
      };
    }
    default:
      return notFound;
  }
}

function descend(taskList: TaskList, stub: string): Project | null {
  return (
    taskList.subprojects.find(
      (project: Project): boolean => project.stub == stub,
    ) ?? null
  );
}

interface ContextChange {
  readonly context?: Context;
}

function buildView(
  view: (LoggedInViewState & ContextChange) | LoggedOutViewState,
): View {
  let currentView = GlobalState.view;

  // @ts-ignore
  return {
    context: currentView?.context ?? null,
    ...view,
  };
}

export function pushView(
  view: (LoggedInViewState & ContextChange) | LoggedOutViewState,
): void {
  let newView = buildView(view);

  pushUrl(viewToUrl(newView));
}

export function replaceView(
  view: (LoggedInViewState & ContextChange) | LoggedOutViewState,
): void {
  let newView = buildView(view);

  replaceUrl(viewToUrl(newView));
}
