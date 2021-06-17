import { ReactMemo } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { TaskItem } from "../schema";
import type { ItemRenderProps } from "./Item";

export type TaskItemProps = Overwrite<ItemRenderProps, {
  item: TaskItem;
}>;

export default ReactMemo(function TaskItem({
  item,
}: TaskItemProps): ReactResult {
  return <div>{item.summary}</div>;
});
