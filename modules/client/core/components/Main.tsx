import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import { Suspense } from "react";

import type { ReactResult } from "../../utils";
import { Loading, Styles } from "../../utils";
import Inbox from "../pages/Inbox";
import MarkdownPage from "../pages/MarkdownPage";
import Settings from "../pages/Settings";
import TaskList from "../pages/TaskList";
import { useView, ViewType } from "../utils/view";
import Page from "./Page";

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
  }),
);

function MainContent(): ReactResult {
  let view = useView();
  let classes = useStyles();

  if (view === undefined) {
    return (
      <Page>
        <Loading className={classes.content} />
      </Page>
    );
  }

  if (view.type == ViewType.Page) {
    return <MarkdownPage path={view.path} />;
  }

  switch (view.type) {
    case ViewType.Inbox:
    case ViewType.AddLink:
      return <Inbox />;
    case ViewType.TaskList:
      return <TaskList view={view} />;
    case ViewType.Settings:
      return <Settings page={view.page} serviceId={view.serviceId} />;
  }
}

export default function Main(): ReactResult {
  let classes = useStyles();

  return (
    <div className={clsx(classes.outer)}>
      <Suspense fallback={<Loading className={classes.loading} />}>
        <MainContent />
      </Suspense>
    </div>
  );
}
