import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { FileItem } from "../utils/state";
import { isTask } from "../utils/state";
import type { ItemRenderProps } from "./Item";
import TaskDoneToggle from "./TaskDoneToggle";

export type FileItemProps = Overwrite<ItemRenderProps, {
  item: FileItem;
}>;

export default ReactMemo(function FileItem({
  item,
}: FileItemProps): ReactResult {
  return <>
    {isTask(item) && <TaskDoneToggle item={item}/>}
    <div>{item.summary}</div>
  </>;
});
