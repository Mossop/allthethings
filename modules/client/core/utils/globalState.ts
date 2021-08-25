import type { ApolloQueryResult, ObservableQuery } from "@apollo/client";
import type { Update, Location } from "history";
import { SystemZone } from "luxon";

import { history } from "#client/utils";
import { DateTimeUnit } from "#utils";

import type {
  Problem,
  State,
  User,
  ListContextStateQuery,
  ListContextStateQueryVariables,
} from "../schema";
import { buildState, ListContextStateDocument } from "../schema";
import { client } from "../schema/client";
import { SharedState, useSharedState } from "./sharedstate";
import type { View } from "./view";
import { urlToView } from "./view";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let SCHEMA_VERSION: string;

const POLL_INTERVAL = 5000;
const MAX_BACKOFF = 10000;

let nextBackoff = (previous: number | null): number =>
  previous ? Math.min(MAX_BACKOFF, previous * 1.2) : POLL_INTERVAL;

function urlForLocation(location: Location): URL {
  return new URL(
    `${location.pathname}${location.search}${location.hash}`,
    document.URL,
  );
}

export type AppState = Omit<State, "problems"> & {
  view: View;
};

class GlobalStateManager {
  public readonly appState = new SharedState<AppState | undefined>(undefined);
  public readonly problems = new SharedState<readonly Problem[]>([]);
  private query: ObservableQuery<
    ListContextStateQuery,
    ListContextStateQueryVariables
  >;
  private lastBackoff: number | null = null;

  public constructor() {
    this.query = this.startQuery();

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

  private startQuery(): ObservableQuery<
    ListContextStateQuery,
    ListContextStateQueryVariables
  > {
    let query = client.watchQuery<
      ListContextStateQuery,
      ListContextStateQueryVariables
    >({
      query: ListContextStateDocument,
      variables: {
        dueBefore: [
          {
            type: "zone",
            zone: SystemZone.instance.name,
          },
          {
            type: "end",
            unit: DateTimeUnit.Day,
          },
        ],
      },
      pollInterval: POLL_INTERVAL,
      fetchPolicy: "network-only",
    });

    query.subscribe(
      (result: ApolloQueryResult<ListContextStateQuery>): void =>
        this.onNext(result),
      (error: Error) => this.onError(error),
    );

    return query;
  }

  private onNext(result: ApolloQueryResult<ListContextStateQuery>): void {
    this.lastBackoff = null;

    let { problems, ...userState } = buildState(result.data);

    this.appState.set({
      ...userState,
      view: urlToView(userState.user, urlForLocation(history.location)),
    });

    if (result.data.schemaVersion !== SCHEMA_VERSION) {
      this.problems.set([
        {
          description: "This page is outdated and must be reloaded.",
          url: "javascript:window.location.reload()",
        },
      ]);
    } else {
      this.problems.set(problems);
    }
  }

  private onError(error: Error): void {
    console.error(error);

    if (!this.lastBackoff) {
      this.problems.set([
        {
          description: "Lost connection to the server, try reloading.",
          url: "javascript:window.location.reload()",
        },
      ]);
    }

    this.lastBackoff = nextBackoff(this.lastBackoff);
    console.log("Backing off", this.lastBackoff);
    window.setTimeout(() => {
      this.query = this.startQuery();
    }, this.lastBackoff);
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
  return useSharedState(GlobalState.problems)[0];
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
