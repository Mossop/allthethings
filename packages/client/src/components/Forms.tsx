import type { OutlinedInputProps } from "@material-ui/core/OutlinedInput";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import type { Dispatch, SetStateAction, ReactElement } from "react";
import { useMemo, useCallback } from "react";

import type { Overwrite } from "../../../utils";
import { ReactMemo } from "../utils/types";

export function useScopedState<T, K extends keyof T>(
  key: K,
  setter: Dispatch<SetStateAction<T>>,
): Dispatch<SetStateAction<T[K]>> {
  return useCallback((action: SetStateAction<T[K]>): void => {
    setter((previous: T): T => {
      if (typeof action === "function") {
        // @ts-ignore
        action = action(previous[key]);
      }

      if (action !== previous[key]) {
        return {
          ...previous,
          [key]: action,
        };
      }

      return previous;
    });
  }, [setter, key]);
}

interface FieldEvent<T> {
  target: {
    value: T;
  };
}
export function useFieldState<T>(setter: Dispatch<SetStateAction<T>>): Dispatch<FieldEvent<T>> {
  return useCallback((event: FieldEvent<T>): void => {
    setter(event.target.value);
  }, [setter]);
}

interface FieldProps<T, K extends keyof T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  stateKey: K;
}

type TextFieldInputProps<T, K extends keyof T> = Overwrite<
  Omit<OutlinedInputProps, "onChange" | "value" | "multiline">,
  {
    type?: "email" | "password" | "text" | "url";
  }
> & FieldProps<T, K>;

type TypedProps<S, T> = {
  [K in keyof S]: S[K] extends T ? K : never;
}[keyof S];

export const TextFieldInput = ReactMemo(
  function TextFieldInput<T, K extends TypedProps<T, string>>({
    state,
    setState,
    stateKey,
    type = "text",
    ...props
  }: TextFieldInputProps<T, K>): ReactElement {
    let value = useMemo(() => state[stateKey], [state, stateKey]);
    let change = useFieldState(
      useScopedState(stateKey, setState),
    ) as unknown as Dispatch<FieldEvent<string>>;

    return <OutlinedInput
      {...props}
      type={type}
      value={value}
      onChange={change}
    />;
  },
);
