import { CircularProgress, createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

import { flexCentered } from "../utils/styles";
import { ReactMemo } from "../utils/types";

const useStyles = makeStyles(() =>
  createStyles({
    loading: {
      ...flexCentered,
    },
  }));

export default ReactMemo(function Loading({
  className,
  ...divProps
}: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  let classes = useStyles();

  return <div
    className={clsx(classes.loading, className)}
    {...divProps}
  >
    <CircularProgress/>
  </div>;
});
