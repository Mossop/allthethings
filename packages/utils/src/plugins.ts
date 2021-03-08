/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awaitable, MaybeCallable } from "./types";

function isPromise<T>(val: Awaitable<T>): val is Promise<T> {
  return "then" in val && typeof val.then == "function";
}

function isCallable<T, C>(val: MaybeCallable<T, C>): val is (config: C) => T {
  return typeof val == "function";
}

export async function resolvePlugin<T, C>(
  val: MaybeCallable<Awaitable<T>, C>,
  config: C,
): Promise<T> {
  if (isCallable(val)) {
    val = val(config);
  }

  if (isPromise(val)) {
    val = await val;
  }

  return val;
}
