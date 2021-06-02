import type { Overwrite } from "@allthethings/utils";
import type { ButtonProps as MuiButtonProps, OutlinedInputProps } from "@material-ui/core";
import {
  CircularProgress,
  createStyles, makeStyles,
  FormLabel,
  FormControl,
  InputLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  OutlinedInput,
  Checkbox,
  Button as MuiButton,
} from "@material-ui/core";
import clsx from "clsx";
import type { Dispatch, SetStateAction, ReactElement } from "react";
import { useMemo, useCallback, createContext, useContext } from "react";

import { flexCentered } from "./styles";
import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export enum FormState {
  Default,
  Disabled,
  Loading,
}

const FormStateContext = createContext<FormState>(FormState.Default);

export interface FormStateProviderProps {
  state: FormState;
}

export const FormStateProvider = ReactMemo(function FormStateProvider({
  state,
  children,
}: FormStateProviderProps & ReactChildren): ReactResult {
  return <FormStateContext.Provider value={state}>
    {children}
  </FormStateContext.Provider>;
});

export function useFormState(): FormState {
  return useContext(FormStateContext);
}

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

export interface FieldProps<T, K extends keyof T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  stateKey: K;
  fieldState?: FormState;
}

type TextFieldInputProps<T, K extends keyof T> = Overwrite<
  Omit<OutlinedInputProps, "onChange" | "value" | "multiline">,
  {
    id: string;
    label: string;
    type?: "email" | "password" | "text" | "url";
  }
> & FieldProps<T, K>;

export type TypedProps<S, T> = {
  [K in keyof S]: S[K] extends T ? K : never;
}[keyof S];

export const TextFieldInput = ReactMemo(
  function TextFieldInput<T, K extends TypedProps<T, string>>({
    id,
    label,
    state,
    setState,
    stateKey,
    type = "text",
    fieldState,
    ...props
  }: TextFieldInputProps<T, K>): ReactElement {
    let value = useMemo(() => state[stateKey], [state, stateKey]);

    let change = useFieldState(
      useScopedState(stateKey, setState),
    ) as unknown as Dispatch<FieldEvent<string>>;

    let globalState = useFormState();
    fieldState = fieldState ?? globalState;

    return <FormControl
      margin="normal"
      variant="outlined"
      disabled={fieldState != FormState.Default}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        {...props}
        id={id}
        label={label}
        type={type}
        value={value}
        onChange={change}
      />
    </FormControl>;
  },
);

export interface RadioValue<T> {
  label: string;
  value: T;
}

type RadioGroupInputProps<T, K extends keyof T> = FieldProps<T, K> & {
  label: string;
  values: RadioValue<T[K]>[]
};

export const RadioGroupInput = ReactMemo(
  function RadioGroupInput<T, K extends keyof T>({
    label,
    state,
    setState,
    stateKey,
    values,
    fieldState,
  }: RadioGroupInputProps<T, K>): ReactElement {
    let value = useMemo(() => state[stateKey], [state, stateKey]);

    let onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setState((state: T): T => ({
        ...state,
        [stateKey]: event.target.value,
      }));
    }, [setState, stateKey]);

    let globalState = useFormState();
    fieldState = fieldState ?? globalState;

    return <FormControl
      component="fieldset"
      margin="normal"
      variant="outlined"
      disabled={fieldState != FormState.Default}
    >
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup value={value} onChange={onChange}>
        {
          values.map(({ value, label }: RadioValue<T[K]>) => <FormControlLabel
            key={String(value)}
            value={value}
            control={<Radio/>}
            label={label}
          />)
        }
      </RadioGroup>
    </FormControl>;
  },
);

type CheckboxInputProps<T, K extends keyof T> = FieldProps<T, K> & {
  label: string;
  checkedValue: T[K];
  uncheckedValue: T[K];
};

export const CheckboxInput = ReactMemo(
  function CheckboxInput<T, K extends keyof T>({
    label,
    state,
    setState,
    stateKey,
    checkedValue,
    uncheckedValue,
    fieldState,
  }: CheckboxInputProps<T, K>): ReactElement {
    let value = useMemo(() => state[stateKey], [state, stateKey]);

    let onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setState((state: T): T => ({
        ...state,
        [stateKey]: event.target.checked ? checkedValue : uncheckedValue,
      }));
    }, [setState, stateKey, checkedValue, uncheckedValue]);

    let globalState = useFormState();
    fieldState = fieldState ?? globalState;

    return <FormControlLabel
      disabled={fieldState != FormState.Default}
      control={
        <Checkbox
          color="primary"
          checked={value == checkedValue}
          onChange={onChange}
        />
      }
      label={label}
    />;
  },
);

type BooleanCheckboxState<T extends string> = {
  [K in T]: boolean;
};

type BooleanCheckboxInputProps<
  K extends string,
  T extends BooleanCheckboxState<K>,
> = Omit<CheckboxInputProps<T, K>, "checkedValue" | "uncheckedValue">;

export const BooleanCheckboxInput = ReactMemo(
  function BooleanCheckboxInput<K extends string, T extends BooleanCheckboxState<K>>(
    props: BooleanCheckboxInputProps<K, T>,
  ): ReactElement {
    // @ts-ignore
    return <CheckboxInput {...props} checkedValue={true} uncheckedValue={false}/>;
  },
);

const useButtonStyles = makeStyles(() =>
  createStyles({
    buttonInner: {
      position: "relative",
      minHeight: "1.5rem",
      minWidth: "1.5rem",
      ...flexCentered,
    },
    hidden: {
      visibility: "collapse",
    },
    loading: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      ...flexCentered,
    },
  }));

export type ButtonProps = MuiButtonProps & {
  fieldState?: FormState;
};

export const Button = ReactMemo(function Button({
  fieldState,
  disabled,
  type,
  children,
  ...props
}: ButtonProps): ReactResult {
  let classes = useButtonStyles();

  let globalState = useFormState();
  fieldState = fieldState ?? globalState;
  disabled = disabled ?? fieldState != FormState.Default;

  let isLoading = fieldState == FormState.Loading && type == "submit";

  return <MuiButton disabled={disabled} type={type} {...props}>
    <div className={classes.buttonInner}>
      <div className={clsx(isLoading && classes.hidden)}>{children}</div>
      {isLoading && <div
        className={classes.loading}
      >
        <CircularProgress size="1.5rem"/>
      </div>}
    </div>
  </MuiButton>;
});
