import { memo } from "react";

export type Overwrite<A, B> = Omit<A, keyof B> & B;

export interface ReactChildren {
  children?: React.ReactNode;
}

export type ReactResult = React.ReactElement | null;

export function ReactMemo<T>(fn: T): T {
  // @ts-ignore
  return memo(fn);
}
