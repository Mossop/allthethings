import { IconButton } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { DateTime } from "luxon";
import { useCallback } from "react";

import { Icons, ReactMemo, TaskController } from "../../utils";
import type { ReactResult } from "../../utils";
import type { Item } from "../schema";
import { useEditTaskMutation } from "../utils/api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    noTask: {
      width: `calc(${theme.spacing(2)} + 1.5rem)`,
      height: `calc(${theme.spacing(2)} + 1.5rem)`,
    },
  }),
);

export interface TaskDoneToggleProps {
  item: Item;
  disabled?: boolean;
}

export const TaskDoneToggle = ReactMemo(function TaskDoneToggle({
  item,
  disabled = false,
}: TaskDoneToggleProps): ReactResult {
  let classes = useStyles();

  let [editTask] = useEditTaskMutation();

  let toggle = useCallback(() => {
    if (!item.taskInfo) {
      return;
    }

    void editTask({
      id: item.id,
      params: {
        done: item.taskInfo.done ? null : DateTime.utc().toISO(),
      },
    });
  }, [item, editTask]);

  if (!item.taskInfo) {
    return <div className={classes.noTask} />;
  }

  return (
    <IconButton
      onClick={toggle}
      disabled={disabled || item.taskInfo.controller != TaskController.Manual}
    >
      {item.taskInfo.done ? <Icons.Checked /> : <Icons.Unchecked />}
    </IconButton>
  );
});
