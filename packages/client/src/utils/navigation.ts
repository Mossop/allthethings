import type { Location, Update } from "history";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useState } from "react";

export const history = createBrowserHistory();

export interface PageState {
  selectedContext: string | null;
  selectedProject: string | null;
}

function buildPageState(_location: Location): PageState {
  return {
    selectedContext: null,
    selectedProject: null,
  };
}

export function usePageState(): PageState {
  let [pageState, setPageState] = useState(buildPageState(history.location));

  let listener = useCallback((update: Update) => {
    setPageState(buildPageState(update.location));
  }, []);

  useEffect(() => history.listen(listener), []);

  return pageState;
}
