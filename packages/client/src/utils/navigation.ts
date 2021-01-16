import type { Location, Update } from "history";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLookupOwnerQuery } from "../schema/queries";

export const history = createBrowserHistory();

export interface PageState {
  selectedOwner: string | null;
  selectedContext: string | null;
}

function useLocation(): Location {
  let [location, setLocation] = useState(history.location);

  let listener = useCallback(({ location }: Update) => {
    setLocation(location);
  }, []);

  useEffect(() => history.listen(listener), [listener]);

  return location;
}

export function usePageState(): PageState {
  let [pageState, setPageState] = useState<PageState>({
    selectedContext: null,
    selectedOwner: null,
  });

  let { pathname } = useLocation();
  let stubs = useMemo(() => {
    let path = pathname.substring(1);
    while (path.endsWith("/")) {
      path = path.substring(0, path.length - 1);
    }
    if (path.length == 0) {
      return [];
    }
    return path.split("/");
  }, [pathname]);

  let { data } = useLookupOwnerQuery({
    variables: {
      stubs,
    },
  });

  useEffect(() => {
    if (data) {
      setPageState({
        selectedContext: data.user?.descend?.context.id ?? null,
        selectedOwner: data.user?.descend?.id ?? null,
      });
    }
  }, [data]);

  return pageState;
}

export function pushState(path: string): void {
  history.push(path);
}
