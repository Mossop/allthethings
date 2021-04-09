import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { FileItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";

export type FileItemProps = Overwrite<ItemRenderProps, {
  item: FileItem;
}>;

export default ReactMemo(function FileItem({
  item,
}: FileItemProps): ReactResult {
  return <>
    <TaskDoneToggle item={item}/>
    <div>{item.summary}</div>
  </>;
});
