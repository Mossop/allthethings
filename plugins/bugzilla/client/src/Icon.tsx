import { SvgIcon, makeStyles, createStyles } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import BugIcon from "./Icon.svg";

const useStyles = makeStyles(() =>
  createStyles({
    icon: {
      marginBottom: "0.3em",
    },
  }));

export default function Icon(): ReactElement {
  let classes = useStyles();

  return <SvgIcon
    component={BugIcon}
    viewBox="0 0 95 125"
    className={classes.icon}
  />;
}
