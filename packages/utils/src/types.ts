export type Overwrite<A, B> = Omit<A, keyof B> & B;
export type Required<A> = {
  [K in keyof A]-?: A[K];
};
