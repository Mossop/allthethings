import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";
import { pushClickedLink } from "./url";

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      cursor: "pointer",
    },
  }),
);

export interface LinkProps {
  href: string | URL;
  className?: string;
}

export const Link = ReactMemo(function Link({
  children,
  href,
  className,
  ...props
}: LinkProps & ReactChildren): ReactResult {
  let classes = useStyles();

  return (
    <a
      href={href.toString()}
      className={clsx(className, classes.link)}
      onClick={pushClickedLink}
      {...props}
    >
      {children}
    </a>
  );
});
