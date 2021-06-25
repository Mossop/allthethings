import type { Dispatch } from "react";
import { useEffect, useState } from "react";

export class SharedState<T> {
  private listeners: Set<Dispatch<T>>;

  public constructor(private currentState: T) {
    this.listeners = new Set();
  }

  public listen(listener: Dispatch<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public get value(): T {
    return this.currentState;
  }

  public set(val: T): void {
    this.currentState = val;
    for (let listener of this.listeners) {
      listener(val);
    }
  }
}

export function useSharedState<T>(state: SharedState<T>): [T, Dispatch<T>] {
  let [value, setValue] = useState<T>(state.value);

  useEffect(() => state.listen(setValue), [state]);

  return [value, (val: T) => state.set(val)];
}

export function useAsyncSharedState<T>(state: SharedState<T>): [T, Dispatch<T>] {
  let [value, setValue] = useState<T>(state.value);

  useEffect(() => state.listen((val: T) => {
    requestAnimationFrame(() => setValue(val));
  }), [state]);

  return [value, (val: T) => state.set(val)];
}
