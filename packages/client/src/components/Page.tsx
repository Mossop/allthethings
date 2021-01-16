import AppBar from "@material-ui/core/AppBar";
import Paper from "@material-ui/core/Paper";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { useCurrentUserQuery } from "../schema/queries";
import ContextMenu from "../ui/ContextMenu";
import UserMenu from "../ui/UserMenu";
import { usePageState } from "../utils/navigation";
import { flexColumn, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import Loading from "./Loading";
import ProjectList from "./ProjectList";

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
      ...flexRow,
    },
  }));

interface PageProps {
  children: ReactNode
}

const PageControls = ReactMemo(function PageControls(): ReactResult {
  let classes = useStyles();
  let { data: { user } = { user: null } } = useCurrentUserQuery();

  if (!user) {
    return null;
  }

  return <div className={classes.pageControls}>
    <ContextMenu/>
    <UserMenu user={user}/>
  </div>;
});

interface SidebarProps {
  selectedContext: string;
  selectedOwner: string;
}

const Sidebar = ReactMemo(function Sidebar({
  selectedContext,
  selectedOwner,
}: SidebarProps): ReactResult {
  return <Paper elevation={1} component="nav">
    <ProjectList
      selectedContext={selectedContext}
      selectedOwner={selectedOwner}
    />
  </Paper>;
});

export default ReactMemo(function Page({
  children,
}: PageProps): ReactResult {
  let classes = useStyles();

  let { selectedContext, selectedOwner } = usePageState();

  return <div className={clsx(classes.outer)}>
    <AppBar
      className={classes.banner}
      position="static"
      elevation={1}
      role="banner"
    >
      <h1 className={classes.title}>AllTheThings</h1>
      <PageControls/>
    </AppBar>
    <div className={classes.contentSplit}>
      {
        selectedContext && selectedOwner && <Sidebar
          selectedContext={selectedContext}
          selectedOwner={selectedOwner}
        />
      }
      <Suspense fallback={<Loading className={classes.loading}/>}>
        {children}
      </Suspense>
    </div>
  </div>;
});
