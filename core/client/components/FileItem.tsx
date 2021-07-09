import { createStyles, makeStyles } from "@material-ui/core";

import type { ReactResult } from "#client-utils";
import { ReactMemo } from "#client-utils";
import type { Overwrite } from "#utils";

import type { FileItem } from "../schema";
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

  return <div className={classes.summary}>{item.summary}</div>;
});
