import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { ReactNode } from "react";

import { flexColumn, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import Banner from "./Banner";

const useStyles = makeStyles(() =>
  createStyles({
    outer: {
      ...flexColumn,
      height: "100vh",
      width: "100vw",
    },
    contentSplit: {
      flex: 1,
      height: "100%",
      ...flexRow,
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
