import { IconButton, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import type { KeyboardEvent } from "react";
import { useRef, useCallback, useState } from "react";
import type { ContentEditableEvent } from "react-contenteditable";
import ContentEditable from "react-contenteditable";

import * as Icons from "./Icons";
import { flexRow } from "./styles";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

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
  }));

export interface HiddenInputProps {
  initialValue: string;
  className?: string;
  onSubmit: (value: string) => void;
}

export const HiddenInput = ReactMemo(function HiddenInput({
  initialValue,
  className,
  onSubmit,
}: HiddenInputProps): ReactResult {
  let classes = useStyles();
  let value = useRef(initialValue);
  let [showButtons, setShowButtons] = useState(false);
  let ref = useRef<HTMLInputElement | null>(null);
  if (!showButtons) {
    value.current = initialValue;
  }

  let focus = useCallback(() => {
    value.current = initialValue;
    setShowButtons(true);
  }, [initialValue]);
  let blur = useCallback(() => {
    if (value.current == initialValue) {
      setShowButtons(false);
    }
  }, [value, initialValue]);

  let submit = useCallback(() => {
    onSubmit(value.current);
    setShowButtons(false);
    ref.current?.blur();
  }, [onSubmit, value]);
  let cancel = useCallback(() => {
    value.current = initialValue;
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

  let handleChange = useCallback((event: ContentEditableEvent): void => {
    value.current = event.target.value;
  }, []);

  return <div
    className={clsx(classes.boxShared, showButtons ? classes.boxActive : classes.boxInactive)}
  >
    <ContentEditable
      innerRef={ref}
      onFocus={focus}
      onBlur={blur}
      className={clsx(className, classes.inputShared)}
      onChange={handleChange}
      onKeyDown={keypress}
      spellCheck={showButtons}
      html={value.current}
    />
    {
      showButtons && <>
        <IconButton
          className={clsx(classes.buttonShared)}
          onClick={submit}
        >
          <Icons.Save/>
        </IconButton>
        <IconButton
          className={clsx(classes.buttonShared)}
          onClick={cancel}
        >
          <Icons.Cancel/>
        </IconButton>
      </>}
  </div>;
});
