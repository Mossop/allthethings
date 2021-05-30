export type Overwrite<A, B> = Omit<A, keyof B> & B;

export type MaybeCallable<T, C extends unknown[] = []> = T | ((...args: C) => T);

export type Awaitable<T> = T | Promise<T>;

export type MakeRequired<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>;

export type GraphQLType<T> = Omit<T, "__typename">;

export type GraphQLResolver<T> = {
  readonly [K in keyof GraphQLType<T>]: MaybeCallable<Awaitable<T[K]>>;
};
