import { createStyles, makeStyles } from "@material-ui/core/styles";
import { DateTimePicker } from "@material-ui/pickers";
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
  initialValue?: DateTime | null;
  onSelect: (date: DateTime) => void;
  onClosed: () => void;
}

export const DateTimeDialog = ReactMemo(function DateTimeDialog({
  initialValue,
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
      value={initialValue}
      disablePast={true}
      showTodayButton={true}
      clearable={false}
      okLabel="Snooze"
      open={isOpen}
      className={classes.pickerInput}
      onChange={selected}
      onClose={close}
      DialogProps={{
        onClose: close,
        onExited: onClosed,
      }}
    />
  );
});
