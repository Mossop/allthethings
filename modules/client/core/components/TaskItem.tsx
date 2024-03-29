import type { Overwrite } from "../../../utils";
import { ReactMemo } from "../../utils";
import type { ReactResult } from "../../utils";
import type { TaskItem } from "../schema";
import type { ItemRenderProps } from "./Item";

export type TaskItemProps = Overwrite<
  ItemRenderProps,
  {
    item: TaskItem;
  }
>;

export default ReactMemo(function TaskItem({
  item,
}: TaskItemProps): ReactResult {
  return <div>{item.summary}</div>;
});
