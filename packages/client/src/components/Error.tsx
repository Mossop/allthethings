import type { ApolloError } from "@apollo/client";
import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import alpha from "color-alpha";

import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { ErrorIcon } from "./Icons";
import { Info } from "./Text";

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
    },
    errorMessage: {
      paddingLeft: theme.spacing(1),
    },
  }));

interface ErrorsProps {
  error: ApolloError;
}

export default ReactMemo(function Errors({
  error,
}: ErrorsProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.errorBox}>
    <ErrorIcon/>
    <Info className={classes.errorMessage}>{error.message}</Info>
  </div>;
});
