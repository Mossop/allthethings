import { IconButton } from "@material-ui/core";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { DateTime } from "luxon";
import { useCallback } from "react";

import { TaskController } from "#schema";
import { Icons, ReactMemo } from "#ui";
import type { ReactResult } from "#ui";

import { useEditTaskInfoMutation, refetchQueriesForItem } from "../schema";
import type { Item } from "../schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    noTask: {
      width: `calc(${theme.spacing(3)}px + 1.5rem)`,
      height: `calc(${theme.spacing(3)}px + 1.5rem)`,
    },
  }));

export interface TaskDoneToggleProps {
  item: Item;
  disabled?: boolean;
}

export const TaskDoneToggle = ReactMemo(function TaskDoneToggle({
  item,
  disabled = false,
}: TaskDoneToggleProps): ReactResult {
  let classes = useStyles();

  let [toggleDone] = useEditTaskInfoMutation({
    refetchQueries: refetchQueriesForItem(item),
  });

  let toggle = useCallback(() => {
    if (!item.taskInfo) {
      return;
    }

    void toggleDone({
      variables: {
        id: item.id,
        taskInfo: {
          due: item.taskInfo.due,
          done: item.taskInfo.done ? null : DateTime.utc(),
        },
      },
    });
  }, [item, toggleDone]);

  if (!item.taskInfo) {
    return <div className={classes.noTask}/>;
  }

  return <IconButton
    onClick={toggle}
    disabled={disabled || item.taskInfo.controller != TaskController.Manual}
  >
    {item.taskInfo.done ? <Icons.Checked/> : <Icons.Unchecked/>}
  </IconButton>;
});
