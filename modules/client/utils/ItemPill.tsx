import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";
import clsx from "clsx";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pill: {
      marginLeft: theme.spacing(1),
      textTransform: "uppercase",
      fontSize: "0.7rem",
      borderRadius: 5,
      padding: theme.spacing(0.5),
    },
    pillBorder: {
      borderColor: theme.palette.text.primary,
      borderStyle: "solid",
      borderWidth: 1,
    },
    pillLink: {
      cursor: "pointer",
    },
  }),
);

export type ItemPillProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  url?: string | null;
  border?: boolean;
};

export const ItemPill = ReactMemo(function ItemPill({
  url,
  className,
  border = true,
  children,
  ...props
}: ItemPillProps & ReactChildren): ReactResult {
  let classes = useStyles();

  if (url) {
    return (
      <div
        className={clsx(className, classes.pill, border && classes.pillBorder)}
        {...props}
      >
        <a
          className={classes.pillLink}
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      </div>
    );
  }

  return (
    <div
      className={clsx(className, classes.pill, border && classes.pillBorder)}
      {...props}
    >
      {children}
    </div>
  );
});
