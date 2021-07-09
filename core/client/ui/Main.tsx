import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { Suspense } from "react";

import type { ReactResult } from "#client-utils";
import { Loading, Styles } from "#client-utils";

import Page from "../components/Page";
import { useView, ViewType } from "../utils/view";
import Inbox from "./Inbox";
import MarkdownPage from "./MarkdownPage";
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
  let view = useView();
  let classes = useStyles();

  if (view === undefined) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (view.type == ViewType.Page) {
    return <MarkdownPage path={view.path}/>;
  }

  switch (view.type) {
    case ViewType.Inbox:
    case ViewType.AddLink:
      return <Inbox/>;
    case ViewType.TaskList:
      return <TaskList view={view}/>;
    case ViewType.Settings:
      return <Settings page={view.page} pluginId={view.pluginId}/>;
  }
}

export default function Main(): ReactResult {
  let classes = useStyles();

  return <div className={clsx(classes.outer)}>
    <Suspense fallback={<Loading className={classes.loading}/>}>
      <MainContent/>
    </Suspense>
  </div>;
}
