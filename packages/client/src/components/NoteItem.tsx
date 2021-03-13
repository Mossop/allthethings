import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { NoteItem } from "../utils/state";
import { isTask } from "../utils/state";
import type { ItemRenderProps } from "./Item";
import TaskDoneToggle from "./TaskDoneToggle";

export type NoteItemProps = Overwrite<ItemRenderProps, {
  item: NoteItem;
}>;

export default ReactMemo(function NoteItem({
  item,
}: NoteItemProps): ReactResult {
  return <>
    {isTask(item) && <TaskDoneToggle item={item}/>}
    <div>{item.summary}</div>
  </>;
});
