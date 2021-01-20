import type { Location, To, Update } from "history";
import { createBrowserHistory } from "history";

import type { NamedContext, Project, User } from "./state";
import { isNamedContext, isUser, isProject } from "./state";

export const history = createBrowserHistory();

export enum ViewType {
  Owner = "owner",
  Inbox = "inbox",
  NotFound = "notfound",
}

export interface BaseView {
  readonly user: User;
  readonly namedContext: NamedContext | null;
}

export type NotFoundView = BaseView & {
  readonly type: ViewType.NotFound;
};

export type InboxView = BaseView & {
  readonly type: ViewType.Inbox;
};

export type OwnerView = BaseView & {
  readonly type: ViewType.Owner;
  readonly owner: User | NamedContext | Project;
};

export type View =
  NotFoundView |
  InboxView |
  OwnerView;

function updateView(view: View, user: User): View {
  let base: BaseView = {
    user,
    namedContext: view.namedContext ? user.namedContexts.get(view.namedContext.id) ?? null : null,
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
    case ViewType.Owner: {
      let owner: User | NamedContext | Project;

      if (isUser(view.owner)) {
        owner = user;
      } else if (isNamedContext(view.owner)) {
        let context = user.namedContexts.get(view.owner.id);
        if (!context) {
          return {
            ...base,
            type: ViewType.NotFound,
          };
        }
        owner = context;
      } else {
        let project = (base.namedContext ?? base.user).projects.get(view.owner.id);
        if (!project) {
          return {
            ...base,
            type: ViewType.NotFound,
          };
        }
        owner = project;
      }

      return {
        ...base,
        type: view.type,
        owner,
      };
    }
  }
}

export function viewToUrl(view: InboxView | OwnerView): URL {
  let path: string;
  let searchParams = new URLSearchParams();

  if (view.namedContext) {
    searchParams.set("context", view.namedContext.stub);
  }

  switch (view.type) {
    case ViewType.Inbox:
      path = "/inbox";
      break;
    case ViewType.Owner:
      if (isProject(view.owner)) {
        let parts = [view.owner.stub];
        let parent = view.owner.parent;
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

  let currentContext: User | NamedContext = user;
  let namedContext: NamedContext | null = null;
  let selectedContext = url.searchParams.get("context");
  if (selectedContext) {
    namedContext = [...user.namedContexts.values()].find(
      (context: NamedContext): boolean => context.stub == selectedContext,
    ) ?? null;

    if (namedContext) {
      currentContext = namedContext;
    }
  }

  let notFound: View = {
    type: ViewType.NotFound,
    user,
    namedContext,
  };

  switch (pathParts.shift()) {
    case "":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Owner,
        user,
        namedContext,
        owner: currentContext,
      };
    case "inbox":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Inbox,
        user,
        namedContext,
      };
    case "project": {
      let owner: User | NamedContext | Project = currentContext;
      let part = pathParts.shift();
      while (part) {
        let inner = descend(owner, part);
        if (!inner) {
          return notFound;
        }
        owner = inner;

        part = pathParts.shift();
      }

      if (!Object.is(part, "") || pathParts.length) {
        return notFound;
      }

      return {
        type: ViewType.Owner,
        user: user,
        namedContext,
        owner,
      };
    }
    default:
      return notFound;
  }
}

function descend(owner: User | NamedContext | Project, stub: string): Project | null {
  return owner.subprojects.find((project: Project): boolean => project.stub == stub) ?? null;
}

function urlForLocation(location: Location): URL {
  return new URL(`${location.pathname}${location.search}${location.hash}`, document.URL);
}

export class NavigationHandler {
  private user: User | null = null;
  private view: View | null = null;

  public constructor(private callback: (view: View) => void) {
    this.update(history.location);
  }

  private setView(view: View): void {
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

  public watch(user: User | null): void | (() => void) {
    this.user = user;
    if (!user) {
      return;
    }

    if (this.view && this.view.type != ViewType.NotFound) {
      let newView = updateView(this.view, user);
      this.setView(newView);
      if (newView.type != ViewType.NotFound) {
        replaceState(viewToUrl(newView));
      }
    } else {
      this.update(history.location);
    }

    return history.listen(({ location }: Update) => this.update(location));
  }
}

export function pushState({ pathname, search }: URL): void {
  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.push(to);
}

export function replaceState({ pathname, search }: URL): void {
  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.replace(to);
}
