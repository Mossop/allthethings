import { useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";

export function useBoolState(
  initial: boolean = false,
): [state: boolean, set: () => void, unset: () => void] {
  let [state, setState] = useState(initial);
  return [
    state,
    useCallback(() => setState(true), []),
    useCallback(() => setState(false), []),
  ];
}

export function useResetStore(): () => Promise<void> {
  let client = useApolloClient();
  return useCallback(async () => {
    await client.resetStore();
  }, [client]);
}
