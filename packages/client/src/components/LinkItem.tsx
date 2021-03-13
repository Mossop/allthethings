import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { LinkItem } from "../utils/state";
import { isTask } from "../utils/state";
import type { ItemRenderProps } from "./Item";
import TaskDoneToggle from "./TaskDoneToggle";

export type LinkItemProps = Overwrite<ItemRenderProps, {
  item: LinkItem;
}>;

export default ReactMemo(function LinkItem({
  item,
}: LinkItemProps): ReactResult {
  return <>
    {isTask(item) && <TaskDoneToggle item={item}/>}
    <div>{item.summary}</div>
  </>;
});
