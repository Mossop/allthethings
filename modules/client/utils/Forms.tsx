import type {
  ButtonProps as MuiButtonProps,
  OutlinedInputProps,
  Theme,
} from "@mui/material";
import {
  FormHelperText,
  MenuItem,
  CircularProgress,
  FormLabel,
  FormControl,
  InputLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  OutlinedInput,
  Checkbox as MuiCheckbox,
  Select as MuiSelect,
  Button as MuiButton,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import type {
  Dispatch,
  SetStateAction,
  ReactElement,
  ChangeEvent,
} from "react";
import { useMemo, useCallback, createContext, useContext } from "react";

import type { Overwrite } from "../../utils";
import { flexCentered } from "./styles";
import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export enum FormState {
  Default,
  Disabled,
  Loading,
  Error,
}

function isFormDisabled(formState: FormState): boolean {
  return formState == FormState.Disabled || formState == FormState.Loading;
}

const FormStateContext = createContext<FormState>(FormState.Default);

export interface FormStateProviderProps {
  state: FormState;
}

export const FormStateProvider = ReactMemo(function FormStateProvider({
  state,
  children,
}: FormStateProviderProps & ReactChildren): ReactResult {
  return (
    <FormStateContext.Provider value={state}>
      {children}
    </FormStateContext.Provider>
  );
});

export function useFormState(): FormState {
  return useContext(FormStateContext);
}

export function useScopedState<T, K extends keyof T>(
  key: K,
  setter: Dispatch<SetStateAction<T>>,
): Dispatch<SetStateAction<T[K]>> {
  return useCallback(
    (action: SetStateAction<T[K]>): void => {
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
    },
    [setter, key],
  );
}

interface FieldEvent<T> {
  target: {
    value: T;
  };
}
export function useFieldState<T>(
  setter: Dispatch<SetStateAction<T>>,
): Dispatch<FieldEvent<T>> {
  return useCallback(
    (event: FieldEvent<T>): void => {
      setter(event.target.value);
    },
    [setter],
  );
}

export interface FieldProps<T, K extends keyof T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  stateKey: K;
  fieldState?: FormState;
}

type TextFieldProps = Overwrite<
  Omit<OutlinedInputProps, "value" | "multiline" | "helperText">,
  {
    id: string;
    label?: string;
    type?: "email" | "password" | "text" | "url";
    value: string;
    error?: string | null;
    onChange: (value: string) => void;
    fieldState?: FormState;
  }
>;

type TextFieldInputProps<T, K extends keyof T> = Omit<
  TextFieldProps,
  "value" | "onChange"
> &
  FieldProps<T, K>;

export type TypedProps<S, T> = {
  [K in keyof S]: S[K] extends T ? K : never;
}[keyof S];

export const TextField = ReactMemo(function TextField({
  id,
  label,
  type = "text",
  error,
  value,
  onChange,
  fieldState,
  ...props
}: TextFieldProps): ReactElement {
  let change = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(event.target.value);
    },
    [onChange],
  );

  let globalState = useFormState();
  fieldState = fieldState ?? globalState;

  return (
    <FormControl
      margin="normal"
      variant="outlined"
      disabled={isFormDisabled(fieldState)}
      error={!!error}
    >
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <OutlinedInput
        {...props}
        id={id}
        label={label}
        type={type}
        value={value}
        onChange={change}
      />
      {error && <FormHelperText error={true}>{error}</FormHelperText>}
    </FormControl>
  );
});

export type NumberFieldProps = Overwrite<
  Omit<TextFieldProps, "type">,
  {
    value: number;
    onChange: (value: number) => void;
  }
>;

export const NumberField = ReactMemo(function NumberField({
  id,
  label,
  error,
  value,
  onChange,
  fieldState,
  ...props
}: NumberFieldProps): ReactElement {
  let change = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(event.target.valueAsNumber);
    },
    [onChange],
  );

  let globalState = useFormState();
  fieldState = fieldState ?? globalState;

  return (
    <FormControl
      margin="normal"
      variant="outlined"
      disabled={isFormDisabled(fieldState)}
      error={!!error}
    >
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <OutlinedInput
        {...props}
        id={id}
        label={label}
        type="number"
        value={value}
        onChange={change}
      />
      {error && <FormHelperText error={true}>{error}</FormHelperText>}
    </FormControl>
  );
});

export const TextFieldInput = ReactMemo(function TextFieldInput<
  T,
  K extends TypedProps<T, string>,
>({
  state,
  setState,
  stateKey,
  ...props
}: TextFieldInputProps<T, K>): ReactElement {
  let value = useMemo(
    () => state[stateKey],
    [state, stateKey],
  ) as unknown as string;

  let change = useScopedState(
    stateKey,
    setState,
  ) as unknown as Dispatch<string>;

  return <TextField value={value} onChange={change} {...props} />;
});

export interface RadioValue<T> {
  label: string;
  value: T;
}

type RadioGroupInputProps<T, K extends keyof T> = FieldProps<T, K> & {
  label: string;
  values: RadioValue<T[K]>[];
};

export const RadioGroupInput = ReactMemo(function RadioGroupInput<
  T,
  K extends keyof T,
>({
  label,
  state,
  setState,
  stateKey,
  values,
  fieldState,
}: RadioGroupInputProps<T, K>): ReactElement {
  let value = useMemo(() => state[stateKey], [state, stateKey]);

  let onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState(
        (state: T): T => ({
          ...state,
          [stateKey]: event.target.value,
        }),
      );
    },
    [setState, stateKey],
  );

  let globalState = useFormState();
  fieldState = fieldState ?? globalState;

  return (
    <FormControl
      component="fieldset"
      margin="normal"
      variant="outlined"
      disabled={isFormDisabled(fieldState)}
    >
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup value={value} onChange={onChange}>
        {values.map(({ value, label }: RadioValue<T[K]>) => (
          <FormControlLabel
            key={String(value)}
            value={value}
            control={<Radio />}
            label={label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
});

export interface CheckboxProps {
  checked: boolean;
  label: string;
  fieldState?: FormState;
  onChange: (checked: boolean) => void;
}

export const Checkbox = ReactMemo(function Checkbox({
  checked,
  label,
  fieldState,
  onChange,
}: CheckboxProps): ReactElement {
  let change = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
    [onChange],
  );

  let globalState = useFormState();
  fieldState = fieldState ?? globalState;

  return (
    <FormControlLabel
      disabled={isFormDisabled(fieldState)}
      control={
        <MuiCheckbox color="primary" checked={checked} onChange={change} />
      }
      label={label}
    />
  );
});

type CheckboxInputProps<T, K extends keyof T> = Omit<
  CheckboxProps,
  "onChange" | "checked"
> &
  FieldProps<T, K> & {
    checkedValue: T[K];
    uncheckedValue: T[K];
  };

export const CheckboxInput = ReactMemo(function CheckboxInput<
  T,
  K extends keyof T,
>({
  state,
  setState,
  stateKey,
  checkedValue,
  uncheckedValue,
  ...props
}: CheckboxInputProps<T, K>): ReactElement {
  let value = useMemo(() => state[stateKey], [state, stateKey]);

  let onChange = useCallback(
    (checked: boolean) => {
      setState(
        (state: T): T => ({
          ...state,
          [stateKey]: checked ? checkedValue : uncheckedValue,
        }),
      );
    },
    [setState, stateKey, checkedValue, uncheckedValue],
  );

  return (
    <Checkbox {...props} onChange={onChange} checked={value == checkedValue} />
  );
});

type BooleanCheckboxState<T extends string> = {
  [K in T]: boolean;
};

type BooleanCheckboxInputProps<
  K extends string,
  T extends BooleanCheckboxState<K>,
> = Omit<CheckboxInputProps<T, K>, "checkedValue" | "uncheckedValue">;

export const BooleanCheckboxInput = ReactMemo(function BooleanCheckboxInput<
  K extends string,
  T extends BooleanCheckboxState<K>,
>(props: BooleanCheckboxInputProps<K, T>): ReactElement {
  return (
    // @ts-ignore
    <CheckboxInput {...props} checkedValue={true} uncheckedValue={false} />
  );
});

const useButtonStyles = makeStyles((theme: Theme) =>
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
      color: theme.palette.primary.contrastText,
      ...flexCentered,
    },
  }),
);

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
  disabled =
    disabled ||
    isFormDisabled(fieldState) ||
    (fieldState == FormState.Error && type == "submit");

  let isLoading = fieldState == FormState.Loading && type == "submit";

  return (
    <MuiButton disabled={disabled} type={type} {...props}>
      <div className={classes.buttonInner}>
        <div className={clsx(isLoading && classes.hidden)}>{children}</div>
        {isLoading && (
          <div className={classes.loading}>
            <CircularProgress color="inherit" size="1.5rem" />
          </div>
        )}
      </div>
    </MuiButton>
  );
});

export interface SelectProps<T> {
  id: string;
  label?: string | null;
  value: keyof T;
  onChange: (value: keyof T) => void;
  items: T;
  fieldState?: FormState;
}

export const Select = ReactMemo(function Select<T>({
  id,
  label,
  value,
  onChange,
  fieldState,
  items,
}: SelectProps<T> & ReactChildren): ReactResult {
  let globalState = useFormState();
  fieldState = fieldState ?? globalState;

  let change = useCallback(
    (event: ChangeEvent<{ name?: string; value: keyof T }>) =>
      onChange(event.target.value),
    [onChange],
  );

  return (
    <FormControl
      margin="normal"
      variant="outlined"
      disabled={isFormDisabled(fieldState)}
    >
      {label && <InputLabel id={`${id}-label`}>{label}</InputLabel>}
      <MuiSelect
        labelId={`${id}-label`}
        id={id}
        value={value}
        // @ts-ignore
        onChange={change}
      >
        {/* @ts-ignore */}
        {Object.entries(items).map(([value, label]: [keyof T, string]) => (
          // @ts-ignore
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
});
