import { createStyles, makeStyles } from "@material-ui/core";
import type { ReactElement } from "react";

import { Styles } from ".";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

export const useStyles = makeStyles(() =>
  createStyles({
    iconContainer: {
      width: "1.5rem",
      height: "1.5rem",
      ...Styles.flexCentered,
    },
    icon: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      objectPosition: "center center",
    },
  }));

export interface ImageIconProps {
  icon: ReactElement | string | URL;
}

export const ImageIcon = ReactMemo(function ImageIcon({
  icon,
}: ImageIconProps): ReactResult {
  let classes = useStyles();

  if (icon instanceof URL) {
    icon = icon.toString();
  }

  if (typeof icon == "string") {
    return <div className={classes.iconContainer}>
      <img className={classes.icon} src={icon}/>
    </div>;
  } else {
    return icon;
  }
});
