import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import alpha from "color-alpha";

import * as Icons from "./Icons";
import { flexRow } from "./styles";
import { Info } from "./Text";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    errorBox: {
      borderRadius: theme.shape.borderRadius,
      borderColor: theme.palette.error.main,
      borderStyle: "solid",
      borderWidth: 1,
      background: alpha(theme.palette.error.main, 0.4),
      padding: theme.spacing(1),
      color: theme.palette.error.contrastText,
      ...flexRow,
      alignItems: "start",
      marginBottom: theme.spacing(1),
    },
    errorMessage: {
      paddingLeft: theme.spacing(1),
    },
  }),
);

interface ErrorsProps {
  error: Error;
}

export const Error = ReactMemo(function Errors({
  error,
}: ErrorsProps): ReactResult {
  let classes = useStyles();

  return (
    <div className={classes.errorBox}>
      <Icons.Error />
      <Info className={classes.errorMessage}>{error.message}</Info>
    </div>
  );
});
