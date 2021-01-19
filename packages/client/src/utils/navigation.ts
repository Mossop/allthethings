import type { Location, To, Update } from "history";
import { createBrowserHistory } from "history";

import type { NamedContext, Project, User } from "./state";
import { isProject } from "./state";

export const history = createBrowserHistory();

export enum ViewType {
  Owner = "owner",
  Inbox = "inbox",
  NotFound = "notfound",
}

export interface BaseView {
  readonly user: User;
  readonly selectedNamedContext: NamedContext | null;
}

export type NotFoundView = BaseView & {
  readonly type: ViewType.NotFound;
};

export type InboxView = BaseView & {
  readonly type: ViewType.Inbox;
};

export type OwnerView = BaseView & {
  readonly type: ViewType.Owner;
  readonly selectedOwner: User | NamedContext | Project;
};

export type View =
  NotFoundView |
  InboxView |
  OwnerView;

export type NavigableView = {
  selectedNamedContext?: NamedContext | null;
} & (
  Omit<InboxView, keyof BaseView | "selectedNamedContext"> |
  Omit<OwnerView, keyof BaseView | "selectedNamedContext">
);

export function viewToUrl(view: NavigableView, currentView?: View): URL {
  let path: string;
  let searchParams = new URLSearchParams();

  let namedContext = currentView?.selectedNamedContext;
  if (view.selectedNamedContext !== undefined) {
    namedContext = view.selectedNamedContext;
  }

  if (namedContext) {
    searchParams.set("context", namedContext.stub);
  }

  switch (view.type) {
    case ViewType.Inbox:
      path = "/inbox";
      break;
    case ViewType.Owner:
      if (isProject(view.selectedOwner)) {
        let parts = [view.selectedOwner.stub];
        let parent = view.selectedOwner.parent;
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
  let selectedNamedContext: NamedContext | null = null;
  let selectedContext = url.searchParams.get("context");
  if (selectedContext) {
    selectedNamedContext = user.namedContexts.find(
      (context: NamedContext): boolean => context.stub == selectedContext,
    ) ?? null;

    if (selectedNamedContext) {
      currentContext = selectedNamedContext;
    }
  }

  let notFound: View = {
    type: ViewType.NotFound,
    user,
    selectedNamedContext,
  };

  switch (pathParts.shift()) {
    case "":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Owner,
        user,
        selectedNamedContext,
        selectedOwner: currentContext,
      };
    case "inbox":
      if (pathParts.length) {
        return notFound;
      }
      return {
        type: ViewType.Inbox,
        user,
        selectedNamedContext,
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
        selectedNamedContext,
        selectedOwner: owner,
      };
    }
    default:
      return notFound;
  }
}

function descend(owner: User | NamedContext | Project, stub: string): Project | null {
  return owner.subprojects.find((project: Project): boolean => project.stub == stub) ?? null;
}

export class NavigationHandler {
  private destroy: () => void;

  private constructor(private user: User, private setView: (view: View) => void) {
    this.destroy = history.listen(({ location }: Update) => this.update(location));
    this.update(history.location);
  }

  private update(location: Location): void {
    this.setView(
      urlToView(
        this.user,
        new URL(`${location.pathname}${location.search}${location.hash}`, document.URL),
      ),
    );
  }

  public static watchHistory(user: User, callback: (view: View) => void): () => void {
    let handler = new NavigationHandler(user, callback);
    return () => handler.destroy();
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
