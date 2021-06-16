import { ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { TaskItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";

export type TaskItemProps = Overwrite<ItemRenderProps, {
  item: TaskItem;
}>;

export default ReactMemo(function TaskItem({
  item,
}: TaskItemProps): ReactResult {
  return <>
    <TaskDoneToggle item={item}/>
    <div>{item.summary}</div>
  </>;
});
