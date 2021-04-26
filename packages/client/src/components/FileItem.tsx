import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import { createStyles, makeStyles } from "@material-ui/core";

import type { FileItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";

const useStyles = makeStyles(() =>
  createStyles({
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }));

export type FileItemProps = Overwrite<ItemRenderProps, {
  item: FileItem;
}>;

export default ReactMemo(function FileItem({
  item,
}: FileItemProps): ReactResult {
  let classes = useStyles();

  return <>
    <TaskDoneToggle item={item}/>
    <div className={classes.summary}>{item.summary}</div>
  </>;
});
