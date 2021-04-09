import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { DateTime } from "luxon";
import { useCallback } from "react";

import * as Icons from "./Icons";
import type { Item, TaskInfo } from "./schema";
import { useEditTaskInfoMutation } from "./schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "./schema/queries";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

export type TaskItem = Overwrite<Item, {
  taskInfo: TaskInfo;
}>;

export interface TaskDoneToggleProps {
  item: Item;
}

export const TaskDoneToggle = ReactMemo(function TaskDoneToggle({
  item,
}: TaskDoneToggleProps): ReactResult {
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

  return item.taskInfo
    ? <IconButton onClick={toggle}>
      {item.taskInfo.done ? <Icons.Checked/> : <Icons.Unchecked/>}
    </IconButton>
    : null;
});
