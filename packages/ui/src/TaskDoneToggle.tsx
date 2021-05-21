import { TaskController } from "@allthethings/schema";
import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { DateTime } from "luxon";
import { useCallback } from "react";

import * as Icons from "./Icons";
import type { Item, TaskInfo } from "./schema";
import { useEditTaskInfoMutation } from "./schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "./schema/queries";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    noTask: {
      width: `calc(${theme.spacing(3)}px + 1.5rem)`,
      height: `calc(${theme.spacing(3)}px + 1.5rem)`,
    },
  }));

export type TaskItem = Overwrite<Item, {
  taskInfo: TaskInfo;
}>;

export interface TaskDoneToggleProps {
  item: Item;
  disabled?: boolean;
}

export const TaskDoneToggle = ReactMemo(function TaskDoneToggle({
  item,
  disabled = false,
}: TaskDoneToggleProps): ReactResult {
  let classes = useStyles();

  let refetchQueries: PureQueryOptions[] = [refetchListContextStateQuery()];
  if (item.parent.__typename == "Section") {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: item.parent.taskList.id,
    }));
  } else if (item.parent.__typename != "Inbox") {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: item.parent.id,
    }));
  }

  let [toggleDone] = useEditTaskInfoMutation({
    refetchQueries,
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
