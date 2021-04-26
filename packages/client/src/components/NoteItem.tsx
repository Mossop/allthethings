import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import { createStyles, makeStyles } from "@material-ui/core";

import type { NoteItem } from "../utils/state";
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

export type NoteItemProps = Overwrite<ItemRenderProps, {
  item: NoteItem;
}>;

export default ReactMemo(function NoteItem({
  item,
}: NoteItemProps): ReactResult {
  let classes = useStyles();

  return <>
    <TaskDoneToggle item={item}/>
    <div className={classes.summary}>{item.summary}</div>
  </>;
});
