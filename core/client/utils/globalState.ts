import type { ApolloQueryResult, ObservableQuery } from "@apollo/client";
import type { Update, Location } from "history";
import { DateTime } from "luxon";

import { history } from "#client-utils";

import type {
  Problem, State, User,
  ListContextStateQuery,
  ListContextStateQueryVariables,
} from "../schema";
import {
  useSchemaVersionQuery,

  buildState,
  ListContextStateDocument,
} from "../schema";
import { client } from "../schema/client";
import { SharedState, useSharedState } from "./sharedstate";
import type { View } from "./view";
import { urlToView } from "./view";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let SCHEMA_VERSION: string;

const TIMEOUT_PADDING = 1000;

function urlForLocation(location: Location): URL {
  return new URL(`${location.pathname}${location.search}${location.hash}`, document.URL);
}

export type AppState = State & {
  view: View
};

class GlobalStateManager {
  public readonly appState = new SharedState<AppState | undefined>(undefined);
  private readonly query: ObservableQuery<ListContextStateQuery, ListContextStateQueryVariables>;

  public constructor() {
    this.query = client.watchQuery<ListContextStateQuery, ListContextStateQueryVariables>({
      query: ListContextStateDocument,
      variables: this.getVariables(),
      pollInterval: 5000,
    });

    this.query.subscribe((result: ApolloQueryResult<ListContextStateQuery>): void => {
      let userState = buildState(result.data);
      this.appState.set({
        ...userState,
        view: urlToView(userState.user, urlForLocation(history.location)),
      });
    });

    history.listen(({ location }: Update) => {
      if (!this.appState.value) {
        return;
      }

      this.appState.set({
        ...this.appState.value,
        view: urlToView(this.appState.value.user, urlForLocation(location)),
      });
    });
  }

  private getVariables(): ListContextStateQueryVariables {
    let today = DateTime.now().endOf("day");
    let now = DateTime.now();
    window.setTimeout(
      () => this.updateVariables(),
      TIMEOUT_PADDING + (today.toMillis() - now.toMillis()),
    );

    return {
      dueBefore: today,
    };
  }

  private updateVariables(): void {
    void this.query.refetch(this.getVariables());
  }

  public get user(): User | null {
    return this.appState.value?.user ?? null;
  }

  public get view(): View | undefined {
    return this.appState.value?.view;
  }
}

const GlobalState = new GlobalStateManager();
export default GlobalState;

export function useProblems(): readonly Problem[] {
  let { data } = useSchemaVersionQuery({
    pollInterval: 5000,
  });

  let [appState] = useSharedState(GlobalState.appState);

  if (data && data.schemaVersion != SCHEMA_VERSION) {
    return [{
      description: "This page is outdated and must be reloaded.",
      url: "javascript:window.location.reload()",
    }];
  }

  return appState?.problems ?? [];
}

export function useUser(): User {
  let [appState] = useSharedState(GlobalState.appState);
  if (!appState?.user) {
    throw new Error("Not logged in.");
  }
  return appState.user;
}

export function useMaybeUser(): User | null {
  let [appState] = useSharedState(GlobalState.appState);
  return appState?.user ?? null;
}
