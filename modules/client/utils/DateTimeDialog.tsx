import DateTimePicker from "@mui/lab/DateTimePicker";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import type { DateTime } from "luxon";
import { useCallback } from "react";

import { useBoolState } from "./hooks";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

const useStyles = makeStyles(() =>
  createStyles({
    pickerInput: {
      display: "none",
    },
  }),
);

export interface DateTimeDialogProps {
  okText: string;
  initialValue?: DateTime | null;
  onSelect: (date: DateTime) => void;
  onClosed: () => void;
}

export const DateTimeDialog = ReactMemo(function DateTimeDialog({
  initialValue,
  okText,
  onSelect,
  onClosed,
}: DateTimeDialogProps): ReactResult {
  let classes = useStyles();
  let [isOpen, , close] = useBoolState(true);

  let selected = useCallback(
    (date: DateTime | null) => {
      if (date) {
        onSelect(date);
      }
    },
    [onSelect],
  );

  return (
    <DateTimePicker
      // eslint-disable-next-line react/jsx-no-bind
      renderInput={(params: TextFieldProps) => <TextField {...params} />}
      value={initialValue}
      disablePast={true}
      showTodayButton={true}
      clearable={false}
      okText={okText}
      open={isOpen}
      className={classes.pickerInput}
      onChange={selected}
      onClose={close}
      DialogProps={{
        onClose: close,
        TransitionProps: {
          onExited: onClosed,
        },
      }}
    />
  );
});
