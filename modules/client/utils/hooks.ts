import { useCallback, useMemo, useState } from "react";

export function useBoolState(
  initial: boolean = false,
): [state: boolean, set: () => void, unset: () => void, toggle: () => void] {
  let [state, setState] = useState(initial);
  return [
    state,
    useCallback(() => setState(true), []),
    useCallback(() => setState(false), []),
    useCallback(() => setState((current: boolean): boolean => !current), []),
  ];
}

export function useBoundCallback<R, A extends unknown[], B extends unknown[]>(
  cb: (this: undefined, ...allArgs: [...A, ...B]) => R,
  ...fixedArgs: A
): (...args: B) => R {
  // @ts-ignore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => cb.bind(undefined, ...fixedArgs), [cb, ...fixedArgs]);
}
