import { CircularProgress } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

import { flexCentered } from "./styles";
import { ReactMemo } from "./types";

const useStyles = makeStyles(() =>
  createStyles({
    loading: {
      ...flexCentered,
    },
  }),
);

export const Loading = ReactMemo(function Loading({
  className,
  ...divProps
}: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  let classes = useStyles();

  return (
    <div className={clsx(classes.loading, className)} {...divProps}>
      <CircularProgress />
    </div>
  );
});
