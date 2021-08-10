import { createStyles, makeStyles } from "@material-ui/core";
import type { ReactElement } from "react";
import { cloneElement, forwardRef } from "react";

import { Styles } from ".";
import type { ReactRef, ReactResult } from "./types";
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
      minWidth: "90%",
      minHeight: "90%",
      objectFit: "contain",
      objectPosition: "center center",
    },
  }),
);

export interface ImageIconProps {
  icon: ReactElement | string | URL;
}

export const ImageIcon = ReactMemo(
  forwardRef(function ImageIcon(
    { icon, ...props }: ImageIconProps,
    ref: ReactRef | null,
  ): ReactResult {
    let classes = useStyles();

    if (icon instanceof URL) {
      icon = icon.toString();
    }

    if (typeof icon == "string") {
      return (
        <div ref={ref} className={classes.iconContainer} {...props}>
          <img className={classes.icon} src={icon} />
        </div>
      );
    } else {
      return cloneElement(icon, { ref });
    }
  }),
);
