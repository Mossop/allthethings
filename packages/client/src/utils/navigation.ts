import type { Location, Update } from "history";
import { createBrowserHistory } from "history";

import type { NamedContext, Project, User } from "./state";

export const history = createBrowserHistory();

export enum ViewType {
  Owner = "owner",
  Inbox = "inbox",
  NotFound = "notfound",
}

export interface NotFoundView {
  readonly type: ViewType.NotFound;
  readonly selectedContext: string | null;
}

export interface InboxView {
  readonly type: ViewType.Inbox;
  readonly selectedContext: string | null;
}

export interface OwnerView {
  readonly type: ViewType.Owner;
  readonly selectedOwner: string;
  readonly selectedContext: string | null;
}

export type View = NotFoundView | InboxView | OwnerView;

function descend(owner: User | NamedContext | Project, stub: string): Project | null {
  return owner.subprojects.find((project: Project): boolean => project.stub == stub) ?? null;
}

export class NavigationHandler {
  private destroy: () => void;

  private constructor(private user: User, private setView: (view: View) => void) {
    this.destroy = history.listen(({ location }: Update) => this.update(location));
    this.update(history.location);
  }

  private notFound(selectedContext: string | null = null): void {
    this.setView({
      type: ViewType.NotFound,
      selectedContext,
    });
  }

  private update(location: Location): void {
    let pathParts = location.pathname.substring(1).split("/");

    let currentContext: User | NamedContext = this.user;
    let selectedContext: string | null = null;

    let part = pathParts.shift();
    if (part == "context") {
      let stub = pathParts.shift();
      if (!stub) {
        return this.notFound();
      }

      let inner = this.user.namedContexts.find(
        (context: NamedContext): boolean => context.stub == stub,
      );

      if (!inner) {
        return this.notFound();
      }

      currentContext = inner;
      selectedContext = currentContext.id;
      part = pathParts.shift();
    }

    switch (part) {
      case "":
        if (pathParts.length) {
          return this.notFound(selectedContext);
        }
        return this.setView({
          type: ViewType.Owner,
          selectedContext,
          selectedOwner: currentContext.id,
        });
      case "inbox":
        if (pathParts.length) {
          return this.notFound(selectedContext);
        }
        return this.setView({
          type: ViewType.Inbox,
          selectedContext,
        });
      case "project": {
        let owner: User | NamedContext | Project = currentContext;
        part = pathParts.shift();
        while (part) {
          let inner = descend(owner, part);
          if (!inner) {
            return this.notFound(selectedContext);
          }
          owner = inner;

          part = pathParts.shift();
        }

        if (!Object.is(part, "") || pathParts.length) {
          return this.notFound(selectedContext);
        }

        return this.setView({
          type: ViewType.Owner,
          selectedContext,
          selectedOwner: owner.id,
        });
      }
      default:
        return this.notFound(selectedContext);
    }
  }

  public static watchHistory(user: User, callback: (view: View) => void): () => void {
    let handler = new NavigationHandler(user, callback);
    return () => handler.destroy();
  }
}

export function pushState(path: string): void {
  history.push(path);
}
