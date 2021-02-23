import { AppBar, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useCallback, Suspense } from "react";

import ContextMenu from "../ui/ContextMenu";
import ProjectList from "../ui/ProjectList";
import UserMenu from "../ui/UserMenu";
import { AllDragTypes, useDropArea } from "../utils/drag";
import { useUser } from "../utils/state";
import { flexColumn, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { useMaybeView } from "../utils/view";
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
      ...flexRow,
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    pageControls: {
      fontSize: "1rem",
      ...flexRow,
      alignItems: "center",
      columnGap: theme.spacing(2),
    },
    loading: {
      flex: 1,
    },
    contentSplit: {
      flex: 1,
      height: "100%",
      ...flexRow,
    },
  }));

interface PageProps {
  children: ReactNode
}

const PageControls = ReactMemo(function PageControls(): ReactResult {
  let classes = useStyles();
  let user = useUser();

  return <div className={classes.pageControls}>
    <ContextMenu/>
    <UserMenu user={user}/>
  </div>;
});

export default ReactMemo(function Page({
  children,
}: PageProps): ReactResult {
  let classes = useStyles();
  let view = useMaybeView();

  let {
    dropRef,
  } = useDropArea(AllDragTypes, {
    getDragResult: useCallback(() => null, []),
  });

  return <div className={clsx(classes.outer)} ref={dropRef}>
    <AppBar
      className={classes.banner}
      position="static"
      elevation={1}
      role="banner"
    >
      <h1 className={classes.title}>AllTheThings</h1>
      {view && <PageControls/>}
    </AppBar>
    {
      view
        ? <div className={classes.contentSplit}>
          <ProjectList view={view}/>
          <Suspense fallback={<Loading className={classes.loading}/>}>
            {children}
          </Suspense>
        </div>
        : <Suspense fallback={<Loading className={classes.loading}/>}>
          {children}
        </Suspense>
    }
  </div>;
});
