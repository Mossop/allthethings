import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { ReactNode } from "react";

import { ReactMemo, Styles } from "#client-utils";
import type { ReactResult } from "#client-utils";

import ProjectList from "../ui/ProjectList";
import { useMaybeUser } from "../utils/globalState";
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
  let user = useMaybeUser();

  sidebar = sidebar ?? (user ? <ProjectList/> : null);

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