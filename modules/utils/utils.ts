import type { Awaitable, MaybeCallable } from "./types";

export function isPromise<T>(val: Awaitable<T>): val is Promise<T> {
  return (
    val &&
    typeof val == "object" &&
    "then" in val &&
    typeof val.then == "function"
  );
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

export function call<R, A extends unknown[]>(
  obj: unknown,
  val: MaybeCallable<R, A>,
  ...args: A
): R {
  if (isCallable(val)) {
    return val.apply(obj, args);
  }

  return val;
}

export function assert<T>(value: Promise<T | null | undefined>): Promise<T>;
export function assert<T>(value: T | null | undefined): T;
export function assert<T>(
  value: Awaitable<T | null | undefined>,
): Awaitable<T> {
  if (isPromise(value)) {
    return value.then((value: T | null | undefined): T => {
      if (value === null || value === undefined) {
        throw new Error(`Illegal ${value}`);
      }

      return value;
    });
  }

  if (value === null || value === undefined) {
    throw new Error(`Illegal ${value}`);
  }

  return value;
}

export interface Deferred<R> {
  resolve: (value: R | PromiseLike<R>) => void;
  reject: (value?: Error) => void;
  promise: Promise<R>;
}

export function defer<R>(): Deferred<R> {
  let resolveCallback: (value: R | PromiseLike<R>) => void;
  let rejectCallback: (reason?: Error) => void;

  let promise = new Promise<R>(
    (
      resolve: (value: R | PromiseLike<R>) => void,
      reject: (value?: Error) => void,
    ) => {
      resolveCallback = resolve;
      rejectCallback = reject;
    },
  );

  return {
    resolve: resolveCallback!,
    reject: rejectCallback!,
    promise,
  };
}

export function lazy<T>(cb: () => Promise<T>): PromiseLike<T> {
  return {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): PromiseLike<TResult1 | TResult2> {
      return cb().then(onfulfilled, onrejected);
    },
  };
}
