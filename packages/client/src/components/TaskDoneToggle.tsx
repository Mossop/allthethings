import { Icons, ReactMemo } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { PureQueryOptions } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { DateTime } from "luxon";
import { useCallback } from "react";

import { useEditTaskInfoMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Item, WithTask } from "../utils/state";
import { isSection, isTaskList } from "../utils/state";

export interface TaskDoneToggleProps<T extends Item> {
  item: WithTask<T>;
}

export default ReactMemo(function TaskDoneToggle<T extends Item>({
  item,
}: TaskDoneToggleProps<T>): ReactResult {
  let refetchQueries: PureQueryOptions[] = [refetchListContextStateQuery()];
  if (isSection(item.parent)) {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: item.parent.taskList.id,
    }));
  } else if (isTaskList(item.parent)) {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: item.parent.id,
    }));
  }

  let [toggleDone] = useEditTaskInfoMutation({
    refetchQueries,
  });

  let toggle = useCallback(() => toggleDone({
    variables: {
      id: item.id,
      taskInfo: {
        due: item.taskInfo.due,
        done: item.taskInfo.done ? null : DateTime.utc(),
      },
    },
  }), [item, toggleDone]);

  return <IconButton onClick={toggle}>
    {item.taskInfo.done ? <Icons.Checked/> : <Icons.Unchecked/>}
  </IconButton>;
});
