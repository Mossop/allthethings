import type { PureQueryOptions } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { DateTime } from "luxon";
import { useCallback } from "react";

import type { Overwrite } from "utils/src/types";

import { useEditTaskMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Task } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { CheckedIcon, UncheckedIcon } from "./Icons";
import type { ItemRenderProps } from "./Item";

export type TaskItemProps = Overwrite<ItemRenderProps, {
  item: Task;
}>;

export default ReactMemo(function TaskItem({
  taskList,
  item,
}: TaskItemProps): ReactResult {
  let refetchQueries: PureQueryOptions[] = [refetchListContextStateQuery()];
  if (taskList) {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: taskList.id,
    }));
  }

  let [toggleDone] = useEditTaskMutation({
    refetchQueries,
  });

  let toggle = useCallback(() => toggleDone({
    variables: {
      id: item.id,
      params: {
        link: item.link,
        archived: item.archived,
        summary: item.summary,
        due: item.due,
        done: item.done ? null : DateTime.utc(),
      },
    },
  }), [item, toggleDone]);

  return <>
    <IconButton onClick={toggle}>
      {item.done ? <CheckedIcon/> : <UncheckedIcon/>}
    </IconButton>
    <div>{item.summary}</div>
  </>;
});
