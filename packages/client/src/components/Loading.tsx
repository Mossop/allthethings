import CircularProgress from "@material-ui/core/CircularProgress";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

import { flexCentered } from "../utils/styles";

const useStyles = makeStyles(() =>
  createStyles({
    loading: {
      ...flexCentered,
    },
  }));

export default function Loading({
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
}
