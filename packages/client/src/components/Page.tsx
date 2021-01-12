import AppBar from "@material-ui/core/AppBar";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";
import { Suspense } from "react";

import { flexColumn } from "../utils/styles";
import Loading from "./Loading";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outer: {
      ...flexColumn,
      height: "100vh",
      width: "100vw",
    },
    banner: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "start",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    loading: {
      flex: 1,
    },
  }));

interface PageProps {
  children: ReactNode
}

export default function Page({
  children,
}: PageProps): ReactElement {
  let classes = useStyles();

  return <div className={clsx(classes.outer)}>
    <AppBar
      className={classes.banner}
      position="static"
      elevation={0}
      role="banner"
    >
      <h1 className={classes.title}>AllTheThings</h1>
    </AppBar>
    <Suspense fallback={<Loading className={classes.loading}/>}>
      {children}
    </Suspense>
  </div>;
}
