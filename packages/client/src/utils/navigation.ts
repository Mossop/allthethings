import type { ApolloQueryResult } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { Location, Update } from "history";
import { createBrowserHistory } from "history";
import { useEffect, useState } from "react";

import { client } from "../schema";
import type { CurrentUserQuery, LookupOwnerQuery } from "../schema/operations";
import { CurrentUser, LookupOwner } from "../schema/operations";
import type { User } from "./user";

export const history = createBrowserHistory();

export enum ViewType {
  Pending = "pending",
  Owner = "owner",
  Inbox = "inbox",
  NotFound = "notfound",
}

export interface PendingView {
  readonly type: ViewType.Pending;
  readonly selectedContext: string;
}

export interface NotFoundView {
  readonly type: ViewType.NotFound;
  readonly selectedContext: string;
}

export interface InboxView {
  readonly type: ViewType.Inbox;
  readonly selectedContext: string;
}

export interface OwnerView {
  readonly type: ViewType.Owner;
  readonly selectedOwner: string;
  readonly selectedContext: string;
}

export type View = PendingView | NotFoundView | InboxView | OwnerView;

type Listener = (view: View | null) => void;

class NavigationHandler {
  private currentView: View | null;
  private listeners: Set<Listener>;
  private runningQueries: (() => void)[];
  private user: User | null;

  public constructor() {
    this.currentView = null;
    this.listeners = new Set();
    this.runningQueries = [];
    this.user = null;

    history.listen(({ location }: Update) => void this.update(location));

    let watchable = client.watchQuery({
      query: CurrentUser,
    });
    watchable.subscribe((result: ApolloQueryResult<CurrentUserQuery>): void => {
      console.log("Saw query result.");
      this.user = result.data.user;
      void this.update(history.location);
    });
  }

  private setView(view: View | null): void {
    this.currentView = view;
    for (let listener of this.listeners) {
      try {
        listener(view);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private stopQueries(): void {
    for (let query of this.runningQueries) {
      query();
    }
    this.runningQueries = [];
  }

  private notFound(): void {
    if (!this.user) {
      return this.setView(null);
    }

    this.setView({
      type: ViewType.NotFound,
      selectedContext: this.user.id,
    });
  }

  private watch<D, V>(
    query: TypedDocumentNode<D, V>,
    variables: V,
    callback: (data: D) => void,
  ): void {
    let watchable = client.watchQuery({
      query,
      variables,
    });

    let subscription = watchable.subscribe((result: ApolloQueryResult<D>): void => {
      callback(result.data);
    });

    this.runningQueries.push(() => subscription.unsubscribe());
  }

  private async update(location: Location): Promise<void> {
    this.stopQueries();
    if (!this.user) {
      return;
    }

    let pathParts = location.pathname.substring(1).split("/");

    switch (pathParts.pop()) {
      case "":
        return this.watch(LookupOwner, {
          stubs: pathParts,
        }, (data: LookupOwnerQuery): void => {
          let owner = data.user?.descend;
          if (!owner) {
            return this.notFound();
          }

          return this.setView({
            type: ViewType.Owner,
            selectedOwner: owner.id,
            selectedContext: owner.context.id,
          });
        });
      case "inbox":
        if (pathParts.length == 0) {
          return this.watch(CurrentUser, {}, (data: CurrentUserQuery): void => {
            let user = data.user;
            if (!user) {
              return this.notFound();
            }

            this.setView({
              type: ViewType.Inbox,
              selectedContext: user.id,
            });
          });
        }

        if (pathParts.length > 1) {
          return this.notFound();
        }

        return this.watch(LookupOwner, {
          stubs: pathParts,
        }, (data: LookupOwnerQuery) => {
          let owner = data.user?.descend;
          if (!owner) {
            return this.notFound();
          }

          if (owner.__typename != "NamedContext") {
            return this.notFound();
          }

          this.setView({
            type: ViewType.Inbox,
            selectedContext: owner.id,
          });
        });
      default:
        return this.notFound();
    }
  }

  public get view(): View | null {
    return this.currentView;
  }

  public listen(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

const navHandler = new NavigationHandler();

export function useView(): View | null {
  let [viewState, setViewState] = useState<View | null>(navHandler.view);

  useEffect(() => navHandler.listen(setViewState), []);

  return viewState;
}

export function pushState(path: string): void {
  history.push(path);
}
