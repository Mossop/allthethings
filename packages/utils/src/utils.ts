/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awaitable, MaybeCallable } from "./types";

export function isPromise<T>(val: Awaitable<T>): val is Promise<T> {
  return "then" in val && typeof val.then == "function";
}

export function waitFor<T>(val: Awaitable<T>): Promise<T> {
  if (!isPromise(val)) {
    return Promise.resolve(val);
  }
  return val;
}

export function isCallable<T, C extends unknown[]>(
  val: MaybeCallable<T, C>,
): val is (...args: C) => T {
  return typeof val == "function";
}

export function call<T, C extends unknown[]>(val: MaybeCallable<T, C>, ...args: C): T {
  if (isCallable(val)) {
    return val(...args);
  }

  return val;
}
