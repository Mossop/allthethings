import { createStyles, makeStyles } from "@material-ui/core";

import Loading from "../components/Loading";
import Page from "../components/Page";
import type { ReactResult } from "../utils/types";
import { useMaybeView, ViewType } from "../utils/view";
import type { View } from "../utils/view";
import Inbox from "./Inbox";
import LoginDialog from "./LoginDialog";
import NotFound from "./NotFound";
import TaskList from "./TaskList";

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      flex: 1,
    },
  }));

interface PageContentProps {
  view: View;
}

function PageContent({
  view,
}: PageContentProps): ReactResult {
  switch (view.type) {
    case ViewType.Inbox:
      return <Inbox/>;
    case ViewType.TaskList:
      return <TaskList view={view}/>;
    case ViewType.NotFound:
      return <NotFound/>;
  }
}

export default function App(): ReactResult {
  let state = useMaybeView();
  let classes = useStyles();

  if (state === undefined) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (!state) {
    return <Page>
      <LoginDialog/>
    </Page>;
  }

  return <Page>
    <PageContent view={state}/>
  </Page>;
}
