import type { Update, Location } from "history";
import { SystemZone } from "luxon";

import type { ServerState } from "#client/utils";
import { api, history, log, Query } from "#client/utils";
import type { RelativeDateTime } from "#utils";
import { DateTimeUnit, encodeRelativeDateTime } from "#utils";

import type { Problem, State, User } from "../schema";
import { buildState } from "../schema";
import { SharedState, useSharedState } from "./sharedstate";
import type { View } from "./view";
import { urlToView } from "./view";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let SCHEMA_VERSION: string;

const POLL_INTERVAL = 60000;

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
  private query: Query<[{ dueBefore: string }], ServerState>;
  private lastError: Error | null = null;

  public constructor() {
    let dueBefore: RelativeDateTime = [
      {
        type: "zone",
        zone: SystemZone.instance.name,
      },
      {
        type: "end",
        unit: DateTimeUnit.Day,
      },
    ];

    this.query = new Query(
      api.state.getState,
      [{ dueBefore: encodeRelativeDateTime(dueBefore) }],
      { pollInterval: POLL_INTERVAL },
    );

    this.query.on("data", (data: ServerState) => this.onData(data));
    this.query.on("error", (error: Error) => this.onError(error));

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

  private onData(data: ServerState): void {
    this.lastError = null;

    let { problems, ...userState } = buildState(data);

    this.appState.set({
      ...userState,
      view: urlToView(userState.user, urlForLocation(history.location)),
    });

    if (data.schemaVersion !== SCHEMA_VERSION) {
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
    if (!this.lastError) {
      this.problems.set([
        {
          description: "Lost connection to the server, try reloading.",
          url: "javascript:window.location.reload()",
        },
      ]);
    }

    this.lastError = error;
    log.error("Saw server error", { error });
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
