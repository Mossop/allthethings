import { history } from "#ui";
import type { ApolloQueryResult } from "@apollo/client";
import type { Update, Location } from "history";

import type { Problem, State, User } from "../schema";
import { buildState } from "../schema";
import { client } from "../schema/client";
import type {
  ListContextStateQuery,
  ListContextStateQueryVariables,
} from "../schema/queries";
import {
  ListContextStateDocument,
} from "../schema/queries";
import { SharedState, useSharedState } from "./sharedstate";
import type { View } from "./view";
import { urlToView } from "./view";

function urlForLocation(location: Location): URL {
  return new URL(`${location.pathname}${location.search}${location.hash}`, document.URL);
}

export type AppState = State & {
  view: View
};

class GlobalStateManager {
  public readonly appState = new SharedState<AppState | undefined>(undefined);

  public constructor() {
    console.log("init");
    let query = client.watchQuery<ListContextStateQuery, ListContextStateQueryVariables>({
      query: ListContextStateDocument,
      pollInterval: 5000,
    });

    query.subscribe((result: ApolloQueryResult<ListContextStateQuery>): void => {
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
  let [appState] = useSharedState(GlobalState.appState);
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
