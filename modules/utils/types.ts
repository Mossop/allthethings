export type Overwrite<A, B> = Omit<A, keyof B> & B;

export type MaybeCallable<T, C extends unknown[] = []> =
  | T
  | ((...args: C) => T);

export type Awaitable<T> = T | Promise<T>;

export type MakeRequired<T, F extends keyof T> = Omit<T, F> &
  Required<Pick<T, F>>;

export type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;

export type DescriptorsFor<C> = {
  [K in keyof C]: TypedPropertyDescriptor<C[K]>;
};
