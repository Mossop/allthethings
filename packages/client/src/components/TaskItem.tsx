import { ReactMemo } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";

import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { TaskItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";
import TaskDoneToggle from "./TaskDoneToggle";

export type TaskItemProps = Overwrite<ItemRenderProps, {
  item: TaskItem;
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

  return <>
    <TaskDoneToggle item={item}/>
    <div>{item.summary}</div>
  </>;
});
