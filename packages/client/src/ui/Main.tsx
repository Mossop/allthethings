import { Loading, Styles } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { useCallback, Suspense } from "react";

import Page from "../components/Page";
import { useDropArea, AllDragTypes } from "../utils/drag";
import { useMaybeView, ViewType } from "../utils/view";
import Inbox from "./Inbox";
import LoginDialog from "./LoginDialog";
import NotFound from "./NotFound";
import Settings from "./Settings";
import TaskList from "./TaskList";

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      flex: 1,
    },
    outer: {
      ...Styles.flexColumn,
      height: "100vh",
      width: "100vw",
    },
    loading: {
      flex: 1,
    },
  }));

function MainContent(): ReactResult {
  let view = useMaybeView();
  let classes = useStyles();

  if (view === undefined) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (!view) {
    return <Page>
      <LoginDialog/>
    </Page>;
  }

  switch (view.type) {
    case ViewType.Inbox:
      return <Inbox/>;
    case ViewType.TaskList:
      return <TaskList view={view}/>;
    case ViewType.NotFound:
      return <NotFound/>;
    case ViewType.Settings:
      return <Settings page={view.page} pluginId={view.pluginId}/>;
  }
}

export default function Main(): ReactResult {
  let classes = useStyles();

  let {
    dropRef,
  } = useDropArea(AllDragTypes, {
    getDragResult: useCallback(() => null, []),
  });

  return <div className={clsx(classes.outer)} ref={dropRef}>
    <Suspense fallback={<Loading className={classes.loading}/>}>
      <MainContent/>
    </Suspense>
  </div>;
}
