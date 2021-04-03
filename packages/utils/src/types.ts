export type Overwrite<A, B> = Omit<A, keyof B> & B;

export type MaybeCallable<T, C extends unknown[] = []> = T | ((...args: C) => T);

export type Awaitable<T> = T | Promise<T>;
