import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { ReactNode } from "react";

import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, Styles } from "@allthethings/ui";

import Banner from "./Banner";

const useStyles = makeStyles(() =>
  createStyles({
    outer: {
      ...Styles.flexColumn,
      height: "100vh",
      width: "100vw",
    },
    contentSplit: {
      flex: 1,
      height: "100%",
      ...Styles.flexRow,
    },
  }));

interface PageProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export default ReactMemo(function Page({
  sidebar,
  children,
}: PageProps): ReactResult {
  let classes = useStyles();

  return <div className={clsx(classes.outer)}>
    <Banner/>
    {
      sidebar
        ? <div className={classes.contentSplit}>
          {sidebar}
          {children}
        </div>
        : children
    }
  </div>;
});
