import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { NoteItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";

export type NoteItemProps = Overwrite<ItemRenderProps, {
  item: NoteItem;
}>;

export default ReactMemo(function NoteItem({
  item,
}: NoteItemProps): ReactResult {
  return <>
    <TaskDoneToggle item={item}/>
    <div>{item.summary}</div>
  </>;
});
