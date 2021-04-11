import { SvgIcon, makeStyles, createStyles } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import BugIcon from "./Icon.svg";

const useStyles = makeStyles(() =>
  createStyles({
    icon: {
    },
  }));

export default function Icon(): ReactElement {
  let classes = useStyles();

  return <SvgIcon
    component={BugIcon}
    viewBox="0 9 95 134"
    className={classes.icon}
  />;
}
