import { createStyles, makeStyles } from "@material-ui/core";

import type { Overwrite } from "../../../utils";
import type { ReactResult } from "../../utils";
import { ReactMemo } from "../../utils";
import type { NoteItem } from "../schema";
import type { ItemRenderProps } from "./Item";

const useStyles = makeStyles(() =>
  createStyles({
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }),
);

export type NoteItemProps = Overwrite<
  ItemRenderProps,
  {
    item: NoteItem;
  }
>;

export default ReactMemo(function NoteItem({
  item,
}: NoteItemProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.summary}>{item.summary}</div>;
});
