import type { MutableRefObject } from "react";
import { memo } from "react";

export interface ReactChildren {
  children?: React.ReactNode;
}

export type ReactResult = React.ReactElement | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReactRef<T = any> = ((instance: T | null) => void) | MutableRefObject<T | null>;

export function ReactMemo<T>(fn: T): T {
  // @ts-ignore
  return memo(fn);
}
