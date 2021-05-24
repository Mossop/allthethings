import {
  Button,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import type { FormEvent } from "react";
import { useCallback } from "react";

import { Error } from "./Error";
import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export interface DialogProps {
  isOpen: boolean;
  onSubmit: () => void;
  onClose?: () => void;
  onClosed?: () => void;
  title: string;
  error?: Error | null;
  submitLabel?: string;
  cancelLabel?: string | null;
}

export const Dialog = ReactMemo(function Dialog({
  isOpen,
  onSubmit,
  onClose,
  onClosed,
  title,
  error,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  children,
}: DialogProps & ReactChildren): ReactResult {
  let submit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  }, [onSubmit]);

  return <MuiDialog open={isOpen} onClose={onClose} onExited={onClosed}>
    <form onSubmit={submit}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Error error={error}/>}
        {children}
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">{submitLabel}</Button>
        {cancelLabel && <Button onClick={onClose} variant="contained">{cancelLabel}</Button>}
      </DialogActions>
    </form>
  </MuiDialog>;
});
