import IconButton from "@material-ui/core/IconButton";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { KeyboardEvent } from "react";
import { useRef, useCallback, useState } from "react";

import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { useFieldState } from "./Forms";
import { SaveIcon, CancelIcon } from "./Icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    boxShared: {
      ...flexRow,
      alignItems: "center",
      borderRadius: theme.shape.borderRadius,
      borderWidth: 2,
      borderStyle: "solid",
      width: "min-content",
    },
    boxInactive: {
      borderColor: "transparent",
    },
    boxActive: {
      borderColor: theme.palette.primary.main,
    },
    inputShared: {
      background: "transparent",
      color: theme.palette.text.primary,
      cursor: "text",
      border: "none",
      appearance: "none",
      outline: "none",
      padding: theme.spacing(1),
    },
    buttonShared: {
      fontSize: "1.2rem",
      marginRight: theme.spacing(1),
    },
    buttonInactive: {
      visibility: "collapse",
    },
  }));

export interface HiddenInputProps {
  initialValue: string;
  className?: string;
  onSubmit: (value: string) => void;
}

export default ReactMemo(function HiddenInput({
  initialValue,
  className,
  onSubmit,
}: HiddenInputProps): ReactResult {
  let classes = useStyles();
  let [value, setValue] = useState(initialValue);
  let [active, setShowButtons] = useState(false);
  let ref = useRef<HTMLInputElement | null>(null);

  let updateState = useFieldState(setValue);
  let currentValue = active ? value : initialValue;

  let focus = useCallback(() => {
    setValue(initialValue);
    setShowButtons(true);
  }, [initialValue]);
  let blur = useCallback(() => {
    if (value == initialValue) {
      setShowButtons(false);
    }
  }, [value, initialValue]);

  let submit = useCallback(() => {
    onSubmit(value);
    setShowButtons(false);
    ref.current?.blur();
  }, [onSubmit, value]);
  let cancel = useCallback(() => {
    setValue(initialValue);
    setShowButtons(false);
    ref.current?.blur();
  }, [initialValue]);

  let keypress = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Escape":
        cancel();
        break;
      case "Enter":
        submit();
        break;
    }
  }, [submit, cancel]);

  return <div
    className={clsx(classes.boxShared, active ? classes.boxActive : classes.boxInactive)}
  >
    <input
      ref={ref}
      onFocus={focus}
      onBlur={blur}
      type="text"
      className={clsx(className, classes.inputShared)}
      onChange={updateState}
      onKeyDown={keypress}
      value={currentValue}
    />
    <IconButton
      className={clsx(classes.buttonShared, !active && classes.buttonInactive)}
      onClick={submit}
    >
      <SaveIcon/>
    </IconButton>
    <IconButton
      className={clsx(classes.buttonShared, !active && classes.buttonInactive)}
      onClick={cancel}
    >
      <CancelIcon/>
    </IconButton>
  </div>;
});
